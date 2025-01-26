import { z } from 'zod';

export const nameSchema = z.string().trim().min(1).max(100);
export const emailSchema = z.string().trim().email().min(1).max(100);
export const passwordSchema = z.string().trim().min(8).max(100);
export const userAgentSchema = z.string().optional();
export const ipSchema = z.string().ip();

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    ip: ipSchema,
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: 'Passwords must match. Please try again.',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
  ip: ipSchema,
});

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});
