import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, ShieldX, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Supplier } from '@/data/mockData';

interface KPICardsProps {
  suppliers: Supplier[];
}

export function KPICards({ suppliers }: KPICardsProps) {
  const avgScore = Math.round(
    suppliers.reduce((sum, s) => sum + s.finalScore, 0) / suppliers.length
  );
  const irregularPct = Math.round(
    (suppliers.filter((s) => s.fiscalStatus === 'irregular').length / suppliers.length) * 100
  );
  const criticalAlerts = suppliers.reduce(
    (sum, s) =>
      sum +
      s.operationalEvents.filter(
        (e) => (e.type === 'avaria' && e.value >= 10) || (e.type === 'atraso' && e.value >= 5)
      ).length,
    0
  );

  const cards = [
    {
      label: 'Score Médio de Risco',
      value: avgScore,
      suffix: '/100',
      icon: avgScore >= 70 ? TrendingUp : TrendingDown,
      color: avgScore >= 70 ? 'text-risk-low' : avgScore >= 40 ? 'text-risk-medium' : 'text-risk-high',
      bg: avgScore >= 70 ? 'bg-risk-low-bg' : avgScore >= 40 ? 'bg-risk-medium-bg' : 'bg-risk-high-bg',
    },
    {
      label: 'Fornecedores Irregulares',
      value: `${irregularPct}%`,
      suffix: '',
      icon: irregularPct > 0 ? ShieldX : ShieldCheck,
      color: irregularPct > 20 ? 'text-risk-high' : irregularPct > 0 ? 'text-risk-medium' : 'text-risk-low',
      bg: irregularPct > 20 ? 'bg-risk-high-bg' : irregularPct > 0 ? 'bg-risk-medium-bg' : 'bg-risk-low-bg',
    },
    {
      label: 'Alertas Operacionais Críticos',
      value: criticalAlerts,
      suffix: '',
      icon: criticalAlerts > 0 ? AlertTriangle : Activity,
      color: criticalAlerts > 3 ? 'text-risk-high' : criticalAlerts > 0 ? 'text-risk-medium' : 'text-risk-low',
      bg: criticalAlerts > 3 ? 'bg-risk-high-bg' : criticalAlerts > 0 ? 'bg-risk-medium-bg' : 'bg-risk-low-bg',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                  <span className="text-base font-normal text-muted-foreground">{card.suffix}</span>
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
