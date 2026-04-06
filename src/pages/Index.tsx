import { SlidersHorizontal, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICards } from '@/components/KPICards';
import { RiskDistributionChart } from '@/components/RiskDistributionChart';
import { IntegrationStatus } from '@/components/IntegrationStatus';
import { SmartAlerts } from '@/components/SmartAlerts';
import { Link, useNavigate } from 'react-router-dom';
import { useSRMConfig } from '@/context/SRMConfigContext';
import { useSuppliers } from '@/context/SuppliersContext';

function ScoreBadgeSmall({ score }: { score: number }) {
  const cls = score >= 70 ? 'risk-badge-low' : score >= 40 ? 'risk-badge-medium' : 'risk-badge-high';
  return <div className={`${cls} inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold`}>{score}</div>;
}

const Index = () => {
  const { computed } = useSuppliers();
  const { weights } = useSRMConfig();
  const navigate = useNavigate();

  const favorites = computed.filter((s) => s.isFavorite);
  const displayFavorites = favorites.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Dashboard Operacional</h1>
            <p className="text-xs text-muted-foreground">SRM & Auditoria Contínua</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPIs */}
        <KPICards suppliers={computed} />

        {/* Smart Alerts */}
        <SmartAlerts suppliers={computed} />

        {/* Favorites Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              Fornecedores Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Star className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Marque fornecedores como favoritos para acompanhá-los aqui
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayFavorites.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/fornecedores?highlight=${s.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.cnpj}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.circuitBreakerActive && (
                        <Badge className="bg-risk-high-bg text-risk-high border-none text-[10px] px-1.5 py-0">
                          Circuit Breaker
                        </Badge>
                      )}
                      <ScoreBadgeSmall score={s.finalScore} />
                    </div>
                  </div>
                ))}
                {favorites.length > 5 && (
                  <button
                    onClick={() => navigate('/fornecedores')}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Ver todos os favoritos
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts + Integrations + Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RiskDistributionChart suppliers={computed} />
          <IntegrationStatus />
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Pesos Ativos</h3>
              <Link to="/pesos-regras">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-xs">
                  <SlidersHorizontal className="h-3 w-3" /> Configurar
                </Badge>
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Fiscal (Audire)</span><span className="font-medium">{weights.fiscal}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Crédito (Crédito e Cobrança)</span><span className="font-medium">{weights.financial}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Operacional (ERP)</span><span className="font-medium">{weights.operational}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Judicial</span><span className="font-medium">{weights.judicial}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">ESG</span><span className="font-medium">{weights.esg}%</span></div>
            </div>
            <p className="text-xs text-muted-foreground">Somente leitura. Acesse Pesos & Regras para alterar.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
