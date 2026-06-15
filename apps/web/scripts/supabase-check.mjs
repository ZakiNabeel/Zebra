// Connectivity smoke test. Run: node --env-file=.env.local scripts/supabase-check.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY");
  process.exit(1);
}

console.log("URL:", url);

// 1) Auth health (works even before any tables exist)
const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon } });
console.log(res.ok ? "✓ Auth endpoint reachable" : `✗ Auth health ${res.status}`);

// 2) Does the 'stories' table exist yet? (tells us if the migration is applied)
const admin = createClient(url, service ?? anon, {
  auth: { persistSession: false },
});
const { error } = await admin.from("stories").select("id").limit(1);
if (!error) {
  console.log("✓ 'stories' table exists — migration is applied");
} else if (/relation .* does not exist|Could not find the table/i.test(error.message)) {
  console.log("• 'stories' table not found yet — apply supabase/migrations/0001_init.sql");
} else {
  console.log("? stories query error:", error.message);
}
