import { z } from 'zod';

const requiredField = 'Please fill in all fields.';

export const loginSchema = z.object({
    email: z.string().min(1, requiredField),
    password: z.string().min(1, requiredField),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        name: z.string().min(1, requiredField),
        email: z.email('Please enter a valid email address.'),
        password: z.string().min(8, 'Password must be at least 8 characters.'),
        confirmPassword: z.string().min(1, requiredField),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    });

export type RegisterValues = z.infer<typeof registerSchema>;
