// ATENÇÃO AO DEV — SCHEMA:
// O campo circuitBreakerActive no tipo Supplier corresponde à coluna da tabela supplier_scores.
// Antes da primeira migration, substituir:
//   circuitBreakerActive: boolean
// Por:
//   circuit_breaker_triggered: boolean   -- circuit breaker ativo (lógica fixa)
//   structural_block_triggered: boolean  -- bloqueio estrutural ativo (engine configurável)
//   block_reason: string | null          -- código do bloqueio ativo (ex: 'cnpj_inapto')
// Ref: SRM_Adendo_Decisoes_Arquiteturais.docx — Seção 4.1

export interface OperationalEvent {
  nfNumber: string;
  type: 'avaria' | 'atraso';
  value: number;
  date: string;
}

export interface MonthlyScore {
  month: string;
  fiscal: number;
  financial: number;
  operational: number;
}

export interface AuditEvent {
  date: string;
  description: string;
  type: 'fiscal' | 'operational' | 'financial' | 'system' | 'governance';
  responsavel?: string; // Quem executou a ação. Em produção: FK para users. Ref: tabela audit_log (Fase 1)
  justificativa?: string; // Texto livre registrado pelo operador no momento da decisão
}

// Representa o retorno do adaptador Audire para a Dimensão 1 (Situação Fiscal)
// Usado futuramente para exibir o detalhamento fiscal no SupplierDetail
export interface FiscalDimensao1Group {
  grupo: 'tributos_pendentes' | 'obrigacoes_acessorias' | 'pendencias_pgfn' | 'outras_pendencias';
  itensPendentes: number;    // quantidade de itens pendentes neste grupo
  score: number;             // score calculado pelo backend para este grupo (0–100)
  piorGrupo: boolean;        // true se este grupo determinou o score da Dimensão 1
}

export interface FiscalDimensao1 {
  plano: 'basico' | 'avancado';
  score: number;             // score final da Dimensão 1 = score do pior grupo
  grupos: FiscalDimensao1Group[];
  // TODO: este objeto é calculado pelo backend (engine do Pilar Fiscal).
  // Lógica: score do grupo com pior resultado entre os 4 grupos do Audire.
  // Dentro de cada grupo, a quantidade de itens pendentes determina o score
  // via tabelas de gradação configuradas no banco (fiscal_group_score_configs).
  // Ref: SRM_Adendo_Pilar_Fiscal_Score_Bloqueios.docx — Seção 3.
}

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  fiscalScore: number;
  fiscalStatus: 'regular' | 'irregular';
  financialScore: number;
  operationalScore: number;
  judicialScore: number;
  esgScore: number;
  finalScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  circuitBreakerActive: boolean;       // circuit breaker ativo (lógica fixa — ex: CNPJ irregular)
  structuralBlockActive: boolean;      // bloqueio estrutural ativo (configurável pelo tenant)
  // TODO: em produção, structuralBlockActive é derivado pelo engine genérico de bloqueios
  // que lê a tabela structural_block_configs. O campo aqui é apenas para exibição no protótipo.
  operationalEvents: OperationalEvent[];
  monthlyScores: MonthlyScore[];
  auditTrail: AuditEvent[];
  lastUpdated?: string;

  // Campos derivados do adaptador Audire — alimentam o engine de bloqueios estruturais
  cnpjInapto: boolean;         // derivado de situacao_fiscal retornada pelo Audire
  listaRestritiva: boolean;    // lista interna do tenant
  dividaAtiva: boolean;        // PGFN — valor acima do limiar configurado
  recuperacaoJudicial: boolean; // situação jurídica
  // TODO: em produção, cnpjInapto é derivado no adaptador Audire a partir do campo
  // situacao_fiscal antes de passar ao engine. Os demais campos vêm de suas respectivas
  // fontes de dados (lista interna do tenant, PGFN via CSV/e-CAC, adaptador jurídico).

  fiscalDimensao1?: FiscalDimensao1;

  isFavorite: boolean; // favorito do tenant — visível para todos os usuários do tenant
  // TODO: em produção, persistido via PATCH /api/fornecedores/:id/favorito (tenant_id derivado do token)

  weightsSnapshot?: {          // snapshot dos pesos no momento do último cálculo
    fiscal: number;
    financial: number;
    operational: number;
    judicial: number;
    esg: number;
    calculatedAt: string;      // ISO 8601
  };
  // TODO: em produção, weights_snapshot é gravado como JSONB em supplier_scores
  // no momento de cada cálculo do engine. Usado para auditoria histórica de scores
  // sem JOIN com score_configs. Ref: SRM_Handoff_Adendo_Final.docx — Seção 6.4.
}

export interface AudireSupplier {
  cnpj: string;
  name: string;
  fiscalScore: number;
  fiscalStatus: 'regular' | 'irregular';
  city: string;
  state: string;
}

const months = ['Mar/25', 'Abr/25', 'Mai/25', 'Jun/25', 'Jul/25', 'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26'];

function generateMonthlyScores(baseFiscal: number, baseFinancial: number, baseOperational: number): MonthlyScore[] {
  return months.map((month) => ({
    month,
    fiscal: Math.max(0, Math.min(100, baseFiscal + Math.round((Math.random() - 0.5) * 15))),
    financial: Math.max(0, Math.min(100, baseFinancial + Math.round((Math.random() - 0.5) * 12))),
    operational: Math.max(0, Math.min(100, baseOperational + Math.round((Math.random() - 0.5) * 18))),
  }));
}

export interface SeverityPenalties {
  leve: number;
  media: number;
  forte: number;
  redFlag: number;
}

export interface StructuralEvents {
  cnpjInapto: boolean;
  listaRestritiva: boolean;
  dividaAtiva: boolean;
  recuperacaoJudicial: boolean;
}

// Representa uma linha da tabela structural_block_configs no banco
export interface StructuralBlockConfig {
  id: string;
  label: string;           // Rótulo exibido na UI
  campo_origem: string;    // Campo do fornecedor avaliado (ex: 'cnpjInapto')
  valor_gatilho: string;   // Valor que ativa o bloqueio (ex: 'true')
  acao_recomendada: 'bloquear' | 'alertar';
  ativo: boolean;          // Configurável pelo tenant
  // TODO: em produção, esta estrutura vem de GET /api/configuracoes/bloqueios-estruturais
  // Novos bloqueios são inseridos na tabela pelo time de produto — sem deploy.
  // Valores dos gatilhos estão pendentes de validação com especialista fiscal e jurídico.
  // Enquanto não validados, nenhum bloqueio deve ser ativo no MVP (ativo: false para todos).
}

export interface Subscore {
  id: string;
  label: string;
  weight: number;
}

export type PillarSubscores = Record<string, Subscore[]>;

export const defaultSubscores: PillarSubscores = {
  fiscal: [
    { id: 'fiscal-1', label: 'Regularidade Cadastral Receita Federal', weight: 30 },
    { id: 'fiscal-2', label: 'Pendências CND', weight: 30 },
    { id: 'fiscal-3', label: 'Inscrição em Dívida Ativa', weight: 25 },
    { id: 'fiscal-4', label: 'Histórico de Irregularidades', weight: 15 },
  ],
  financial: [
    { id: 'fin-1', label: 'Score de Crédito de Mercado', weight: 30 },
    { id: 'fin-2', label: 'Histórico de Pagamentos', weight: 30 },
    { id: 'fin-3', label: 'Índice de Endividamento', weight: 20 },
    { id: 'fin-4', label: 'Protestos ou Inadimplência', weight: 20 },
  ],
  operational: [
    { id: 'op-1', label: 'Cumprimento de SLA', weight: 30 },
    { id: 'op-2', label: 'Histórico de Entregas', weight: 25 },
    { id: 'op-3', label: 'Volume Operacional Suportado', weight: 25 },
    { id: 'op-4', label: 'Incidentes Operacionais', weight: 20 },
  ],
  judicial: [
    { id: 'jud-1', label: 'Processos Trabalhistas', weight: 30 },
    { id: 'jud-2', label: 'Processos Cíveis Relevantes', weight: 20 },
    { id: 'jud-3', label: 'Execuções Judiciais', weight: 30 },
    { id: 'jud-4', label: 'Recuperação Judicial / Falência', weight: 20 },
  ],
  esg: [
    { id: 'esg-1', label: 'Infrações Ambientais', weight: 35 },
    { id: 'esg-2', label: 'Lista de Trabalho Escravo', weight: 25 },
    { id: 'esg-3', label: 'Conformidade Social / Trabalhista', weight: 20 },
    { id: 'esg-4', label: 'Reputação ESG / Mídia Negativa', weight: 20 },
  ],
};

export const defaultWeights = {
  fiscal: 25,
  financial: 25,
  operational: 25,
  judicial: 15,
  esg: 10,
};

export const defaultSeverityPenalties: SeverityPenalties = {
  leve: -5,
  media: -10,
  forte: -20,
  redFlag: -40,
};

// @deprecated — use defaultStructuralBlockConfigs. Mantido apenas para compatibilidade temporária.
export const defaultStructuralEvents: StructuralEvents = {
  cnpjInapto: true,
  listaRestritiva: true,
  dividaAtiva: false,
  recuperacaoJudicial: false,
};

export const defaultStructuralBlockConfigs: StructuralBlockConfig[] = [
  { id: 'cnpj-inapto',          label: 'CNPJ INAPTO',                    campo_origem: 'cnpjInapto',          valor_gatilho: 'true', acao_recomendada: 'bloquear', ativo: false },
  { id: 'lista-restritiva',     label: 'Lista Restritiva Interna',       campo_origem: 'listaRestritiva',     valor_gatilho: 'true', acao_recomendada: 'bloquear', ativo: false },
  { id: 'divida-ativa',         label: 'Dívida Ativa (acima do limiar)', campo_origem: 'dividaAtiva',         valor_gatilho: 'true', acao_recomendada: 'alertar',  ativo: false },
  { id: 'recuperacao-judicial', label: 'Recuperação Judicial',           campo_origem: 'recuperacaoJudicial', valor_gatilho: 'true', acao_recomendada: 'bloquear', ativo: false },
];

export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Distribuidora Nacional Ltda',
    cnpj: '12.345.678/0001-90',
    fiscalScore: 92,
    fiscalStatus: 'regular',
    financialScore: 85,
    operationalScore: 90,
    judicialScore: 88,
    esgScore: 75,
    finalScore: 87,
    riskLevel: 'low',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [
      { nfNumber: 'NF-4521', type: 'atraso', value: 2, date: '2026-02-10' },
    ],
    monthlyScores: generateMonthlyScores(92, 85, 90),
    auditTrail: [
      { date: '2026-02-10', description: 'Atraso de 2 dias registrado no ERP (NF-4521)', type: 'operational' },
      { date: '2026-01-15', description: 'Score financeiro atualizado via Crédito e Cobrança', type: 'financial' },
      { date: '2025-12-01', description: 'CND validada – situação regular', type: 'fiscal' },
    ],
  },
  {
    id: '2',
    name: 'Logística Express S.A.',
    cnpj: '98.765.432/0001-10',
    fiscalScore: 78,
    fiscalStatus: 'regular',
    financialScore: 62,
    operationalScore: 55,
    judicialScore: 70,
    esgScore: 60,
    finalScore: 64,
    riskLevel: 'medium',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [
      { nfNumber: 'NF-8812', type: 'avaria', value: 15, date: '2026-02-15' },
      { nfNumber: 'NF-8830', type: 'atraso', value: 5, date: '2026-02-18' },
    ],
    monthlyScores: generateMonthlyScores(78, 62, 55),
    auditTrail: [
      { date: '2026-02-18', description: 'Atraso de 5 dias registrado (NF-8830)', type: 'operational' },
      { date: '2026-02-15', description: 'Avaria de 15% registrada (NF-8812)', type: 'operational' },
      { date: '2026-01-20', description: 'Score de crédito caiu para 62', type: 'financial' },
      { date: '2025-11-10', description: 'Fornecedor adicionado ao monitoramento', type: 'system' },
    ],
  },
  {
    id: '3',
    name: 'Tech Parts Indústria',
    cnpj: '11.222.333/0001-44',
    fiscalScore: 15,
    fiscalStatus: 'irregular',
    financialScore: 70,
    operationalScore: 82,
    judicialScore: 45,
    esgScore: 55,
    finalScore: 20,
    riskLevel: 'high',
    circuitBreakerActive: true,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: true,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    fiscalDimensao1: {
      plano: 'avancado',
      score: 35,
      grupos: [
        { grupo: 'tributos_pendentes',    itensPendentes: 4, score: 35, piorGrupo: true  },
        { grupo: 'obrigacoes_acessorias', itensPendentes: 1, score: 70, piorGrupo: false },
        { grupo: 'pendencias_pgfn',       itensPendentes: 0, score: 100, piorGrupo: false },
        { grupo: 'outras_pendencias',     itensPendentes: 0, score: 100, piorGrupo: false },
      ],
    },
    operationalEvents: [
      { nfNumber: 'NF-1100', type: 'avaria', value: 3, date: '2026-01-20' },
    ],
    monthlyScores: generateMonthlyScores(15, 70, 82),
    auditTrail: [
      { date: '2026-02-01', description: 'Circuit breaker fiscal ativado automaticamente', type: 'fiscal' },
      { date: '2026-01-28', description: 'CND passou para irregular', type: 'fiscal' },
      { date: '2026-01-20', description: 'Avaria de 3% registrada (NF-1100)', type: 'operational' },
      { date: '2025-12-15', description: 'Simulação de regularização fiscal executada', type: 'system' },
      { date: '2025-11-01', description: 'Fornecedor adicionado ao monitoramento', type: 'system' },
    ],
  },
  {
    id: '4',
    name: 'Metalúrgica Progresso',
    cnpj: '44.555.666/0001-77',
    fiscalScore: 88,
    fiscalStatus: 'regular',
    financialScore: 91,
    operationalScore: 95,
    judicialScore: 92,
    esgScore: 85,
    finalScore: 91,
    riskLevel: 'low',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [],
    monthlyScores: generateMonthlyScores(88, 91, 95),
    auditTrail: [
      { date: '2026-02-20', description: 'Auditoria trimestral concluída – sem pendências', type: 'system' },
      { date: '2026-01-10', description: 'Score financeiro atualizado via Crédito e Cobrança', type: 'financial' },
    ],
  },
  {
    id: '5',
    name: 'Alimentos do Sul Ltda',
    cnpj: '77.888.999/0001-22',
    fiscalScore: 65,
    fiscalStatus: 'regular',
    financialScore: 45,
    operationalScore: 38,
    judicialScore: 50,
    esgScore: 42,
    finalScore: 48,
    riskLevel: 'medium',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [
      { nfNumber: 'NF-3301', type: 'atraso', value: 8, date: '2026-02-05' },
      { nfNumber: 'NF-3310', type: 'avaria', value: 22, date: '2026-02-12' },
      { nfNumber: 'NF-3315', type: 'atraso', value: 3, date: '2026-02-20' },
    ],
    monthlyScores: generateMonthlyScores(65, 45, 38),
    auditTrail: [
      { date: '2026-02-20', description: 'Atraso de 3 dias registrado (NF-3315)', type: 'operational' },
      { date: '2026-02-12', description: 'Avaria acima do limite: 22% (NF-3310)', type: 'operational' },
      { date: '2026-02-05', description: 'Atraso de 8 dias registrado (NF-3301)', type: 'operational' },
      { date: '2026-01-15', description: 'Score de crédito caiu para 45 – alerta financeiro', type: 'financial' },
    ],
  },
  {
    id: '6',
    name: 'Construtora Horizonte',
    cnpj: '33.444.555/0001-88',
    fiscalScore: 10,
    fiscalStatus: 'irregular',
    financialScore: 30,
    operationalScore: 25,
    judicialScore: 20,
    esgScore: 30,
    finalScore: 20,
    riskLevel: 'high',
    circuitBreakerActive: true,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: true,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    fiscalDimensao1: {
      plano: 'avancado',
      score: 15,
      grupos: [
        { grupo: 'tributos_pendentes',    itensPendentes: 7, score: 15, piorGrupo: true  },
        { grupo: 'obrigacoes_acessorias', itensPendentes: 3, score: 45, piorGrupo: false },
        { grupo: 'pendencias_pgfn',       itensPendentes: 2, score: 40, piorGrupo: false },
        { grupo: 'outras_pendencias',     itensPendentes: 1, score: 60, piorGrupo: false },
      ],
    },
    operationalEvents: [
      { nfNumber: 'NF-7701', type: 'avaria', value: 30, date: '2026-01-28' },
      { nfNumber: 'NF-7710', type: 'atraso', value: 12, date: '2026-02-03' },
    ],
    monthlyScores: generateMonthlyScores(10, 30, 25),
    auditTrail: [
      { date: '2026-02-05', description: 'Circuit breaker fiscal ativado automaticamente', type: 'fiscal' },
      { date: '2026-02-03', description: 'Atraso de 12 dias registrado (NF-7710)', type: 'operational' },
      { date: '2026-01-28', description: 'Avaria acima do limite: 30% (NF-7701)', type: 'operational' },
      { date: '2026-01-25', description: 'CND passou para irregular', type: 'fiscal' },
      { date: '2026-01-10', description: 'Score de crédito caiu para 30 – risco elevado', type: 'financial' },
    ],
  },
  {
    id: '7',
    name: 'Farmacêutica Vida',
    cnpj: '55.666.777/0001-33',
    fiscalScore: 95,
    fiscalStatus: 'regular',
    financialScore: 88,
    operationalScore: 92,
    judicialScore: 95,
    esgScore: 90,
    finalScore: 92,
    riskLevel: 'low',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [],
    monthlyScores: generateMonthlyScores(95, 88, 92),
    auditTrail: [
      { date: '2026-02-15', description: 'Auditoria mensal concluída – conformidade total', type: 'system' },
      { date: '2026-01-05', description: 'CND validada – situação regular', type: 'fiscal' },
    ],
  },
  {
    id: '8',
    name: 'Transportes Rápido',
    cnpj: '22.333.444/0001-55',
    fiscalScore: 72,
    fiscalStatus: 'regular',
    financialScore: 58,
    operationalScore: 42,
    judicialScore: 65,
    esgScore: 50,
    finalScore: 57,
    riskLevel: 'medium',
    circuitBreakerActive: false,
    structuralBlockActive: false,
    isFavorite: false,
    cnpjInapto: false,
    listaRestritiva: false,
    dividaAtiva: false,
    recuperacaoJudicial: false,
    operationalEvents: [
      { nfNumber: 'NF-9901', type: 'atraso', value: 6, date: '2026-02-08' },
      { nfNumber: 'NF-9905', type: 'avaria', value: 10, date: '2026-02-14' },
    ],
    monthlyScores: generateMonthlyScores(72, 58, 42),
    auditTrail: [
      { date: '2026-02-14', description: 'Avaria de 10% registrada (NF-9905)', type: 'operational' },
      { date: '2026-02-08', description: 'Atraso de 6 dias registrado (NF-9901)', type: 'operational' },
      { date: '2026-01-20', description: 'Tendência de queda no score operacional detectada', type: 'system' },
    ],
  },
];

// Fornecedores disponíveis no sistema Audire (ainda não monitorados no SRM)
export const audireSuppliers: AudireSupplier[] = [
  { cnpj: '10.111.222/0001-01', name: 'Embalagens Prime Ltda', fiscalScore: 88, fiscalStatus: 'regular', city: 'São Paulo', state: 'SP' },
  { cnpj: '20.222.333/0001-02', name: 'Química Industrial BR', fiscalScore: 72, fiscalStatus: 'regular', city: 'Campinas', state: 'SP' },
  { cnpj: '30.333.444/0001-03', name: 'Siderúrgica Norte S.A.', fiscalScore: 15, fiscalStatus: 'irregular', city: 'Belo Horizonte', state: 'MG' },
  { cnpj: '40.444.555/0001-04', name: 'Plásticos Recicla', fiscalScore: 91, fiscalStatus: 'regular', city: 'Curitiba', state: 'PR' },
  { cnpj: '50.555.666/0001-05', name: 'Borrachas Flex Ltda', fiscalScore: 25, fiscalStatus: 'irregular', city: 'Porto Alegre', state: 'RS' },
  { cnpj: '60.666.777/0001-06', name: 'Eletrocomponentes SA', fiscalScore: 80, fiscalStatus: 'regular', city: 'Joinville', state: 'SC' },
  { cnpj: '70.777.888/0001-07', name: 'Têxtil Nordeste', fiscalScore: 68, fiscalStatus: 'regular', city: 'Recife', state: 'PE' },
  { cnpj: '80.888.999/0001-08', name: 'Madeireira Central', fiscalScore: 10, fiscalStatus: 'irregular', city: 'Manaus', state: 'AM' },
  { cnpj: '90.999.000/0001-09', name: 'Agro Insumos Brasil', fiscalScore: 95, fiscalStatus: 'regular', city: 'Goiânia', state: 'GO' },
  { cnpj: '11.123.456/0001-10', name: 'Vidros & Cristais ME', fiscalScore: 77, fiscalStatus: 'regular', city: 'Ribeirão Preto', state: 'SP' },
];
