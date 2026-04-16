import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email no válido"),
  next: z.string().startsWith("/").optional(),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
