import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Database, CreditCard, Share2, Clock } from 'lucide-react';

const integrations = [
  {
    name: 'Audire – Fiscal (RPA)',
    description: 'Dados fiscais consolidados: CND, situação fiscal, certidões e obrigações acessórias. Fonte centralizada para consulta e distribuição via API.',
    status: 'Conectado',
    statusColor: 'bg-risk-low',
    icon: FileCheck,
    lastSync: 'Em tempo real',
    syncStatus: 'realtime' as const,
  },
  {
    name: 'ERP – Operacional',
    description: 'Eventos operacionais como atrasos de entrega, avarias, SLAs e notas fiscais de entrada. Sincronização periódica com o sistema ERP do cliente.',
    status: 'Sincronização periódica',
    statusColor: 'bg-chart-financial',
    icon: Database,
    lastSync: 'há 8 minutos',
    syncStatus: 'periodic' as const,
  },
  {
    name: 'Crédito e Cobrança – Financeiro',
    description: 'Score de risco de crédito, histórico de inadimplência e indicadores financeiros normalizados para a escala 0–100.',
    status: 'Conectado',
    statusColor: 'bg-risk-low',
    icon: CreditCard,
    lastSync: 'há 1 hora',
    syncStatus: 'periodic' as const,
  },
  {
    name: 'API Externa (Clientes)',
    description: 'O Score de Risco e os status dos fornecedores podem ser consumidos por ERPs, sistemas de compras e plataformas de BI do cliente via API REST.',
    status: 'Disponível',
    statusColor: 'bg-primary',
    icon: Share2,
    lastSync: 'Disponível sob demanda',
    syncStatus: 'realtime' as const,
  },
];

const Integracoes = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Integrações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral das conexões entre o SRM e os sistemas externos que compõem o ecossistema de gestão de risco.
        </p>
      </div>

      <div className="grid gap-4">
        {integrations.map((item) => (
          <Card key={item.name} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-muted">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <Badge variant="outline" className="shrink-0 gap-1.5 font-normal">
                      <span className={`h-2 w-2 rounded-full ${item.statusColor}`} />
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Última sync: {item.lastSync}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Os dados exibidos são conceituais e representam a arquitetura de integração da plataforma.
      </p>
    </div>
  );
};

export default Integracoes;
