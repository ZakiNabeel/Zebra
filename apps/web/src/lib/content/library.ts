import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_STORIES } from "./seed-stories";
import { storiesForProfile } from "./filter";
import { fetchKidStories } from "@/lib/data/cloud";
import { useStudio } from "@/lib/store/studio";
import type { ChildProfile, Story } from "./types";

/**
 * The single Kid Mode story source. Cloud mode reads through the kid_library()
 * RPC (DB-enforced to published content); local mode applies the same filter to
 * the seed library PLUS any parent-approved studio stories. Either way the
 * storiesForProfile / RPC filter guarantees a child only sees published_*.
 */
export async function loadKidStories(profile: ChildProfile): Promise<Story[]> {
  if (isSupabaseConfigured()) return fetchKidStories(profile.id);
  const local = [...SEED_STORIES, ...useStudio.getState().stories];
  return storiesForProfile(local, profile);
}
