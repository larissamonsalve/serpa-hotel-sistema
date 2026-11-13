import { z } from 'zod';

export const createLeadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome não pode ultrapassar 100 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Informe um endereço de e-mail válido.'),
  whatsapp: z
    .string()
    .trim()
    .transform((val) => val.replace(/\D/g, '')) 
    .refine((val) => val.length >= 10 && val.length <= 13, {
      message: 'O WhatsApp deve conter DDD e número válido (ex: 92999999999).',
    }),
});

export type CreateLeadDTO = z.infer<typeof createLeadSchema>;