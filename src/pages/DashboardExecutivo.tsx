import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldAlert, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { suppliers as initialSuppliers, defaultWeights } from '@/data/mockData';
import { recalculateSuppliers } from '@/utils/riskCalculations';

const getScoreBadgeClass = (score: number) =>
  score >= 80 ? 'risk-badge-low' : score >= 60 ? 'risk-badge-medium' : 'risk-badge-high';

// Mock 90-day trend data
const trendData = [
  { month: 'Dez/25', fiscal: 74, credito: 68, operacional: 71, judicial: 72, esg: 62 },
  { month: 'Jan/26', fiscal: 72, credito: 65, operacional: 68, judicial: 70, esg: 63 },
  { month: 'Fev/26', fiscal: 71, credito: 63, operacional: 65, judicial: 69, esg: 61 },
  { month: 'Mar/26', fiscal: 73, credito: 66, operacional: 67, judicial: 71, esg: 64 },
];

const chartConfig = {
  fiscal: { label: 'Fiscal', color: 'hsl(222 60% 45%)' },
  credito: { label: 'Crédito', color: 'hsl(36 90% 50%)' },
  operacional: { label: 'Operacional', color: 'hsl(145 58% 42%)' },
  judicial: { label: 'Judicial', color: 'hsl(280 60% 50%)' },
  esg: { label: 'ESG', color: 'hsl(200 70% 50%)' },
};

// Mock governance coverage
const governanceCoverage = {
  fiscal: 95,
  credito: 80,
  operacional: 72,
  judicial: 60,
  esg: 45,
};

// Mock financial exposure
const financialExposure = {
  scoreBelow60: 'R$ 4.200.000',
  circuitBreaker: 'R$ 1.850.000',
};

const DashboardExecutivo = () => {
  const computed = useMemo(() => recalculateSuppliers(initialSuppliers, defaultWeights), []);

  const avgScore = useMemo(() => {
    const sum = computed.reduce((acc, s) => acc + s.finalScore, 0);
    return Math.round(sum / computed.length);
  }, [computed]);

  const scoreVariation = 3; // mock +3 últimos 30 dias

  const blockedSuppliers = useMemo(() => {
    return computed.filter(s => s.circuitBreakerActive);
  }, [computed]);

  const top5Risks = useMemo(() => {
    return [...computed]
      .sort((a, b) => a.finalScore - b.finalScore)
      .slice(0, 5)
      .map(s => {
        const scores = [
          { name: 'Fiscal', score: s.fiscalScore },
          { name: 'Crédito', score: s.financialScore },
          { name: 'Operacional', score: s.operationalScore },
          { name: 'Judicial', score: s.judicialScore },
          { name: 'ESG', score: s.esgScore },
        ];
        const worst = scores.reduce((a, b) => a.score < b.score ? a : b);
        const mockImpact = ['R$ 1.200.000', 'R$ 850.000', 'R$ 2.100.000', 'R$ 450.000', 'R$ 680.000'];
        return {
          ...s,
          impacto: mockImpact[Math.floor(Math.random() * mockImpact.length)],
          motivo: s.circuitBreakerActive ? 'Circuit Breaker ativo' : `${worst.name} crítico (${worst.score})`,
        };
      });
  }, [computed]);

  const blockReasons: Record<string, string> = {
    '3': 'CNPJ Inapto',
    '6': 'Recuperação Judicial',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Dashboard Executivo</h1>
            <p className="text-xs text-muted-foreground">Visão estratégica consolidada para diretoria</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Row 1: Score Corporativo + Exposição Financeira + Eventos Estruturais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1) Score Corporativo Consolidado */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Score Corporativo Consolidado
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className={`${getScoreBadgeClass(avgScore)} inline-flex items-center rounded-full px-5 py-2.5 text-3xl font-bold`}>
                {avgScore}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {scoreVariation >= 0 ? (
                  <span className="flex items-center gap-1 text-[hsl(var(--risk-low))]">
                    <TrendingUp className="h-4 w-4" />
                    +{scoreVariation} pts
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[hsl(var(--risk-high))]">
                    <TrendingDown className="h-4 w-4" />
                    {scoreVariation} pts
                  </span>
                )}
                <span className="text-muted-foreground">últimos 30 dias</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Média ponderada de {computed.length} fornecedores monitorados
              </p>
            </CardContent>
          </Card>

          {/* 2) Exposição Financeira */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Exposição Financeira ao Risco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fornecedores com score &lt; 60</p>
                <p className="text-xl font-bold text-[hsl(var(--risk-high))]">{financialExposure.scoreBelow60}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fornecedores com circuit breaker ativo</p>
                <p className="text-xl font-bold text-[hsl(var(--risk-high))]">{financialExposure.circuitBreaker}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Valores simulados para demonstração</p>
            </CardContent>
          </Card>

          {/* 3) Eventos Estruturais */}
          <Card className="border-[hsl(var(--risk-high))]/30">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-1.5 text-[hsl(var(--risk-high))]">
                <ShieldAlert className="h-3.5 w-3.5" />
                Fornecedores com Evento Estrutural
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="risk-badge-high inline-flex items-center rounded-full px-3 py-1 text-lg font-bold">
                  {blockedSuppliers.length}
                </div>
                <span className="text-sm text-muted-foreground">bloqueados</span>
              </div>
              <div className="space-y-2">
                {blockedSuppliers.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm bg-[hsl(var(--risk-high-bg))] rounded-md px-3 py-2">
                    <span className="font-medium truncate mr-2">{s.name}</span>
                    <Badge variant="destructive" className="text-[10px] shrink-0">
                      {blockReasons[s.id] || 'Evento crítico'}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">Eventos estruturais sobrepõem o cálculo de score.</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Evolução por Pilar (90 dias) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Evolução por Pilar — Últimos 90 Dias
            </CardTitle>
            <CardDescription className="text-xs">Tendência média dos pilares de risco</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="fiscal" stroke="var(--color-fiscal)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="credito" stroke="var(--color-credito)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="operacional" stroke="var(--color-operacional)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="judicial" stroke="var(--color-judicial)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="esg" stroke="var(--color-esg)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Row 3: Top 5 Riscos + Índice de Governança */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 5) Top 5 Riscos Estratégicos */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top 5 Riscos Estratégicos</CardTitle>
              <CardDescription className="text-xs">Fornecedores mais críticos por score e impacto financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fornecedor</TableHead>
                    <TableHead className="text-xs text-center">Score</TableHead>
                    <TableHead className="text-xs text-right">Impacto Financeiro</TableHead>
                    <TableHead className="text-xs">Principal Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top5Risks.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-medium">{s.name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`${getScoreBadgeClass(s.finalScore)} inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold`}>
                          {s.finalScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-right font-medium">{s.impacto}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.motivo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 6) Índice de Governança */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Índice de Governança</CardTitle>
              <CardDescription className="text-xs">Cobertura de monitoramento por pilar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(governanceCoverage).map(([key, value]) => {
                const labels: Record<string, string> = {
                  fiscal: 'Fiscal',
                  credito: 'Crédito',
                  operacional: 'Operacional',
                  judicial: 'Judicial',
                  esg: 'ESG',
                };
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{labels[key]}</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                );
              })}
              <p className="text-[10px] text-muted-foreground pt-2">
                Maturidade do modelo de gestão de risco por pilar.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardExecutivo;
