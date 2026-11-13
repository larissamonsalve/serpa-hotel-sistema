import { LeadRepository } from '@/repositories/lead.repository';
import { CreateLeadDTO, LeadResponseDTO } from '@/dtos/lead.dto';

export class LeadService {
  private leadRepository: LeadRepository;

  constructor() {
    this.leadRepository = new LeadRepository();
  }

  async registrarLead(data: CreateLeadDTO): Promise<LeadResponseDTO> {
    const lead = await this.leadRepository.upsertLead(data);

    return {
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      emailValidado: lead.emailValidado,
    };
  }
}