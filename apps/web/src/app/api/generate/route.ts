import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { StoryPromptSchema } from "@/lib/ai/prompt";
import { generateStory } from "@/lib/ai/generate";
import { moderateStory } from "@/lib/ai/moderate";

/**
 * Adult-only story generation: structured prompt → generate → moderate.
 * Children never reach this route (it lives behind the PIN-gated parent
 * dashboard, and in cloud mode requires an authenticated parent session). It
 * does NOT publish — it returns a draft + moderation verdict; the client stores
 * it as pending_review for the human approval gate.
 */
export async function POST(request: NextRequest) {
  // In cloud mode, only a signed-in parent may generate.
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServer();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!data.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = StoryPromptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid prompt", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  const draft = await generateStory(input);
  const moderation = await moderateStory(draft);

  return NextResponse.json({
    story: { title: draft.title, coverScene: draft.coverScene, pages: draft.pages, theme: input.theme, source: draft.source },
    moderation,
    prompt: input,
  });
}
