import { z } from 'zod';

export const nameSchema = z.string().trim().min(1).max(100);
export const emailSchema = z.string().trim().email().min(1).max(100);
export const passwordSchema = z.string().trim().min(8).max(100);
export const userAgentSchema = z.string().trim().optional();
export const ipSchema = z.string().trim().ip();
export const verificationCodeSchema = z.string().trim().min(1).max(25);

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

export const verificationEmailSchema = z.object({
  code: verificationCodeSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
    verificationCode: verificationCodeSchema,
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: 'Passwords must match. Please try again.',
    path: ['confirmPassword'],
  });
