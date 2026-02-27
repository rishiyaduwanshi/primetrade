import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50).optional(),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Task ────────────────────────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional().default(''),
  status: z.enum(['todo', 'in-progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required to update',
});

// ── Admin ───────────────────────────────────────────────────────────────────
export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});
