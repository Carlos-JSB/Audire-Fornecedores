import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronDown, Plus, Settings2, AlertTriangle } from 'lucide-react';
import type { PillarSubscores, Subscore, SeverityPenalties } from '@/data/mockData';

interface SubscoreConfigProps {
  subscores: PillarSubscores;
  onSubscoresChange: (subscores: PillarSubscores) => void;
  // Novas props:
  severity: SeverityPenalties;
  onSeverityChange: (severity: SeverityPenalties) => void;
}

const pillarLabels: Record<string, string> = {
  fiscal: 'Fiscal (Audire)',
  financial: 'Crédito e Cobrança',
  operational: 'Operacional (ERP)',
  judicial: 'Judicial',
  esg: 'ESG',
};

const severityItems: { key: keyof SeverityPenalties; label: string; description: string }[] = [
  { key: 'leve',     label: 'Penalidade Leve',  description: 'Atrasos curtos, pendências menores' },
  { key: 'media',    label: 'Penalidade Média',  description: 'Atrasos recorrentes, avarias moderadas' },
  { key: 'forte',    label: 'Penalidade Forte',  description: 'Avarias graves, inadimplência parcial' },
  { key: 'redFlag',  label: 'Red Flag',          description: 'Fraude detectada, falha crítica de compliance' },
];

export function SubscoreConfig({ subscores, onSubscoresChange, severity, onSeverityChange }: SubscoreConfigProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({});

  const togglePillar = (key: string) => {
    setOpenPillars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubscoreChange = (pillarKey: string, subscoreId: string, newWeight: number) => {
    const pillar = subscores[pillarKey];
    const otherItems = pillar.filter((s) => s.id !== subscoreId);
    const remaining = 100 - newWeight;
    const otherTotal = otherItems.reduce((sum, s) => sum + s.weight, 0);

    const updated = pillar.map((s) => {
      if (s.id === subscoreId) return { ...s, weight: newWeight };
      if (otherTotal > 0) return { ...s, weight: Math.round((s.weight / otherTotal) * remaining) };
      return { ...s, weight: Math.round(remaining / otherItems.length) };
    });

    // Fix rounding
    const total = updated.reduce((sum, s) => sum + s.weight, 0);
    if (total !== 100) {
      const first = updated.find((s) => s.id !== subscoreId);
      if (first) first.weight += 100 - total;
    }

    onSubscoresChange({ ...subscores, [pillarKey]: updated });
  };

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Subscores por Pilar
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure o peso relativo de cada critério dentro do pilar. A soma dos subscores dentro do pilar deve ser 100%.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(subscores).map(([pillarKey, items]) => (
            <Collapsible
              key={pillarKey}
              open={openPillars[pillarKey] || false}
              onOpenChange={() => togglePillar(pillarKey)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{pillarLabels[pillarKey] || pillarKey}</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {items.length} subscores
                  </Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openPillars[pillarKey] ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 pb-1 px-1">
                <div className="space-y-4 pl-2 border-l-2 border-muted ml-2">
                  {items.map((sub) => (
                    <div key={sub.id} className="space-y-1.5 pl-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{sub.label}</span>
                        <span className="text-sm font-bold">{sub.weight}%</span>
                      </div>
                      <Slider
                        value={[sub.weight]}
                        onValueChange={(val) => handleSubscoreChange(pillarKey, sub.id, val[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Soma: {items.reduce((s, i) => s + i.weight, 0)}% — deve ser 100%
                </p>

                {/* TODO: em produção, severidade pode ser configurada por pilar individualmente.
                    No protótipo, os mesmos valores de SeverityPenalties são exibidos em todos os pilares
                    para comunicar que a severidade é uma penalidade intra-pilar, não global. */}
                {/* Severidade do pilar */}
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Penalidades de severidade — afetam o score deste pilar
                  </p>
                  <div className="space-y-2">
                    {severityItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Input
                            type="number"
                            value={severity[item.key]}
                            onChange={(e) => onSeverityChange({
                              ...severity,
                              [item.key]: Number(e.target.value)
                            })}
                            className="w-16 h-7 text-xs text-center"
                            max={0}
                            min={-100}
                            step={1}
                          />
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Valores negativos representam dedução no score deste pilar.
                  </p>
                </div>

                <div className="flex justify-center mt-2">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => setModalOpen(true)}>
                    <Plus className="h-3 w-3" />
                    Adicionar subscore
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Subscore</DialogTitle>
            <DialogDescription>
              Somente administradores da plataforma podem criar novos subscores.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se sua organização precisa incluir novos critérios de avaliação de risco, entre em contato com o suporte da plataforma.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
