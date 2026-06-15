import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_STORIES } from "./seed-stories";
import { storiesForProfile } from "./filter";
import { fetchKidStories } from "@/lib/data/cloud";
import type { ChildProfile, Story } from "./types";

/**
 * The single Kid Mode story source. Cloud mode reads through the kid_library()
 * RPC (DB-enforced to published content); local mode applies the same filter to
 * the seed library. Either way, a child only ever receives published_* content.
 */
export async function loadKidStories(profile: ChildProfile): Promise<Story[]> {
  if (isSupabaseConfigured()) return fetchKidStories(profile.id);
  return storiesForProfile(SEED_STORIES, profile);
}
