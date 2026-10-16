const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://zjktdfaqklcbepotqpur.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqa3RkZmFxa2xjYmVwb3RxcHVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMTc1MjAsImV4cCI6MjEwNzY5MzUyMH0.xnGXUbW6IqW3S4oPb1CtK2d4IkmZPj0OcslUfzMpAKw";

async function verify() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("=== CHECKING ALPHA LTD ===");
  const alpha = await supabase.auth.signInWithPassword({
    email: "alpha@test.com",
    password: "AlphaTest2026!"
  });

  if (alpha.data?.session) {
    const alphaClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: { headers: { Authorization: "Bearer " + alpha.data.session.access_token } }
    });
    const profile = await alphaClient.from("profiles").select("*");
    const campaigns = await alphaClient.from("campaign_data").select("*");
    console.log("Alpha Profile:", profile.data);
    console.log("Alpha Campaigns Count:", campaigns.data?.length);
    console.log("Alpha Total Leads:", campaigns.data?.reduce((s, r) => s + r.leads, 0));
  }

  console.log("\n=== CHECKING BETA LTD ===");
  const beta = await supabase.auth.signInWithPassword({
    email: "beta@test.com",
    password: "BetaTest2026!"
  });

  if (beta.data?.session) {
    const betaClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: { headers: { Authorization: "Bearer " + beta.data.session.access_token } }
    });
    const profile = await betaClient.from("profiles").select("*");
    const campaigns = await betaClient.from("campaign_data").select("*");
    console.log("Beta Profile:", profile.data);
    console.log("Beta Campaigns Count:", campaigns.data?.length);
    console.log("Beta Total Leads:", campaigns.data?.reduce((s, r) => s + r.leads, 0));
  }
}

verify();
