/**
 * AI providers are OPTIONAL at runtime — mirrors the Supabase dual-mode pattern.
 * When a provider's keys are absent the pipeline uses a deterministic, $0
 * fallback (template story generator, keyword moderation, browser TTS) so the
 * app builds, tests, and demos with zero keys. When keys are present the real
 * provider activates. The human approval gate is required EITHER way — a
 * provider being live never bypasses adult review.
 *
 * These read server-only secrets, so this module must only be imported from
 * server code (route handlers), never from a client component.
 */

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY ?? "";
export const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION ?? "";

export function isGeminiConfigured(): boolean {
  return GEMINI_API_KEY.length > 0;
}

/** OpenAI Moderation API (free) — the automated pre-filter before human review. */
export function isModerationConfigured(): boolean {
  return OPENAI_API_KEY.length > 0;
}

export function isAzureSpeechConfigured(): boolean {
  return AZURE_SPEECH_KEY.length > 0 && AZURE_SPEECH_REGION.length > 0;
}

/** Which generators/filters are live — surfaced to the parent UI for transparency. */
export function aiStatus() {
  return {
    generator: isGeminiConfigured() ? "gemini" : "template",
    moderation: isModerationConfigured() ? "openai" : "keyword",
    tts: isAzureSpeechConfigured() ? "azure" : "browser",
  } as const;
}
