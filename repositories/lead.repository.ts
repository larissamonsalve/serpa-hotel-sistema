import prisma from '@/lib/prisma';
import { CreateLeadDTO } from '@/schemas/lead.schema';

export class LeadRepository {
  async findByEmail(email: string) {
    return prisma.lead.findUnique({
      where: { email },
    });
  }

  async upsertLead(data: CreateLeadDTO) {
    return prisma.lead.upsert({
      where: { email: data.email },
      update: {
        nome: data.nome,
        whatsapp: data.whatsapp,
      },
      create: {
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
      },
    });
  }
}