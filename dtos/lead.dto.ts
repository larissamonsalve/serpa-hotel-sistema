import { z } from 'zod';
import { createLeadSchema } from '@/schemas/lead.schema';

export type CreateLeadDTO = z.infer<typeof createLeadSchema>;

export interface LeadResponseDTO {
  id: string;
  nome: string;
  email: string;
  emailValidado: boolean;
}