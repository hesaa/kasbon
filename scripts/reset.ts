import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { loadEnvFiles } from "./load-env";
import { getSeedAccounts } from "./seed-data";

loadEnvFiles();

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawUrl || !rawKey) {
  console.error(
    "❌ ERROR: Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are missing."
  );
  process.exit(1);
}

const url: string = rawUrl;
const key: string = rawKey;

async function resetAllData() {
  console.log("🧹 Resetting debt transaction data in Supabase:", url);

  // Method 1: If Service Role Key is available, perform full DB table wipe
  if (serviceRoleKey) {
    console.log("🔑 SUPABASE_SERVICE_ROLE_KEY detected. Performing total table wipe...");
    const adminClient = createClient<Database>(url, serviceRoleKey);
    const { error } = await adminClient.from("debts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error("❌ Total table wipe failed:", error.message);
      process.exit(1);
    }
    console.log("🎉 Complete database wipe successful! All records in public.debts removed.");
    return;
  }

  // Method 2: Authenticate as all configured seed users and clear their rows
  console.log("ℹ️ Clearing data for all configured seed accounts...");
  const supabase = createClient<Database>(url, key);
  const seedAccounts = getSeedAccounts();

  for (const account of seedAccounts) {
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.pass,
    });

    if (signInData?.session) {
      const userClient = createClient<Database>(url, key, {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`,
          },
        },
      });

      const { error } = await userClient
        .from("debts")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        console.error(`❌ Error clearing debts for ${account.email}:`, error.message);
      } else {
        console.log(`✅ Cleared all debts for seed account ${account.email}`);
      }
    }
  }

  console.log("\n🎉 Seed accounts reset complete!");
  console.log("💡 Tip: Add SUPABASE_SERVICE_ROLE_KEY to your .env if you wish to perform an unconditional total table wipe across all arbitrary users.");
}

resetAllData().catch((err) => {
  console.error("Fatal error during database reset:", err);
  process.exit(1);
});
