import { z } from 'zod';

export const invitationRequestSchema = z.object({
  groomName: z.string().trim().min(1).max(120),
  brideName: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().default(''),
  weddingDate: z.string().optional().default(''),
  venue: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  style: z.string().trim().max(120).optional().default(''),
  notes: z.string().trim().max(3000).optional().default(''),
}).superRefine((data, context) => {
  if (data.weddingDate && Number.isNaN(Date.parse(data.weddingDate))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['weddingDate'], message: 'Enter a valid wedding date.' });
  }
});

export const invitationRequestStatusSchema = z.enum(['pending', 'reviewing', 'completed', 'declined']);
