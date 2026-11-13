# Sistema de Gestão - Hotel Serpa

Aplicação web full-stack desenvolvida para a gestão operacional, administrativa e financeira do **Hotel Serpa**. O sistema abrange desde a captação de hóspedes e reservas online com pagamento (30%) e emissão automática de voucher em PDF, até o controle completo de recepção (check-in, check-out, walk-in), rastreabilidade de equipe e auditoria financeira consolidada.

Projetado com foco rigoroso em segurança (Zero Trust), arquitetura limpa, rastreabilidade e automação de testes e deploy.

## Índice

1. [Arquitetura e Padrões de Projeto](#-arquitetura-e-padrões-de-projeto)
2. [Perfis de Acesso e Regras de Negócio](#-perfis-de-acesso-e-regras-de-negócio)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Status de Desenvolvimento](#-status-de-desenvolvimento)
5. [Pré-requisitos](#-pré-requisitos)
6. [Configuração do Ambiente (.env)](#-configuração-do-ambiente-env)
7. [Como Executar Localmente](#-como-executar-localmente)
8. [Como Executar com Docker](#-como-executar-com-docker)
9. [Testes Automatizados e CI/CD](#-testes-automatizados-e-cicd)
10. [Documentação da API (Endpoints)](#-documentação-da-api-endpoints)

## Arquitetura e Padrões de Projeto

O backend da aplicação segue rigorosamente a separação de responsabilidades utilizando a arquitetura em camadas:

* **Controller (`app/api/**/route.ts`):** Gerencia as requisições HTTP, verifica cabeçalhos (`Content-Type`), aplica controle de taxa (*Rate Limiting*) e trata exceções sem expor dados sensíveis do servidor.
* **Validation & DTOs (`schemas/` e `dtos/`):** Validação estrita na fronteira da aplicação utilizando **Zod** (`.strict()`), sanitização contra *XSS* e controle explícito de contratos de entrada e saída (*Input/Output DTOs*).
* **Service (`services/`):** Encapsula as regras de negócio da aplicação (cálculo de diárias e taxa de reserva de 30%, geração/validação de OTP, controle de disponibilidade de quartos, regras de check-in/check-out e emissão de voucher), isoladas da camada web e do banco de dados.
* **Repository (`repositories/`):** Abstrai e isola as operações de persistência de dados utilizando o **Prisma ORM**.

---

## Perfis de Acesso e Regras de Negócio

O sistema é dividido em três camadas de atuação:

### 1. Cliente / Lead (Camada Pública — Landing Page)
Focado na experiência de reserva autônoma e no funil de conversão (`Lead → OTP → Mercado Pago → Webhook → PDF`):
* **Consulta e Simulação:** Visualização das acomodações, seleção de datas de check-in/check-out e cálculo automático (validado no servidor) do valor total da estadia e dos **30%** (taxa de reserva).
* **Cadastro (Captação de Lead):** Coleta de nome completo, e-mail e WhatsApp para iniciar o fluxo.
* **Validação de Identidade (OTP):** Envio de código de 6 dígitos por e-mail com tempo de expiração e limite de tentativas, exigido antes do acesso ao checkout.
* **Pagamento Online (30%):** Checkout integrado ao Mercado Pago (Pix ou Cartão) referente a taxa da reserva.
* **Recebimento do Comprovante:** Após confirmação assíncrona via Webhook, disparo automático por e-mail do **Voucher de Reserva em PDF**, detalhando o código do pedido, o sinal quitado (30%) e o saldo restante (70%) a ser pago no hotel.

### 2. Funcionário / Recepcionista (Camada Restrita — Operação Diária)
Focado no atendimento presencial, controle de ocupação e rastreabilidade:
* **Autenticação e Auditoria:** Acesso restrito via login e senha próprios. Todas as movimentações de quartos, check-ins, check-outs e recebimentos ficam vinculadas ao ID do funcionário logado.
* **Gestão de Reservas Antecipadas (Check-in):**
  * Localização de reservas confirmadas pela Landing Page (status `SINAL_PAGO`).
  * Registro de chegada do hóspede (Check-in), alterando o status da acomodação de `RESERVADO` para `OCUPADO`.
  * Recebimento e baixa no sistema dos **70% restantes** da estadia (no check-in ou check-out).
* **Atendimento sem Reserva Prévia (Walk-in):**
  * Consulta ao mapa de quartos com status `DISPONÍVEL` para o período desejado.
  * Cadastro rápido do hóspede no balcão, registro do pagamento presencial (integral ou parcial) e execução imediata do Check-in, bloqueando o quarto no banco de dados para evitar *overbooking* com o site.
* **Encerramento e Consumo (Check-out):**
  * Lançamento de consumos extras (frigobar, serviços adicionais) na conta do quarto.
  * Finalização da estadia (Check-out) mediante quitação total dos valores pendentes e liberação do quarto para limpeza/disponibilidade.

### 3. Administrador (Camada Restrita — Gestão e Financeiro)
Focado na visão estratégica do negócio e na auditoria dos dados:
* **Gestão de Equipe e Acomodações:** Cadastro de funcionários, gerenciamento de permissões de acesso e atualização de tarifas de diárias ou disponibilidade de quartos.
* **Auditoria de Leads e Funil:** Monitoramento completo dos leads captados (status de validação OTP, carrinhos abandonados e conversões concluídas).
* **Controle Financeiro Consolidado:** Relatórios de faturamento segmentados por origem:
  * **Receita Online (Mercado Pago):** Soma dos sinais de 30% validados via Webhook.
  * **Receita Presencial (Balcão):** Soma dos saldos restantes (70%), reservas *walk-in* e consumos extras registrados pelos recepcionistas.

---

## Tecnologias Utilizadas

* **Frontend & Backend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Banco de Dados & ORM:** PostgreSQL, Prisma ORM (v6)
* **Validação & Segurança:** Zod, Rate Limiting em memória, Hash criptográfico para OTP e controle de acesso
* **Qualidade & Testes:** Jest, ESLint, GitHub Actions (CI/CD)
* **Infraestrutura:** Docker e Docker Compose
* **Integrações (Planejadas/Em curso):** Mercado Pago API, Serviço de E-mail Transacional, Google Analytics, Microsoft Clarity e Discord Webhooks.

## Funcionalidades Principais

* [x] **Infraestrutura & CI/CD:** Pipeline automatizado rodando Linter, Testes Unitários e Build Check a cada `push` ou `pull_request`.
* [x] **Modelagem de Dados Inicial:** Estruturação base no PostgreSQL com integridade referencial.
* [x] **Captação Segura de Leads (`POST /api/leads`):** Registro e atualização de potenciais hóspedes com proteção contra spam, injeção de scripts e *Mass Assignment*.
* [ ] **Portal e Landing Page Responsiva:** Apresentação das acomodações, consulta de disponibilidade e redirecionamento direto para atendimento via WhatsApp.
* [ ] **Verificação de Identidade (OTP):** Envio e validação de código de 6 dígitos por e-mail com expiração e limite de tentativas para segurança nas reservas.
* [ ] **Motor de Reservas e Pagamento:** Reserva online de quartos com cálculo seguro no servidor e integração via Webhook com o Mercado Pago.
* [ ] **Operação Hoteleira (Check-in e Check-out):** Controle de entrada e saída de hóspedes, status de ocupação dos quartos e consumo.
* [ ] **Painel Administrativo e Financeiro:** Gestão de acomodações, tarifas, histórico de reservas, relatórios de ocupação e controle financeiro.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (v20 ou superior)
* [Docker](https://www.docker.com/) e Docker Compose
* [Git](https://git-scm.com/)

## Configuração do Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto baseado nas variáveis abaixo. **Nunca versione este arquivo no Git.**

```env
# Banco de Dados (PostgreSQL)
DATABASE_URL="postgresql://postgres:senha_secreta@localhost:5432/hotel_serpa?schema=public"

# Chaves de Integração (Configurar nas etapas seguintes)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="sua_chave_publica_aqui"
MERCADOPAGO_ACCESS_TOKEN="seu_access_token_privado_aqui"
EMAIL_SERVICE_API_KEY="sua_chave_de_envio_de_email"
DISCORD_WEBHOOK_URL="sua_url_webhook_para_alertas"
```

## Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/larissamonsalve/serpa-hotel-sistema.git
   cd serpa-hotel-sistema
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Suba o banco de dados PostgreSQL via Docker:**
   ```bash
   docker-compose up -d db
   ```

4. **Execute as migrações do banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Acesse `http://localhost:3000` no seu navegador.

## Como Executar com Docker

Para simular o ambiente de produção completo (Aplicação Next.js em modo `standalone` + PostgreSQL):

1. Certifique-se de que o Docker está ativo em sua máquina.
2. Execute o comando na raiz do projeto:
   ```bash
   docker-compose up --build -d
   ```
3. A aplicação estará disponível em `http://localhost:3000`.

## Testes Automatizados e CI/CD

O projeto utiliza **Jest** integrado ao compilador do Next.js para validar as regras de negócio de forma isolada.

* **Rodar os testes localmente:**
  ```bash
  npm run test
  ```
* **Verificar qualidade de código (Linter):**
  ```bash
  npm run lint
  ```
* **Pipeline CI/CD:** Configurado em `.github/workflows/ci.yml`. Toda alteração enviada ao repositório passa obrigatoriamente pelas etapas de *Lint*, *Unit Tests* e *Production Build*.

## Documentação da API (Endpoints)

### `POST /api/leads`

Registra ou atualiza um potencial hóspede (lead) no sistema.

* **Headers:** `Content-Type: application/json`
* **Rate Limit:** Máximo de 5 requisições por minuto por IP.
* **Corpo da Requisição (JSON):**
  ```json
  {
    "nome": "João Silva",
    "email": "joao.silva@exemplo.com",
    "whatsapp": "92999999999"
  }
  ```
* **Respostas:**
  * `201 Created`: Lead registrado/atualizado com sucesso.
  * `400 Bad Request`: Falha na validação dos campos (detalhes retornados no array `details`).
  * `415 Unsupported Media Type`: Cabeçalho `Content-Type` inválido.
  * `429 Too Many Requests`: Limite de tentativas excedido.