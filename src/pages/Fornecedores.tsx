// Página de listagem de fornecedores.
// Estado de supplierList centralizado em SuppliersContext.
// TODO: em produção, mover para React Query — GET /api/fornecedores

import { useState, useEffect } from 'react';
import { useSuppliers } from '@/context/SuppliersContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupplierTable } from '@/components/SupplierTable';
import { AddSupplierModal } from '@/components/AddSupplierModal';
import { SupplierDetail } from '@/components/SupplierDetail';
import { useSearchParams } from 'react-router-dom';
import type { Supplier } from '@/data/mockData';
import type { Weights } from '@/utils/riskCalculations';

interface FornecedoresProps {
  suppliers: Supplier[];
  weights: Weights;
  onSelectSupplier: (supplier: Supplier) => void;
  onAddSupplier: (supplier: Supplier) => void;
  existingCnpjs: string[];
}

const Fornecedores = ({ suppliers, weights, onSelectSupplier, onAddSupplier, existingCnpjs }: FornecedoresProps) => {
  const { updateSupplier } = useSuppliers();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Auto-open add modal from query string
  useEffect(() => {
    if (searchParams.get('cadastrar') === 'true') {
      setAddModalOpen(true);
      setSearchParams((prev) => {
        prev.delete('cadastrar');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Highlight supplier from query string
  useEffect(() => {
    const id = searchParams.get('highlight');
    if (id) {
      setHighlightId(id);
      // Clean the query param
      setSearchParams((prev) => {
        prev.delete('highlight');
        return prev;
      }, { replace: true });

      // Scroll to element
      requestAnimationFrame(() => {
        const el = document.getElementById(`supplier-row-${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      // Remove highlight after 2 seconds
      const timer = setTimeout(() => setHighlightId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailOpen(true);
    onSelectSupplier(supplier);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Fornecedores Monitorados</h1>
            <p className="text-xs text-muted-foreground">SRM & Auditoria Contínua</p>
          </div>
          <Button onClick={() => setAddModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar Fornecedores
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold mb-3">Fornecedores Monitorados</h2>
          <SupplierTable suppliers={suppliers} onSelectSupplier={handleSelectSupplier} highlightId={highlightId} />
        </div>
      </main>

      {/* Modals */}
      <AddSupplierModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={onAddSupplier}
        existingCnpjs={existingCnpjs}
      />
      <SupplierDetail
        supplier={selectedSupplier}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        weights={weights}
        onSupplierUpdate={(updated) => {
          setSelectedSupplier(updated);
          updateSupplier(updated);
        }}
      />
    </div>
  );
};

export default Fornecedores;
