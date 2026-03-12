import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginPostRequestBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const updateUserRequestBodySchema = z.object({
  username: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});
