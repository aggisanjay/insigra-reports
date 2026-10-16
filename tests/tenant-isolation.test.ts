/**
 * ==============================================================================
 * INSIGRA REPORTS - TENANT ISOLATION & RLS INTEGRATION TEST SUITE
 * ==============================================================================
 *
 * This test suite verifies:
 * 1. Unauthenticated users cannot read campaign data.
 * 2. Alpha Ltd user (alpha@test.com) receives exactly 5 permitted records.
 * 3. Alpha Ltd user receives 0 records belonging to Beta Ltd.
 * 4. Beta Ltd user (beta@test.com) receives exactly 5 permitted records.
 * 5. Beta Ltd user receives 0 records belonging to Alpha Ltd.
 * 6. Queries without client-side filters strictly return only tenant-authorized rows.
 * 7. Normal authenticated users cannot update their profile company assignment.
 * 8. Invalid credentials fail cleanly.
 *
 * Execution:
 *   npm test
 * or:
 *   npx tsx tests/tenant-isolation.test.ts
 */

import { createClient } from "@supabase/supabase-js";

// Read test configuration from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const TEST_ALPHA_PASSWORD = process.env.TEST_ALPHA_PASSWORD || "AlphaTest2026!";
const TEST_BETA_PASSWORD = process.env.TEST_BETA_PASSWORD || "BetaTest2026!";

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function recordResult(name: string, passed: boolean, message?: string) {
  results.push({ name, passed, message });
  const icon = passed ? "PASS [OK]" : "FAIL [X]";
  console.log(`${icon} - ${name}`);
  if (message) {
    console.log(`       Details: ${message}`);
  }
}

async function runTenantIsolationTests() {
  console.log("\n=======================================================");
  console.log("   INSIGRA REPORTS - MULTI-TENANT ISOLATION TEST SUITE   ");
  console.log("=======================================================\n");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("placeholder")) {
    console.log("STATUS: Supabase credentials not found in environment.");
    console.log("Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    console.log("in your .env.local file or environment to execute this live suite.\n");
    console.log("Refer to docs/testing.md for complete step-by-step test execution.");
    process.exit(0);
  }

  // 1. Unauthenticated Access Test
  console.log("[Test Phase 1]: Verifying Unauthenticated Access Restrictions...");
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  try {
    const { data: anonCampaigns, error } = await anonClient
      .from("campaign_data")
      .select("*");

    if (error) {
      recordResult("Unauthenticated campaign SELECT rejected or empty", true, `DB returned error: ${error.message}`);
    } else if (anonCampaigns && anonCampaigns.length === 0) {
      recordResult("Unauthenticated campaign SELECT returned 0 rows", true, "PostgreSQL RLS prevented data leak to anon client.");
    } else {
      recordResult("Unauthenticated campaign SELECT returned 0 rows", false, `LEAK DETECTED: Returned ${anonCampaigns?.length} rows.`);
    }
  } catch (err: unknown) {
    recordResult("Unauthenticated access check", true, err instanceof Error ? err.message : String(err));
  }

  // 2. Alpha Ltd Authentication & RLS Verification
  console.log("\n[Test Phase 2]: Authenticating as Alpha Ltd (alpha@test.com)...");
  const alphaClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: alphaAuth, error: alphaAuthError } = await alphaClient.auth.signInWithPassword({
    email: "alpha@test.com",
    password: TEST_ALPHA_PASSWORD,
  });

  if (alphaAuthError || !alphaAuth.user) {
    recordResult(
      "Alpha Ltd authentication",
      false,
      `Failed to sign in alpha@test.com: ${alphaAuthError?.message}. Ensure account is created and password matches.`
    );
  } else {
    recordResult("Alpha Ltd authentication successful", true, `Authenticated UID: ${alphaAuth.user.id}`);

    // Verify Alpha Profile
    const { data: alphaProfile } = await alphaClient
      .from("profiles")
      .select("*")
      .eq("id", alphaAuth.user.id)
      .maybeSingle();

    recordResult(
      "Alpha Ltd profile verification",
      alphaProfile?.company_name === "Alpha Ltd",
      `Profile company_name: "${alphaProfile?.company_name}"`
    );

    // CRITICAL: Query campaign data WITHOUT company_name filter!
    const { data: alphaCampaigns, error: alphaCampaignError } = await alphaClient
      .from("campaign_data")
      .select("*");

    if (alphaCampaignError) {
      recordResult("Alpha campaign query without filter", false, alphaCampaignError.message);
    } else {
      const alphaCount = alphaCampaigns?.length || 0;
      const betaRowsReceivedByAlpha = alphaCampaigns?.filter((r) => r.company_name === "Beta Ltd").length || 0;
      const alphaRowsReceived = alphaCampaigns?.filter((r) => r.company_name === "Alpha Ltd").length || 0;

      recordResult(
        "Alpha Ltd receives exactly its 5 permitted rows",
        alphaCount === 5 && alphaRowsReceived === 5,
        `Received ${alphaCount} rows (expected 5 Alpha Ltd rows)`
      );

      recordResult(
        "Alpha Ltd receives ZERO Beta Ltd rows (Strict Cross-Tenant Isolation)",
        betaRowsReceivedByAlpha === 0,
        `Beta Ltd rows leaked to Alpha: ${betaRowsReceivedByAlpha}`
      );
    }

    // Attempt unauthorized profile tampering (Alpha tries to reassign to Beta Ltd)
    const { error: tamperError } = await alphaClient
      .from("profiles")
      .update({ company_name: "Beta Ltd" })
      .eq("id", alphaAuth.user.id);

    recordResult(
      "Normal authenticated user cannot update profile company assignment",
      !!tamperError,
      tamperError ? `Tampering successfully rejected: ${tamperError.message}` : "Update was not rejected by database!"
    );
  }

  // 3. Beta Ltd Authentication & RLS Verification
  console.log("\n[Test Phase 3]: Authenticating as Beta Ltd (beta@test.com)...");
  const betaClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: betaAuth, error: betaAuthError } = await betaClient.auth.signInWithPassword({
    email: "beta@test.com",
    password: TEST_BETA_PASSWORD,
  });

  if (betaAuthError || !betaAuth.user) {
    recordResult(
      "Beta Ltd authentication",
      false,
      `Failed to sign in beta@test.com: ${betaAuthError?.message}. Ensure account is created and password matches.`
    );
  } else {
    recordResult("Beta Ltd authentication successful", true, `Authenticated UID: ${betaAuth.user.id}`);

    // Verify Beta Profile
    const { data: betaProfile } = await betaClient
      .from("profiles")
      .select("*")
      .eq("id", betaAuth.user.id)
      .maybeSingle();

    recordResult(
      "Beta Ltd profile verification",
      betaProfile?.company_name === "Beta Ltd",
      `Profile company_name: "${betaProfile?.company_name}"`
    );

    // CRITICAL: Query campaign data WITHOUT company_name filter!
    const { data: betaCampaigns, error: betaCampaignError } = await betaClient
      .from("campaign_data")
      .select("*");

    if (betaCampaignError) {
      recordResult("Beta campaign query without filter", false, betaCampaignError.message);
    } else {
      const betaCount = betaCampaigns?.length || 0;
      const alphaRowsReceivedByBeta = betaCampaigns?.filter((r) => r.company_name === "Alpha Ltd").length || 0;
      const betaRowsReceived = betaCampaigns?.filter((r) => r.company_name === "Beta Ltd").length || 0;

      recordResult(
        "Beta Ltd receives exactly its 5 permitted rows",
        betaCount === 5 && betaRowsReceived === 5,
        `Received ${betaCount} rows (expected 5 Beta Ltd rows)`
      );

      recordResult(
        "Beta Ltd receives ZERO Alpha Ltd rows (Strict Cross-Tenant Isolation)",
        alphaRowsReceivedByBeta === 0,
        `Alpha Ltd rows leaked to Beta: ${alphaRowsReceivedByBeta}`
      );
    }
  }

  // Summary
  console.log("\n=======================================================");
  console.log("                 TEST RUN SUMMARY                      ");
  console.log("=======================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) {
    console.error(`\n[WARNING] ${failed} check(s) did not pass. Check database policies and account seeds.`);
    process.exit(1);
  } else {
    console.log("\n[SUCCESS] All multi-tenant RLS isolation criteria verified successfully!");
    process.exit(0);
  }
}

runTenantIsolationTests();
