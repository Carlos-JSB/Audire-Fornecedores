import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot,
} from 'recharts';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
  AlertTriangle, ShieldCheck, ShieldX, Info, Package, Clock,
  Sparkles, PlayCircle, History, TrendingUp, CheckCircle2, Ban, Eye, Scale,
  RefreshCw, Loader2, Circle, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Supplier } from '@/data/mockData';
import { type Weights, getRecommendedAction, calculateFinalScore, getRiskLevel, generateAIInsight } from '@/utils/riskCalculations';
import { SupplierCadastralData } from '@/components/SupplierCadastralData';
import { useSuppliers } from '@/context/SuppliersContext';

interface SupplierDetailProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
  weights: Weights;
  onSupplierUpdate?: (supplier: Supplier) => void;
}

function RiskBadgeLarge({ level, score }: { level: string; score: number }) {
  const cls = score >= 80 ? 'risk-badge-low' : score >= 60 ? 'risk-badge-medium' : 'risk-badge-high';
  return <div className={`${cls} inline-flex items-center rounded-full text-lg px-4 py-1 font-bold`}>{score}</div>;
}

function ActionBadge({ score, circuitBreaker }: { score: number; circuitBreaker: boolean }) {
  const action = getRecommendedAction(score, circuitBreaker);
  const icons: Record<string, React.ElementType> = {
    'Liberado': CheckCircle2,
    'Monitorar': Eye,
    'Bloqueado': Ban,
    'Escalar Compliance': Scale,
  };
  const Icon = icons[action.label] || Info;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${action.bgColor}`}>
      <Icon className={`h-4 w-4 ${action.color}`} />
      <span className={`text-sm font-semibold ${action.color}`}>{action.label}</span>
    </div>
  );
}

export function SupplierDetail({ supplier, open, onClose, weights, onSupplierUpdate }: SupplierDetailProps) {
  const [simulating, setSimulating] = useState(false);
  const [simCndRegular, setSimCndRegular] = useState(false);
  const [simAtrasoReduction, setSimAtrasoReduction] = useState(0);
  const [simAvariaReduction, setSimAvariaReduction] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [newDecisionStatus, setNewDecisionStatus] = useState('');
  const [newDecisionJustificativa, setNewDecisionJustificativa] = useState('');
  const [newDecisionResponsavel, setNewDecisionResponsavel] = useState('');
  const { toggleFavorite } = useSuppliers();
  const resetSim = () => {
    setSimulating(false);
    setSimCndRegular(false);
    setSimAtrasoReduction(0);
    setSimAvariaReduction(0);
  };

  const handleRefresh = () => {
    if (!supplier || !onSupplierUpdate) return;
    setRefreshing(true);
    setTimeout(() => {
      const jitter = (base: number) => Math.max(0, Math.min(100, base + Math.round((Math.random() - 0.5) * 6)));
      const updated: Supplier = {
        ...supplier,
        fiscalScore: jitter(supplier.fiscalScore),
        financialScore: jitter(supplier.financialScore),
        operationalScore: jitter(supplier.operationalScore),
        judicialScore: jitter(supplier.judicialScore),
        esgScore: jitter(supplier.esgScore),
        lastUpdated: new Date().toISOString(),
        auditTrail: [
          { date: new Date().toISOString().split('T')[0], description: 'Dados atualizados (Audire + Crédito e Cobrança + ERP)', type: 'system' as const },
          ...supplier.auditTrail,
        ],
      };
      onSupplierUpdate(updated);
      setRefreshing(false);
      toast.success('Dados atualizados com sucesso');
    }, 1500);
  };

  if (!supplier) return null;

  // Simulation logic
  const simFiscalStatus = simulating && simCndRegular ? 'regular' : supplier.fiscalStatus;
  const simFiscalScore = simulating && simCndRegular ? Math.max(supplier.fiscalScore, 70) : supplier.fiscalScore;
  const simOperationalScore = simulating
    ? Math.min(100, supplier.operationalScore + simAtrasoReduction * 10 + simAvariaReduction * 20)
    : supplier.operationalScore;

  const { score: simScore, circuitBreaker: simCB } = calculateFinalScore(
    simFiscalScore, supplier.financialScore, simOperationalScore, supplier.judicialScore, supplier.esgScore, weights, simFiscalStatus
  );
  const simRiskLevel = getRiskLevel(simScore);

  const displayScore = simulating ? simScore : supplier.finalScore;
  const displayLevel = simulating ? simRiskLevel : supplier.riskLevel;
  const displayCB = simulating ? simCB : supplier.circuitBreakerActive;

  // Consolidated score data
  const consolidatedData = supplier.monthlyScores.map((m) => {
    const avg = Math.round(
      (m.fiscal * weights.fiscal + m.financial * weights.financial + m.operational * weights.operational +
       m.fiscal * weights.judicial * 0.8 + m.operational * weights.esg * 0.7) / 100
    );
    const isCB = m.fiscal < 30;
    return { month: m.month, scoreFinal: isCB ? 20 : avg, circuitBreaker: isCB };
  });

  const cbPoints = consolidatedData.filter((d) => d.circuitBreaker);

  const aiInsight = generateAIInsight(supplier);

  const auditTypeIcons: Record<string, React.ElementType> = {
    fiscal: ShieldX,
    operational: Package,
    financial: TrendingUp,
    system: Info,
    governance: Scale,
  };

  const auditTypeBadgeColors: Record<string, string> = {
    fiscal: 'bg-chart-fiscal/10 text-chart-fiscal border-chart-fiscal/20',
    operational: 'bg-chart-operational/10 text-chart-operational border-chart-operational/20',
    financial: 'bg-chart-financial/10 text-chart-financial border-chart-financial/20',
    system: 'bg-muted text-muted-foreground border-border',
    governance: 'bg-primary/10 text-primary border-primary/20',
  };

  const currentAction = getRecommendedAction(supplier.finalScore, supplier.circuitBreakerActive);

  const handleRegisterDecision = () => {
    if (!newDecisionStatus || !newDecisionJustificativa.trim() || !newDecisionResponsavel.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!onSupplierUpdate) return;

    const newEvent = {
      date: new Date().toISOString().split('T')[0],
      description: `Decisão registrada: ${newDecisionStatus}`,
      type: 'governance' as const,
      responsavel: newDecisionResponsavel.trim(),
      justificativa: newDecisionJustificativa.trim(),
    };

    // TODO: POST /api/fornecedores/:id/decisao → grava em audit_log (tabela Fase 1 do backend)
    onSupplierUpdate({
      ...supplier,
      auditTrail: [newEvent, ...supplier.auditTrail],
    });

    toast.success('Decisão registrada');
    setDecisionDialogOpen(false);
    setNewDecisionStatus('');
    setNewDecisionJustificativa('');
    setNewDecisionResponsavel('');
  };

  return (
    <Sheet open={open} onOpenChange={() => { resetSim(); onClose(); }}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 mt-0.5"
                onClick={() => toggleFavorite(supplier.id)}
              >
                <Star
                  className={`h-4 w-4 ${
                    supplier.isFavorite
                      ? 'fill-current text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
              <div>
                <SheetTitle className="text-lg">{supplier.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{supplier.cnpj}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="shrink-0">
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              {refreshing ? 'Atualizando...' : 'Atualizar agora'}
            </Button>
          </div>
          {supplier.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {new Date(supplier.lastUpdated).toLocaleString('pt-BR')}
            </p>
          )}
        </SheetHeader>

        <Tabs defaultValue="score" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="score" className="flex-1">Score & Análise</TabsTrigger>
            <TabsTrigger value="cadastral" className="flex-1">Dados Cadastrais</TabsTrigger>
            <TabsTrigger value="governanca" className="flex-1">Governança</TabsTrigger>
          </TabsList>

          <TabsContent value="score">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <RiskBadgeLarge level={displayLevel} score={displayScore} />
              <div>
                <p className="text-sm font-medium">Score Final{simulating ? ' (Simulado)' : ''}</p>
                <p className="text-xs text-muted-foreground">
                  {displayLevel === 'low' ? 'Baixo Risco' : displayLevel === 'medium' ? 'Risco Médio' : 'Alto Risco'}
                </p>
              </div>
            </div>
            <ActionBadge score={displayScore} circuitBreaker={displayCB} />
          </div>

          {/* Circuit Breaker */}
          {displayCB && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-risk-high-bg">
              <AlertTriangle className="h-5 w-5 text-risk-high shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-risk-high">Circuit Breaker Fiscal Ativo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Status fiscal irregular. Score forçado para 20 independente dos demais pilares.
                </p>
              </div>
            </div>
          )}

          {/* Structural Block */}
          {supplier.structuralBlockActive && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-risk-medium-bg">
              <AlertTriangle className="h-5 w-5 text-risk-medium shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-risk-medium">Bloqueio Estrutural Ativo</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bloqueio configurável pelo tenant. Consulte a seção de Bloqueios Estruturais em Pesos & Regras.
                </p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <Card className="border-none shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Insight Automático (IA)</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consolidated Score Chart */}
          {consolidatedData.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Score Consolidado (12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={consolidatedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      formatter={(value: number, name: string) => [value, 'Score Final']}
                    />
                    <Line type="monotone" dataKey="scoreFinal" stroke="hsl(222, 60%, 45%)" strokeWidth={2.5} dot={false} name="Score Final" />
                    {cbPoints.map((p, i) => (
                      <ReferenceDot key={i} x={p.month} y={p.scoreFinal} r={6} fill="hsl(0, 72%, 51%)" stroke="white" strokeWidth={2} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                {cbPoints.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-risk-high shrink-0" />
                    Pontos vermelhos indicam circuit breaker fiscal ativo
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Score Evolution Chart */}
          {supplier.monthlyScores.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Evolução por Pilar (12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={supplier.monthlyScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="fiscal" stroke="hsl(222, 60%, 45%)" strokeWidth={2} dot={false} name="Fiscal" />
                    <Line type="monotone" dataKey="financial" stroke="hsl(36, 90%, 50%)" strokeWidth={2} dot={false} name="Financeiro" />
                    <Line type="monotone" dataKey="operational" stroke="hsl(145, 58%, 42%)" strokeWidth={2} dot={false} name="Operacional" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Score Transparency */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Transparência do Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const pillarScores = [
                  { label: 'Fiscal', score: simulating ? simFiscalScore : supplier.fiscalScore, weight: weights.fiscal },
                  { label: 'Crédito', score: supplier.financialScore, weight: weights.financial },
                  { label: 'Operacional', score: simulating ? simOperationalScore : supplier.operationalScore, weight: weights.operational },
                  { label: 'Judicial', score: supplier.judicialScore, weight: weights.judicial },
                  { label: 'ESG', score: supplier.esgScore, weight: weights.esg },
                ];
                const badgeCls = (s: number) => s >= 80 ? 'risk-badge-low' : s >= 60 ? 'risk-badge-medium' : 'risk-badge-high';
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {pillarScores.slice(0, 3).map((p) => (
                        <div key={p.label} className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{p.label}</p>
                          <div className={`${badgeCls(p.score)} inline-flex items-center rounded-full text-lg px-3 py-0.5 font-bold mt-1`}>{p.score}</div>
                          <p className="text-xs text-muted-foreground mt-1">Peso: {p.weight}%</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {pillarScores.slice(3).map((p) => (
                        <div key={p.label} className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{p.label}</p>
                          <div className={`${badgeCls(p.score)} inline-flex items-center rounded-full text-lg px-3 py-0.5 font-bold mt-1`}>{p.score}</div>
                          <p className="text-xs text-muted-foreground mt-1">Peso: {p.weight}%</p>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}

              {/* Score Explanation */}
              <div className="p-3 rounded-lg bg-muted/30 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Explicação do Score
                </p>
                {displayCB ? (
                  <p className="text-xs text-muted-foreground">
                    Score = 20 (circuit breaker fiscal ativo — situação fiscal irregular força o score mínimo independente dos demais pilares)
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Score = ({simulating ? simFiscalScore : supplier.fiscalScore}×{weights.fiscal}%) + ({supplier.financialScore}×{weights.financial}%) + ({simulating ? simOperationalScore : supplier.operationalScore}×{weights.operational}%) + ({supplier.judicialScore}×{weights.judicial}%) + ({supplier.esgScore}×{weights.esg}%) = <strong>{displayScore}</strong>
                    </p>
                    {supplier.circuitBreakerActive === false && supplier.fiscalStatus === 'irregular' && (
                      <p className="text-xs text-risk-high">⚠ Penalidade: CND irregular detectada</p>
                    )}
                    {supplier.operationalScore < 50 && (
                      <p className="text-xs text-risk-medium">⚠ Penalidade operacional: eventos de avaria/atraso impactando score</p>
                    )}
                    {supplier.financialScore < 50 && (
                      <p className="text-xs text-risk-medium">⚠ Risco de crédito elevado (Crédito e Cobrança)</p>
                    )}
                    {supplier.judicialScore < 50 && (
                      <p className="text-xs text-risk-medium">⚠ Processos judiciais ativos impactando score</p>
                    )}
                    {supplier.esgScore < 50 && (
                      <p className="text-xs text-risk-medium">⚠ Indicadores ESG abaixo do limiar aceitável</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scenario Simulation */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Simulação de Cenários ("E se…?")
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!simulating ? (
                <Button variant="outline" className="w-full" onClick={() => setSimulating(true)}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Iniciar Simulação
                </Button>
              ) : (
                <>
                  {supplier.fiscalStatus === 'irregular' && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <Label className="text-sm">Regularizar CND</Label>
                      <Switch checked={simCndRegular} onCheckedChange={setSimCndRegular} />
                    </div>
                  )}
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Redução de atrasos (dias)</Label>
                      <span className="text-sm font-medium">{simAtrasoReduction}</span>
                    </div>
                    <Slider
                      value={[simAtrasoReduction]}
                      onValueChange={([v]) => setSimAtrasoReduction(v)}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Redução de avarias (%)</Label>
                      <span className="text-sm font-medium">{simAvariaReduction}</span>
                    </div>
                    <Slider
                      value={[simAvariaReduction]}
                      onValueChange={([v]) => setSimAvariaReduction(v)}
                      min={0}
                      max={5}
                      step={1}
                    />
                  </div>
                  <Button variant="ghost" size="sm" className="w-full" onClick={resetSim}>
                    Encerrar Simulação
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Operational Events */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Eventos Operacionais (ERP)</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.operationalEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento recente.</p>
              ) : (
                <div className="space-y-2">
                  {supplier.operationalEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                      {event.type === 'avaria' ? (
                        <Package className="h-4 w-4 text-risk-high" />
                      ) : (
                        <Clock className="h-4 w-4 text-risk-medium" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.nfNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.type === 'avaria' ? `${event.value}% de avaria` : `${event.value} dia(s) de atraso`}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Eventos (Audit Trail)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.auditTrail.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
              ) : (
                <div className="relative pl-4 border-l-2 border-border/50 space-y-4">
                  {supplier.auditTrail.map((event, i) => {
                    const Icon = auditTypeIcons[event.type] || Info;
                    return (
                      <div key={i} className="relative">
                        <div className="absolute -left-[1.35rem] top-0.5 w-3 h-3 rounded-full bg-card border-2 border-muted-foreground/30" />
                        <div className="flex items-start gap-2.5">
                          <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-sm">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.date}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fiscal Status */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Status Fiscal (Audire)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                {supplier.fiscalStatus === 'regular' ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-risk-low" />
                    <span className="text-sm font-medium text-risk-low">Regular</span>
                  </>
                ) : (
                  <>
                    <ShieldX className="h-5 w-5 text-risk-high" />
                    <span className="text-sm font-medium text-risk-high">Irregular</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Os dados fiscais exibidos aqui podem ser consumidos por ERPs via API do Audire.
              </p>
            </CardContent>
          </Card>

          {/* Fiscal Dimensão 1 Detail */}
          {supplier.fiscalDimensao1 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Detalhamento Fiscal — Dimensão 1</CardTitle>
                <p className="text-xs text-muted-foreground">Plano: {supplier.fiscalDimensao1.plano === 'avancado' ? 'Avançado' : 'Básico'} · Score Dimensão 1: <strong>{supplier.fiscalDimensao1.score}</strong></p>
              </CardHeader>
              <CardContent>
                {/* TODO: score da Dimensão 1 = score do grupo com pior resultado.
                    Tabelas de gradação por grupo são configuradas no banco — não implementar no frontend. */}
                <div className="grid grid-cols-2 gap-2">
                  {supplier.fiscalDimensao1.grupos.map((g) => {
                    const grupoLabels: Record<string, string> = {
                      tributos_pendentes: 'Tributos Pendentes',
                      obrigacoes_acessorias: 'Obrigações Acessórias',
                      pendencias_pgfn: 'Pendências PGFN',
                      outras_pendencias: 'Outras Pendências',
                    };
                    const badgeCls = g.score >= 80 ? 'risk-badge-low' : g.score >= 60 ? 'risk-badge-medium' : 'risk-badge-high';
                    return (
                      <div key={g.grupo} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{grupoLabels[g.grupo] || g.grupo}</p>
                          {g.piorGrupo && <AlertTriangle className="h-3.5 w-3.5 text-risk-high" />}
                        </div>
                        <div className={`${badgeCls} inline-flex items-center rounded-full text-sm px-2.5 py-0.5 font-bold`}>{g.score}</div>
                        <p className="text-xs text-muted-foreground">{g.itensPendentes} item(ns) pendente(s)</p>
                        {g.piorGrupo && <p className="text-[10px] text-risk-high font-medium">Pior Grupo</p>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
          </TabsContent>

          <TabsContent value="cadastral">
            <SupplierCadastralData supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="governanca">
            <div className="space-y-6">
              {/* 1.1 — Decisão Atual */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Decisão Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentAction.bgColor}`}>
                      {(() => {
                        const icons: Record<string, React.ElementType> = { 'Liberado': CheckCircle2, 'Monitorar': Eye, 'Bloqueado': Ban, 'Escalar Compliance': Scale };
                        const Icon = icons[currentAction.label] || Info;
                        return <Icon className={`h-4 w-4 ${currentAction.color}`} />;
                      })()}
                      <span className={`text-sm font-semibold ${currentAction.color}`}>{currentAction.label}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Responsável:</span>
                      <span className="font-medium">Ana Lima – Gerência de Compras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">04/03/2026</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Justificativa:</p>
                    <p className="text-sm">Fornecedor com histórico regular. Monitoramento preventivo mantido por queda de score no pilar operacional.</p>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setDecisionDialogOpen(true)}>
                    Registrar Nova Decisão
                  </Button>
                </CardContent>
              </Card>

              {/* Decision Dialog */}
              <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Nova Decisão</DialogTitle>
                    <DialogDescription>Informe a decisão, justificativa e responsável.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Status da Decisão *</Label>
                      <Select value={newDecisionStatus} onValueChange={setNewDecisionStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Liberado">Liberado</SelectItem>
                          <SelectItem value="Monitorar">Monitorar</SelectItem>
                          <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                          <SelectItem value="Escalar Compliance">Escalar Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Justificativa *</Label>
                      <Textarea
                        value={newDecisionJustificativa}
                        onChange={(e) => setNewDecisionJustificativa(e.target.value)}
                        placeholder="Descreva o motivo da decisão..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Responsável *</Label>
                      <Input
                        value={newDecisionResponsavel}
                        onChange={(e) => setNewDecisionResponsavel(e.target.value)}
                        placeholder="Nome e cargo"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleRegisterDecision}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* 1.2 — Workflow de Aprovação */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Workflow de Aprovação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-4">
                    <div className="absolute left-[11px] top-2 bottom-8 w-0.5 bg-border" />
                    
                    <div className="relative flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-risk-low shrink-0 relative z-10 bg-card" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Análise Automática (Sistema)</span>
                          <Badge variant="outline" className="text-xs bg-risk-low/10 text-risk-low border-risk-low/20">Concluído</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Hoje</p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-risk-low shrink-0 relative z-10 bg-card" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Revisão Analista</span>
                          <Badge variant="outline" className="text-xs bg-risk-low/10 text-risk-low border-risk-low/20">Concluído</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Carlos Mendes – Analista de Risco</p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      <Clock className="h-5 w-5 text-chart-financial shrink-0 relative z-10 bg-card" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Aprovação Gestor</span>
                          <Badge variant="outline" className="text-xs bg-chart-financial/10 text-chart-financial border-chart-financial/20">Pendente</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 space-y-1">
                    <p className="text-xs text-muted-foreground">Fluxo configurável por nível de risco e por tenant. Em produção, notificações serão disparadas automaticamente a cada etapa.</p>
                    <p className="text-xs text-muted-foreground italic">(Protótipo — níveis de aprovação e responsáveis configuráveis no painel administrativo)</p>
                  </div>
                </CardContent>
              </Card>

              {/* 1.3 — Histórico de Decisões */}
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico de Decisões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supplier.auditTrail.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma decisão registrada ainda.</p>
                  ) : (
                    <div className="relative pl-4 border-l-2 border-border/50 space-y-4">
                      {[...supplier.auditTrail].sort((a, b) => b.date.localeCompare(a.date)).map((event, i) => {
                        const Icon = auditTypeIcons[event.type] || Info;
                        const badgeColor = auditTypeBadgeColors[event.type] || 'bg-muted text-muted-foreground border-border';
                        return (
                          <div key={i} className="relative">
                            <div className="absolute -left-[1.35rem] top-0.5 w-3 h-3 rounded-full bg-card border-2 border-muted-foreground/30" />
                            <div className="flex items-start gap-2.5">
                              <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm">{event.description}</p>
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${badgeColor}`}>
                                    {event.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.date).toLocaleDateString('pt-BR')}
                                </p>
                                {event.responsavel && (
                                  <p className="text-xs text-muted-foreground">por {event.responsavel}</p>
                                )}
                                {event.justificativa && (
                                  <p className="text-xs italic text-muted-foreground">{event.justificativa}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
