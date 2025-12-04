import { z } from 'zod';

export const cofounderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  linkedin: z.string().optional(),
  phone: z.string().optional(),
});

export type Cofounder = {
  name: string;
  email: string;
  role: string;
  linkedin?: string;
  phone?: string;
};

export const companySchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  company_description: z.string().min(50, 'Description must be at least 50 characters').optional().or(z.literal('')),
  company_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  company_location: z.string().optional(),
  founding_date: z.string().optional(),
  company_registered: z.boolean(),
  registration_status: z.enum(['not_started', 'in_progress', 'registered']),
});

export const progressSchema = z.object({
  current_progress: z.string().min(20, 'Please provide more detail about your progress').optional().or(z.literal('')),
  tech_stack: z.string().optional(),
  traction_metrics: z.string().optional(),
});

export const ideaSchema = z.object({
  problem_statement: z.string().min(50, 'Problem statement must be at least 50 characters').optional().or(z.literal('')),
  solution: z.string().min(50, 'Solution must be at least 50 characters').optional().or(z.literal('')),
  competitors: z.string().optional(),
  differentiation: z.string().optional(),
  business_model: z.string().optional(),
});

export const equitySchema = z.object({
  previous_funding: z.string().optional(),
  equity_raised: z.string().optional(),
  current_valuation: z.string().optional(),
});

export const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.string().optional(),
});

export type Cofounder = z.infer<typeof cofounderSchema>;
export type InviteData = z.infer<typeof inviteSchema>;
