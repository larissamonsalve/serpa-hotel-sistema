import { NextResponse } from 'next/server';
import { createLeadSchema } from '@/schemas/lead.schema';
import { LeadService } from '@/services/lead.service';
import { checkRateLimit } from '@/lib/rate-limit';
import { ZodError } from 'zod';

const leadService = new LeadService();

export async function POST(request: Request) {
  try {
    // 1. Verificação de Content-Type (Bloqueia requisições malformadas)
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Formato de requisição inválido. Esperado application/json.' },
        { status: 415 }
      );
    }

    // 2. Proteção contra Spam / Força Bruta (Rate Limiting por IP)
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const isAllowed = checkRateLimit(ip, 5, 60000); // Máximo 5 tentativas por minuto

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas detectadas. Aguarde um minuto antes de tentar novamente.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 3. Validação estrita, sanitização e bloqueio de campos extras (Zero Trust)
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

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'JSON malformado no corpo da requisição.' },
        { status: 400 }
      );
    }

    console.error('[POST /api/leads] Erro interno:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar sua solicitação.' },
      { status: 500 }
    );
  }
}