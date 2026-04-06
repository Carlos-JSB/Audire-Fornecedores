import { createContext, useContext, useState } from 'react';
import {
  defaultWeights,
  defaultSeverityPenalties,
  defaultStructuralBlockConfigs,
  type SeverityPenalties,
  type StructuralBlockConfig,
} from '@/data/mockData';
import type { Weights } from '@/utils/riskCalculations';

interface SRMConfigContextValue {
  weights: Weights;
  setWeights: (w: Weights) => void;
  severity: SeverityPenalties;
  setSeverity: (s: SeverityPenalties) => void;
  structuralBlockConfigs: StructuralBlockConfig[];
  setStructuralBlockConfigs: (configs: StructuralBlockConfig[]) => void;
  // TODO: em produção, este contexto é populado via GET /api/configuracoes/pesos
  // e GET /api/configuracoes/bloqueios-estruturais na inicialização da sessão.
  // Alterações disparam POST /api/configuracoes/pesos com registro em audit_log (Fase 1).
}

const SRMConfigContext = createContext<SRMConfigContextValue | null>(null);

export function SRMConfigProvider({ children }: { children: React.ReactNode }) {
  const [weights, setWeights] = useState<Weights>(defaultWeights);
  const [severity, setSeverity] = useState<SeverityPenalties>(defaultSeverityPenalties);
  const [structuralBlockConfigs, setStructuralBlockConfigs] = useState<StructuralBlockConfig[]>(
    defaultStructuralBlockConfigs
  );

  return (
    <SRMConfigContext.Provider value={{ weights, setWeights, severity, setSeverity, structuralBlockConfigs, setStructuralBlockConfigs }}>
      {children}
    </SRMConfigContext.Provider>
  );
}

export function useSRMConfig() {
  const ctx = useContext(SRMConfigContext);
  if (!ctx) throw new Error('useSRMConfig deve ser usado dentro de SRMConfigProvider');
  return ctx;
}
