import { z } from 'zod';

const nameSchema = z.string().min(1).max(100);
export const emailSchema = z.string().email().min(1).max(100);
const passwordSchema = z.string().min(8).max(100);
const confirmPasswordSchema = z.string().min(8).max(100);
const userAgentSchema = z.string().optional();
const ipSchema = z.string().ip();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: userAgentSchema,
  ip: ipSchema,
});

export const registerSchema = loginSchema
  .extend({
    name: nameSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verificationCodeSchema = z.string().min(1).max(24);

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  verificationCode: verificationCodeSchema,
});
