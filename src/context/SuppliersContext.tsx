import { createContext, useContext, useState, useMemo } from 'react';
import { suppliers as initialSuppliers } from '@/data/mockData';
import { recalculateSuppliersWithSeverity } from '@/utils/riskCalculations';
import type { Supplier } from '@/data/mockData';
import { useSRMConfig } from '@/context/SRMConfigContext';

interface SuppliersContextValue {
  supplierList: Supplier[];           // lista bruta (sem recálculo)
  computed: Supplier[];               // lista com scores recalculados (weights + severity aplicados)
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  toggleFavorite: (id: string) => void;
  // TODO: em produção, supplierList é populado via GET /api/fornecedores na inicialização.
  // addSupplier dispara POST /api/fornecedores.
  // updateSupplier dispara PATCH /api/fornecedores/:id.
  // toggleFavorite dispara PATCH /api/fornecedores/:id/favorito (tenant_id derivado do token).
}

const SuppliersContext = createContext<SuppliersContextValue | null>(null);

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [supplierList, setSupplierList] = useState<Supplier[]>(initialSuppliers);
  const { weights, severity } = useSRMConfig();

  const computed = useMemo(
    () => recalculateSuppliersWithSeverity(supplierList, weights, severity),
    [supplierList, weights, severity]
  );

  const addSupplier = (s: Supplier) => setSupplierList((prev) => [...prev, s]);
  const updateSupplier = (s: Supplier) =>
    setSupplierList((prev) => prev.map((x) => x.id === s.id ? s : x));
  const toggleFavorite = (id: string) =>
    setSupplierList((prev) =>
      prev.map((s) => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)
    );
  // TODO: em produção, toggleFavorite dispara PATCH /api/fornecedores/:id/favorito

  return (
    <SuppliersContext.Provider value={{ supplierList, computed, addSupplier, updateSupplier, toggleFavorite }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error('useSuppliers deve ser usado dentro de SuppliersProvider');
  return ctx;
}
