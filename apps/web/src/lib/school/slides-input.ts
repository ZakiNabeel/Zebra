import { z } from "zod";
import { AgeBandSchema, LangSchema } from "@/lib/content/types";

/** Structured input for the presentation maker (no secrets — importable anywhere). */
export const SlidesInputSchema = z.object({
  topic: z.string().trim().min(1).max(80),
  ageBand: AgeBandSchema,
  lang: LangSchema,
  count: z.number().int().min(4).max(10).default(6),
});
export type SlidesInput = z.infer<typeof SlidesInputSchema>;
