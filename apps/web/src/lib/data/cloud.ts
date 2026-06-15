"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { AgeBand, ChildProfile, Family, Story, StoryLang } from "@/lib/content/types";

// Row shapes (we don't generate Supabase types in this sprint).
type FamilyRow = { name: string; pin_hash: string; pin_salt: string };
type ProfileRow = { id: string; name: string; age_band: AgeBand; language: StoryLang; avatar: string };

function profileFromRow(r: ProfileRow): ChildProfile {
  return { id: r.id, name: r.name, ageBand: r.age_band, language: r.language, avatar: r.avatar };
}

/**
 * Cloud data operations (Supabase). All run under the signed-in parent's
 * session, so RLS scopes everything to their family. Kid Mode reads stories
 * through the kid_library() RPC, which structurally cannot return drafts.
 */

function client() {
  const c = getSupabaseBrowser();
  if (!c) throw new Error("Supabase not configured");
  return c;
}

// ---- Auth ----
export async function currentUser() {
  const { data } = await client().auth.getUser();
  return data.user;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await client().auth.signUp({ email, password });
  if (error) throw error;
  return { hasSession: !!data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await client().auth.signOut();
}

// ---- Family & profiles ----
export async function getFamily(): Promise<Family | null> {
  const { data, error } = await client()
    .from("families")
    .select("name, pin_hash, pin_salt")
    .maybeSingle();
  if (error) throw error;
  const row = data as FamilyRow | null;
  if (!row) return null;
  return { name: row.name, pinHash: row.pin_hash, pinSalt: row.pin_salt };
}

export async function createFamilyRow(
  family: Family,
): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await client().from("families").insert({
    owner: user.id,
    name: family.name,
    pin_hash: family.pinHash,
    pin_salt: family.pinSalt,
  });
  if (error) throw error;
}

export async function listProfiles(): Promise<ChildProfile[]> {
  const { data, error } = await client()
    .from("child_profiles")
    .select("id, name, age_band, language, avatar")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(profileFromRow);
}

export async function addProfileRow(p: Omit<ChildProfile, "id">): Promise<ChildProfile> {
  const { data: fam } = await client().from("families").select("id").maybeSingle();
  const family = fam as { id: string } | null;
  if (!family) throw new Error("No family row");
  const { data, error } = await client()
    .from("child_profiles")
    .insert({
      family_id: family.id,
      name: p.name,
      age_band: p.ageBand,
      language: p.language,
      avatar: p.avatar,
    })
    .select("id, name, age_band, language, avatar")
    .single();
  if (error) throw error;
  return profileFromRow(data as ProfileRow);
}

export async function removeProfileRow(id: string): Promise<void> {
  const { error } = await client().from("child_profiles").delete().eq("id", id);
  if (error) throw error;
}

// ---- Stories ----
type StoryRow = {
  id: string;
  title: Story["title"];
  theme: Story["theme"];
  age_bands: Story["ageBands"];
  status: Story["status"];
  cover_scene: Story["coverScene"];
  profile_id: string | null;
  pages: Story["pages"];
};

function rowToStory(r: StoryRow): Story {
  return {
    id: r.id,
    title: r.title,
    theme: r.theme,
    ageBands: r.age_bands,
    status: r.status,
    coverScene: r.cover_scene,
    profileId: r.profile_id ?? undefined,
    pages: r.pages,
  };
}

/** Kid Mode's only story fetch — DB-enforced to published content the profile may see. */
export async function fetchKidStories(profileId: string): Promise<Story[]> {
  const { data, error } = await client().rpc("kid_library", { p_profile_id: profileId });
  if (error) throw error;
  return ((data ?? []) as StoryRow[]).map(rowToStory);
}

export async function libraryCount(): Promise<number> {
  const { count, error } = await client()
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("status", "published_library");
  if (error) throw error;
  return count ?? 0;
}
