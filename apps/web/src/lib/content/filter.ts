import type { ChildProfile, Story } from "./types";

/**
 * Local-mode equivalent of the Supabase RLS policy: a child profile sees
 * ONLY published content, scoped to its age band. Never widen this without
 * updating the matching RLS policy and the safety tests.
 */
export function storiesForProfile(stories: Story[], profile: ChildProfile): Story[] {
  return stories.filter((story) => {
    const published =
      story.status === "published_library" ||
      (story.status === "published_profile" && story.profileId === profile.id);
    if (!published) return false;
    return story.ageBands.includes(profile.ageBand);
  });
}
