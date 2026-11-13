import { NextResponse } from 'next/server';
import { createLeadSchema } from '@/schemas/lead.schema';
import { LeadService } from '@/services/lead.service';
import { ZodError } from 'zod';

const leadService = new LeadService();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = createLeadSchema.parse(body);

    const lead = await leadService.registrarLead(validatedData);

    return NextResponse.json(
      {
        message: 'Lead registrado com sucesso.',
        lead,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos.',
          details: error.issues.map((e) => ({
            campo: e.path.join('.'),
            mensagem: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('[POST /api/leads] Erro interno:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar sua solicitação. Tente novamente.' },
      { status: 500 }
    );
  }
}