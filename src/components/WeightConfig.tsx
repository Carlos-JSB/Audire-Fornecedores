import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Lock, LockOpen } from 'lucide-react';
import type { Weights } from '@/utils/riskCalculations';
import type { PillarSubscores } from '@/data/mockData';

interface WeightConfigProps {
  weights: Weights;
  onWeightsChange: (weights: Weights) => void;
  subscores?: PillarSubscores;
}

export function WeightConfig({ weights, onWeightsChange, subscores }: WeightConfigProps) {
  const [lockedKeys, setLockedKeys] = useState<Set<keyof Weights>>(new Set());

  const toggleLock = (key: keyof Weights) => {
    setLockedKeys((prev) => {
      const next = new Set(prev);
      const freeCount = Object.keys(weights).length - prev.size;
      if (!prev.has(key) && freeCount <= 1) return prev;
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleChange = (key: keyof Weights, value: number[]) => {
    if (lockedKeys.has(key)) return;

    const newVal = value[0];
    const lockedTotal = Array.from(lockedKeys).reduce((sum, k) => sum + weights[k], 0);
    const freeKeys = (Object.keys(weights) as (keyof Weights)[]).filter(
      (k) => k !== key && !lockedKeys.has(k)
    );

    const maxVal = 100 - lockedTotal;
    const clampedVal = Math.min(newVal, maxVal);
    const remaining = maxVal - clampedVal;

    const freeTotal = freeKeys.reduce((sum, k) => sum + weights[k], 0);
    const newWeights = { ...weights, [key]: clampedVal };

    if (freeTotal > 0) {
      for (const k of freeKeys) {
        newWeights[k] = Math.round((weights[k] / freeTotal) * remaining);
      }
    } else {
      const each = Math.round(remaining / freeKeys.length);
      for (const k of freeKeys) {
        newWeights[k] = each;
      }
    }

    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (total !== 100 && freeKeys.length > 0) {
      newWeights[freeKeys[0]] += 100 - total;
    }

    onWeightsChange(newWeights);
  };

  const pillarKeyMap: Record<string, string> = {
    fiscal: 'fiscal',
    financial: 'financial',
    operational: 'operational',
    judicial: 'judicial',
    esg: 'esg',
  };

  const sliders = [
    { key: 'fiscal' as const, label: 'Fiscal (Audire)', color: 'bg-chart-fiscal' },
    { key: 'financial' as const, label: 'Crédito e Cobrança', color: 'bg-chart-financial' },
    { key: 'operational' as const, label: 'Operacional (ERP)', color: 'bg-chart-operational' },
    { key: 'judicial' as const, label: 'Judicial', color: 'bg-primary' },
    { key: 'esg' as const, label: 'ESG', color: 'bg-primary' },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Configuração de Pesos</CardTitle>
          <Badge variant="secondary" className="font-normal text-xs">Admin</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {sliders.map((s) => {
          const subCount = subscores?.[pillarKeyMap[s.key]]?.length;
          return (
            <div key={s.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLock(s.key)}
                    className={`p-1 rounded transition-colors ${
                      lockedKeys.has(s.key)
                        ? 'text-primary bg-primary/10 hover:bg-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title={lockedKeys.has(s.key) ? 'Clique para destravar' : 'Clique para travar este peso'}
                  >
                    {lockedKeys.has(s.key)
                      ? <Lock className="h-3.5 w-3.5" />
                      : <LockOpen className="h-3.5 w-3.5" />
                    }
                  </button>
                  <span className="text-sm font-medium">{s.label}</span>
                  {subCount && (
                    <Badge variant="outline" className="text-xs font-normal px-1.5 py-0">
                      {subCount} subscores
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold">{weights[s.key]}%</span>
              </div>
              <Slider
                value={[weights[s.key]]}
                onValueChange={(val) => handleChange(s.key, val)}
                max={100}
                min={0}
                step={5}
                disabled={lockedKeys.has(s.key)}
                className={`cursor-pointer ${lockedKeys.has(s.key) ? 'opacity-50' : ''}`}
              />
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground text-center">
          A soma dos pesos deve ser 100%. Use o cadeado{' '}
          <Lock className="h-3 w-3 inline-block mx-0.5" />{' '}
          para fixar um pilar e distribuir o restante nos demais.
        </p>
      </CardContent>
    </Card>
  );
}
