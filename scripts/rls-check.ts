import { createClient } from "@supabase/supabase-js";
import { loadEnvFiles } from "./load-env";

loadEnvFiles();


const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!rawUrl || !rawKey) {
  console.error(
    "❌ ERROR: Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing."
  );
  console.error(
    "Please configure your .env or .env.local file with valid Supabase credentials before running the RLS check."
  );
  process.exit(1);
}

const url: string = rawUrl;
const key: string = rawKey;


const emailA = process.env.USER_A_EMAIL || "usera@kasbon.test";
const passA = process.env.USER_A_PASSWORD || "Password123!";
const emailB = process.env.USER_B_EMAIL || "userb@kasbon.test";
const passB = process.env.USER_B_PASSWORD || "Password123!";


async function runRlsCheck() {
  console.log(`🔍 Starting Kasbon RLS Leak Verification against ${url}...`);

  async function getClientForUser(email: string, pass: string) {
    const client = createClient(url, key);
    await client.auth.signUp({ email, password: pass }).catch(() => null);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error || !data.session) {
      throw new Error(`Auth failed for ${email}: ${error?.message}`);
    }
    return {
      client,
      token: data.session.access_token,
      userId: data.user.id,
    };
  }

  const userA = await getClientForUser(emailA, passA);
  console.log(`✅ Check 1: Authenticated User A (${userA.userId})`);

  const userB = await getClientForUser(emailB, passB);
  console.log(`✅ Check 2: Authenticated User B (${userB.userId})`);

  const initResB = await fetch(`${url}/rest/v1/rpc/debt_summary`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
    },
  });
  const initSummaryB = await initResB.json();
  const initOpenCountB = Number(initSummaryB?.[0]?.open_count || 0);

  const res3 = await fetch(`${url}/rest/v1/debts`, {

    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userA.token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      type: "owed_to_me",
      counterpart_name: "RLS Test Person",
      amount: 100000,
      debt_date: "2026-10-06",
    }),
  });
  const rowsA = await res3.json();
  const rowIdA = rowsA?.[0]?.id;
  if (!rowIdA) {
    throw new Error(`Check 3 failed: User A could not create debt row. Response: ${JSON.stringify(rowsA)}`);
  }
  console.log(`✅ Check 3: User A created debt row (${rowIdA})`);

  const res4 = await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
    },
  });
  const readB = await res4.json();
  if (Array.isArray(readB) && readB.length > 0) {
    throw new Error(`Check 4 failed: User B was able to read User A's row: ${JSON.stringify(readB)}`);
  }
  console.log(`✅ Check 4: User B cannot read User A's row by ID (returned [])`);

  const res5 = await fetch(`${url}/rest/v1/debts`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
    },
  });
  const listB: Record<string, unknown>[] = await res5.json();
  const containsA = listB.some((row) => row.id === rowIdA);
  if (containsA) {
    throw new Error(`Check 5 failed: User B list response contains User A's row`);
  }
  console.log(`✅ Check 5: User B listing debts contains none of User A's rows`);

  const res6 = await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ amount: 1 }),
  });
  const patchB = await res6.json();
  if (Array.isArray(patchB) && patchB.length > 0) {
    throw new Error(`Check 6 failed: User B patch succeeded: ${JSON.stringify(patchB)}`);
  }
  const readA = await (
    await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${userA.token}`,
      },
    })
  ).json();
  if (readA?.[0]?.amount !== 100000) {
    throw new Error(`Check 6 failed: User A's row amount was modified to ${readA?.[0]?.amount}`);
  }
  console.log(`✅ Check 6: User B cannot PATCH User A's row (amount unchanged at 100000)`);

  const res7 = await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
      Prefer: "return=representation",
    },
  });
  const deleteB = await res7.json();
  if (Array.isArray(deleteB) && deleteB.length > 0) {
    throw new Error(`Check 7 failed: User B delete returned representation: ${JSON.stringify(deleteB)}`);
  }
  const readAAgain = await (
    await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${userA.token}`,
      },
    })
  ).json();
  if (!readAAgain?.[0]?.id) {
    throw new Error(`Check 7 failed: User A's row was deleted by User B!`);
  }
  console.log(`✅ Check 7: User B cannot DELETE User A's row (row still exists)`);

  const res8 = await fetch(`${url}/rest/v1/debts`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userA.userId,
      type: "owed_to_me",
      counterpart_name: "Impersonated",
      amount: 50000,
      debt_date: "2026-10-06",
    }),
  });
  if (res8.status === 201 || res8.status === 200) {
    throw new Error(`Check 8 failed: User B created row under User A's user_id!`);
  }
  console.log(`✅ Check 8: User B inserting with User A's user_id is rejected by RLS WITH CHECK`);

  const res9create = await fetch(`${url}/rest/v1/debts`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      type: "i_owe",
      counterpart_name: "User B Debt",
      amount: 20000,
      debt_date: "2026-10-06",
    }),
  });
  const rowB = await res9create.json();
  const rowIdB = rowB?.[0]?.id;

  await fetch(`${url}/rest/v1/debts?id=eq.${rowIdB}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userA.userId }),
  });

  const readRowB = await (
    await fetch(`${url}/rest/v1/debts?id=eq.${rowIdB}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${userB.token}`,
      },
    })
  ).json();
  if (readRowB?.[0]?.user_id === userA.userId) {
    throw new Error(`Check 9 failed: User B reassigned row user_id to User A!`);
  }
  console.log(`✅ Check 9: User B cannot reassign row ownership to User A`);

  await fetch(`${url}/rest/v1/debts?id=eq.${rowIdB}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
    },
  });

  const res10 = await fetch(`${url}/rest/v1/debts`, {
    headers: {
      apikey: key,
    },
  });
  if (res10.status === 200) {
    throw new Error(`Check 10 failed: Anonymous request returned 200 OK`);
  }
  console.log(`✅ Check 10: Anonymous request to /rest/v1/debts is rejected (${res10.status})`);

  const res11 = await fetch(`${url}/rest/v1/rpc/debt_summary`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userB.token}`,
    },
  });
  const summaryB = await res11.json();
  const openCount = Number(summaryB?.[0]?.open_count || 0);
  if (openCount !== initOpenCountB) {
    throw new Error(`Check 11 failed: debt_summary for User B returned open_count = ${openCount} (expected ${initOpenCountB})`);
  }
  console.log(`✅ Check 11: RPC debt_summary returns only authenticated caller's totals`);


  const res12 = await fetch(`${url}/rest/v1/debts?id=eq.${rowIdA}`, {
    method: "DELETE",
    headers: {
      apikey: key,
      Authorization: `Bearer ${userA.token}`,
      Prefer: "return=representation",
    },
  });
  const cleanA = await res12.json();
  if (cleanA?.[0]?.id !== rowIdA) {
    throw new Error(`Check 12 failed: Could not delete User A's test row`);
  }
  console.log(`✅ Check 12: User A successfully cleaned up test row`);

  console.log("🎉 ALL 12 RLS CHECKS PASSED SUCCESSFULLY!");
}

runRlsCheck().catch((err) => {
  console.error("❌ RLS Verification Error:", err.message || err);
  process.exit(1);
});
