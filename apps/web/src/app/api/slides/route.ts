import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SlidesInputSchema } from "@/lib/school/slides-input";
import { generateSlides } from "@/lib/ai/slides";
import { moderateText } from "@/lib/ai/moderate";

/**
 * Adult-only presentation generation (teacher tool). Same posture as
 * /api/generate: in cloud mode it requires a signed-in account; the assembled
 * deck text is run through the moderation screen before being returned. The
 * teacher then edits and presents — they are the live reviewer.
 */
export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServer();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = SlidesInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const { slides, source } = await generateSlides(parsed.data);
  const text = [
    parsed.data.topic,
    ...slides.flatMap((s) => [s.title.en, s.title.ur, ...s.bullets.flatMap((b) => [b.en, b.ur])]),
  ].join("\n");
  const moderation = await moderateText(text);

  return NextResponse.json({ slides, source, moderation });
}
