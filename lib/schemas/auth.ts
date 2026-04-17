import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Mínimo 3 caracteres")
  .max(20, "Máximo 20 caracteres")
  .regex(/^[a-z0-9_-]+$/, "Solo letras minúsculas, números, guión y guión bajo");

export const emailSchema = z.string().trim().toLowerCase().email("Email no válido");

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Introduce tu contraseña"),
});

export const signUpSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
