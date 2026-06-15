// Seed the curated library into Supabase (idempotent upsert).
// Run: node --experimental-strip-types --env-file=.env.local scripts/seed-library.ts
import { createClient } from "@supabase/supabase-js";
import { SEED_STORIES } from "../src/lib/content/seed-stories.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  console.error("✗ Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { persistSession: false } });

// Library content is human-reviewed by Zebra → it legitimately carries an
// approval timestamp + moderation verdict, satisfying the approval-gate trigger.
const rows = SEED_STORIES.map((s) => ({
  id: s.id,
  title: s.title,
  theme: s.theme,
  age_bands: s.ageBands,
  status: "published_library",
  cover_scene: s.coverScene,
  pages: s.pages,
  approved_at: new Date().toISOString(),
  moderation_verdict: { source: "seed", reviewed: "human", flags: [] },
}));

const { error } = await admin.from("stories").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("✗ Seed failed:", error.message);
  process.exit(1);
}

const { count } = await admin
  .from("stories")
  .select("id", { count: "exact", head: true })
  .eq("status", "published_library");
console.log(`✓ Seeded ${rows.length} stories. Library now has ${count} published stories.`);
