import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { loadEnvFiles } from "./load-env";
import { getSeedAccounts } from "./seed-data";

loadEnvFiles();

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!rawUrl || !rawKey) {
  console.error(
    "❌ ERROR: Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing."
  );
  console.error(
    "Please configure your .env or .env.local file with valid Supabase credentials before running the seeder."
  );
  process.exit(1);
}

const url: string = rawUrl;
const key: string = rawKey;

const supabase = createClient<Database>(url, key);

type DebtInsert = Database["public"]["Tables"]["debts"]["Insert"];

async function seed() {
  console.log("🌱 Starting Kasbon multi-user database seeder against:", url);
  const seedAccounts = getSeedAccounts();
  let totalDebtsSeeded = 0;

  for (const account of seedAccounts) {
    console.log(`\n🔐 Authenticating seed user: ${account.email}...`);

    await supabase.auth.signUp({ email: account.email, password: account.pass }).catch(() => null);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.pass,
    });

    if (signInError || !signInData.user || !signInData.session) {
      console.error(`❌ Authentication failed for ${account.email}:`, signInError?.message);
      continue;
    }

    const userId = signInData.user.id;
    const accessToken = signInData.session.access_token;
    const userClient = createClient<Database>(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Clean existing debts for an idempotent seed run
    await userClient.from("debts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const formattedDebts: DebtInsert[] = account.debts.map((d) => {
      const debtDate = new Date(Date.now() - d.daysAgo * 86400000).toISOString().split("T")[0]!;
      const dueDate = d.dueDaysAhead
        ? new Date(Date.now() + d.dueDaysAhead * 86400000).toISOString().split("T")[0]!
        : null;
      const settledAt = d.isSettled ? new Date().toISOString() : null;

      return {
        user_id: userId,
        type: d.type,
        counterpart_name: d.counterpart_name,
        amount: d.amount,
        note: d.note,
        debt_date: debtDate,
        due_date: dueDate,
        settled_at: settledAt,
      };
    });

    console.log(`📝 Inserting ${formattedDebts.length} sample transactions for ${account.email}...`);
    const { data: inserted, error: insertError } = await userClient
      .from("debts")
      .insert(formattedDebts)
      .select();

    if (insertError) {
      console.error(`❌ Insertion failed for ${account.email}:`, insertError.message);
    } else {
      totalDebtsSeeded += inserted.length;
      console.log(`✅ Seeded ${inserted.length} transactions for ${account.email}`);
    }
  }

  console.log("\n=========================================");
  console.log(`🎉 Successfully seeded ${seedAccounts.length} users and ${totalDebtsSeeded} debt transactions!`);
  console.log("=========================================");
  for (const acc of seedAccounts) {
    console.log(`Email: ${acc.email.padEnd(24)} Password: ${acc.pass}`);
  }
  console.log("=========================================");
}

seed().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
