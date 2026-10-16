import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Simple zero-dependency .env parser
function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...values] = trimmed.split("=");
        if (key && values.length > 0) {
          const val = values.join("=").trim().replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSeed() {
  console.log("=================================================");
  console.log("       INSIGRA REPORTS - SUPABASE SEEDER         ");
  console.log("=================================================\n");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.log("Notice: SUPABASE_SERVICE_ROLE_KEY was not found in .env / .env.local.");
    console.log("To seed the remote database in 1 click, simply copy and run:");
    console.log("  supabase/all-in-one-setup.sql");
    console.log("inside your Supabase SQL Editor.\n");
    console.log("Or add SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> to .env.local to run via CLI.\n");
    process.exit(0);
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Connecting to: ${SUPABASE_URL}`);

  // 1. Create or retrieve Alpha user
  console.log("Provisioning alpha@test.com...");
  let alphaId: string;
  const { data: alphaData, error: alphaErr } = await adminClient.auth.admin.createUser({
    email: "alpha@test.com",
    password: "AlphaTest2026!",
    email_confirm: true,
  });

  if (alphaErr) {
    if (alphaErr.message.includes("already")) {
      const { data: users } = await adminClient.auth.admin.listUsers();
      const existing = users.users.find((u) => u.email === "alpha@test.com");
      alphaId = existing!.id;
    } else {
      throw alphaErr;
    }
  } else {
    alphaId = alphaData.user.id;
  }

  // 2. Create or retrieve Beta user
  console.log("Provisioning beta@test.com...");
  let betaId: string;
  const { data: betaData, error: betaErr } = await adminClient.auth.admin.createUser({
    email: "beta@test.com",
    password: "BetaTest2026!",
    email_confirm: true,
  });

  if (betaErr) {
    if (betaErr.message.includes("already")) {
      const { data: users } = await adminClient.auth.admin.listUsers();
      const existing = users.users.find((u) => u.email === "beta@test.com");
      betaId = existing!.id;
    } else {
      throw betaErr;
    }
  } else {
    betaId = betaData.user.id;
  }

  // 3. Upsert Profiles
  console.log("Linking profiles...");
  await adminClient.from("profiles").upsert([
    { id: alphaId, company_name: "Alpha Ltd" },
    { id: betaId, company_name: "Beta Ltd" },
  ]);

  // 4. Seed Campaign Data
  console.log("Seeding campaign records...");
  await adminClient.from("campaign_data").delete().in("company_name", ["Alpha Ltd", "Beta Ltd"]);

  await adminClient.from("campaign_data").insert([
    { company_name: "Alpha Ltd", channel: "Google", leads: 142 },
    { company_name: "Alpha Ltd", channel: "Meta", leads: 96 },
    { company_name: "Alpha Ltd", channel: "LinkedIn", leads: 61 },
    { company_name: "Alpha Ltd", channel: "Email", leads: 44 },
    { company_name: "Alpha Ltd", channel: "Organic", leads: 78 },
    { company_name: "Beta Ltd", channel: "Google", leads: 118 },
    { company_name: "Beta Ltd", channel: "Meta", leads: 133 },
    { company_name: "Beta Ltd", channel: "LinkedIn", leads: 52 },
    { company_name: "Beta Ltd", channel: "Email", leads: 39 },
    { company_name: "Beta Ltd", channel: "Organic", leads: 84 },
  ]);

  console.log("\n[SUCCESS] Supabase database seeded successfully!");
}

runSeed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
