import { LeadService } from '@/services/lead.service';
import { LeadRepository } from '@/repositories/lead.repository';

jest.mock('@/repositories/lead.repository');

describe('LeadService - Regras de Negócio', () => {
  let leadService: LeadService;
  let mockUpsertLead: jest.Mock;

  beforeEach(() => {
    mockUpsertLead = jest.fn();
    (LeadRepository as jest.Mock).mockImplementation(() => ({
      upsertLead: mockUpsertLead,
    }));
    leadService = new LeadService();
  });

  it('deve registrar ou atualizar um lead e retornar os dados filtrados com sucesso', async () => {
    const inputData = {
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      whatsapp: '92991234567',
    };

    mockUpsertLead.mockResolvedValue({
      id: 'uuid-1234',
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      whatsapp: '92991234567',
      emailValidado: false,
      criadoEm: new Date(),
    });

    const resultado = await leadService.registrarLead(inputData);

    expect(mockUpsertLead).toHaveBeenCalledWith(inputData);
    expect(resultado).toEqual({
      id: 'uuid-1234',
      nome: 'Maria Silva',
      email: 'maria@exemplo.com',
      emailValidado: false,
    });
  });
});