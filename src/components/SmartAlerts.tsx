import { AlertTriangle, TrendingDown, ShieldX, Package, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { Supplier } from '@/data/mockData';

interface SmartAlertsProps {
  suppliers: Supplier[];
}

interface Alert {
  icon: React.ElementType;
  message: string;
  severity: 'high' | 'medium';
}

export function SmartAlerts({ suppliers }: SmartAlertsProps) {
  const navigate = useNavigate();
  const alerts: Alert[] = [];

  // CND irregular alerts
  suppliers
    .filter((s) => s.fiscalStatus === 'irregular')
    .forEach((s) => {
      alerts.push({
        icon: ShieldX,
        message: `${s.name} com CND irregular – circuit breaker ativo`,
        severity: 'high',
      });
    });

  // Structural block alerts
  suppliers
    .filter((s) => s.structuralBlockActive)
    .forEach((s) => {
      alerts.push({
        icon: ShieldAlert,
        message: `${s.name} com bloqueio estrutural ativo`,
        severity: 'high',
      });
    });

  // Recurring operational issues
  suppliers
    .filter((s) => s.operationalEvents.filter((e) => e.type === 'avaria').length >= 2)
    .forEach((s) => {
      alerts.push({
        icon: Package,
        message: `${s.name} com avarias recorrentes no ERP`,
        severity: 'high',
      });
    });

  // Score downtrend detection (simple: if last month score < first month by >15)
  suppliers.forEach((s) => {
    if (s.monthlyScores.length >= 2) {
      const first = s.monthlyScores[0];
      const last = s.monthlyScores[s.monthlyScores.length - 1];
      const firstAvg = (first.fiscal + first.financial + first.operational) / 3;
      const lastAvg = (last.fiscal + last.financial + last.operational) / 3;
      if (firstAvg - lastAvg > 15) {
        alerts.push({
          icon: TrendingDown,
          message: `${s.name} com tendência de queda no score`,
          severity: 'medium',
        });
      }
    }
  });

  if (alerts.length === 0) return null;

  // Sort: high severity first, then show max 3
  const sorted = [...alerts].sort((a, b) => {
    if (a.severity === 'high' && b.severity !== 'high') return -1;
    if (a.severity !== 'high' && b.severity === 'high') return 1;
    return 0;
  });
  const topAlerts = sorted.slice(0, 3);
  const totalCount = alerts.length;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-risk-medium" />
          Alertas Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topAlerts.map((alert, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${
              alert.severity === 'high' ? 'bg-risk-high-bg' : 'bg-risk-medium-bg'
            }`}
          >
            <alert.icon
              className={`h-4 w-4 shrink-0 ${
                alert.severity === 'high' ? 'text-risk-high' : 'text-risk-medium'
              }`}
            />
            <p className="text-sm">{alert.message}</p>
          </div>
        ))}
        {totalCount > 3 && (
          <button
            onClick={() => navigate('/fornecedores')}
            className="text-xs text-primary hover:underline mt-1"
          >
            Ver todos os alertas ({totalCount})
          </button>
        )}
      </CardContent>
    </Card>
  );
}
