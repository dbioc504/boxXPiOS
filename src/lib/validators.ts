import { z } from 'zod';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .refine((s) => EMAIL_REGEX.test(s), {
        message: 'Invalid email address',
    });

export const normalizeEmail = (s: string)=> s.trim().toLowerCase();

export const isValidEmail = (s: string) => emailSchema.safeParse(s).success;
