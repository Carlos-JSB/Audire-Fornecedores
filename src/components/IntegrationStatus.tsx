import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, CreditCard, FileCheck, Scale, Clock } from 'lucide-react';

type SyncStatus = 'realtime' | 'periodic' | 'error';

const integrations: Array<{
  name: string;
  subtitle: string;
  icon: React.ElementType;
  status: 'active' | 'inactive';
  lastSync: string;
  syncStatus: SyncStatus;
}> = [
  {
    name: 'ERP',
    subtitle: 'Operacional',
    icon: Database,
    status: 'active' as const,
    lastSync: 'há 8 minutos',
    syncStatus: 'periodic' as const,
  },
  {
    name: 'Crédito e Cobrança',
    subtitle: 'Financeiro',
    icon: CreditCard,
    status: 'active' as const,
    lastSync: 'há 1 hora',
    syncStatus: 'periodic' as const,
  },
  {
    name: 'Audire',
    subtitle: 'Fiscal (Hub Central)',
    icon: FileCheck,
    status: 'active' as const,
    lastSync: 'Em tempo real',
    syncStatus: 'realtime' as const,
  },
  {
    name: 'Jurídico / CEIS',
    subtitle: 'Pendente contratação (Neoway / DataJud)',
    icon: Scale,
    status: 'inactive' as const,
    lastSync: 'Não configurado',
    syncStatus: 'error',
  },
];

export function IntegrationStatus() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Integrações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <div className="p-2 rounded-lg bg-card">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                Última sync: {item.lastSync}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${
                item.status === 'inactive' 
                  ? 'bg-muted-foreground/40' 
                  : item.syncStatus === 'error' 
                    ? 'bg-risk-high' 
                    : 'bg-integration-active'
              }`} />
              <span className="text-xs text-muted-foreground">
                {item.status === 'inactive' ? 'Não configurado' : 'Ativo'}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
