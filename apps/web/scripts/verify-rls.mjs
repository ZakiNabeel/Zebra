// Proves the safety invariant at the DATABASE level:
//   1. The approval-gate trigger refuses to publish without moderation+approval.
//   2. An unauthenticated client cannot read unpublished content.
// Run: node --env-file=.env.local scripts/verify-rls.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, service, { auth: { persistSession: false } });
const publicClient = createClient(url, anon, { auth: { persistSession: false } });

let pass = true;
const ok = (m) => console.log("  ✓", m);
const bad = (m) => {
  console.log("  ✗", m);
  pass = false;
};

const DRAFT_ID = "__rls_test_draft__";
const SNEAKY_ID = "__rls_test_sneaky__";

// 1) The trigger must reject a "published" row with no approval/moderation.
console.log("Trigger: refuse to publish without approval + moderation");
{
  const { error } = await admin.from("stories").insert({
    id: SNEAKY_ID,
    title: { en: "x", ur: "x" },
    theme: "sharing",
    age_bands: ["3-5"],
    status: "published_library", // but no approved_at / moderation_verdict
    pages: [{ text: { en: "x", ur: "x" }, art: { scene: "zee" } }],
  });
  if (error && /SAFETY/.test(error.message)) ok("blocked unapproved publish: " + error.message);
  else bad("trigger did NOT block an unapproved publish");
}

// 2) Insert a genuine DRAFT (allowed), then confirm the public client can't read it.
console.log("RLS: unauthenticated client cannot read a draft");
{
  await admin.from("stories").delete().eq("id", DRAFT_ID);
  const { error: insErr } = await admin.from("stories").insert({
    id: DRAFT_ID,
    title: { en: "secret draft", ur: "خفیہ" },
    theme: "honesty",
    age_bands: ["3-5"],
    status: "draft",
    pages: [{ text: { en: "secret", ur: "خفیہ" }, art: { scene: "zee" } }],
  });
  if (insErr) bad("could not insert draft as admin: " + insErr.message);

  const { data } = await publicClient.from("stories").select("id").eq("id", DRAFT_ID);
  if (!data || data.length === 0) ok("public client got 0 rows for the draft");
  else bad("LEAK: public client could read a draft!");

  // published library IS publicly readable (it's curated + safe)
  const { data: lib } = await publicClient
    .from("stories")
    .select("id")
    .eq("status", "published_library");
  ok(`public client sees ${lib?.length ?? 0} published_library stories`);

  await admin.from("stories").delete().eq("id", DRAFT_ID);
  await admin.from("stories").delete().eq("id", SNEAKY_ID);
}

console.log(pass ? "\n✓ ALL SAFETY CHECKS PASSED" : "\n✗ SAFETY CHECK FAILED");
process.exit(pass ? 0 : 1);
