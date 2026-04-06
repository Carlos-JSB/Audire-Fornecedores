import { useState, useMemo } from 'react';
import { Upload, Search, Plus, ShieldCheck, ShieldX, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Supplier } from '@/data/mockData';
import { audireSuppliers } from '@/data/mockData';

interface AddSupplierModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (supplier: Supplier) => void;
  existingCnpjs?: string[];
}

export function AddSupplierModal({ open, onClose, onAdd, existingCnpjs = [] }: AddSupplierModalProps) {
  const [manualCnpj, setManualCnpj] = useState('');
  const [manualName, setManualName] = useState('');

  // Audire list state
  const [audireSearch, setAudireSearch] = useState('');
  const [audireFilter, setAudireFilter] = useState<'all' | 'regular' | 'irregular'>('all');
  const [selectedCnpjs, setSelectedCnpjs] = useState<Set<string>>(new Set());

  const filteredAudire = useMemo(() => {
    return audireSuppliers
      .filter((s) => !existingCnpjs.includes(s.cnpj))
      .filter((s) => {
        if (audireFilter !== 'all' && s.fiscalStatus !== audireFilter) return false;
        if (audireSearch) {
          const q = audireSearch.toLowerCase();
          return s.name.toLowerCase().includes(q) || s.cnpj.includes(q);
        }
        return true;
      });
  }, [audireSearch, audireFilter, existingCnpjs]);

  const toggleCnpj = (cnpj: string) => {
    setSelectedCnpjs((prev) => {
      const next = new Set(prev);
      if (next.has(cnpj)) next.delete(cnpj); else next.add(cnpj);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedCnpjs.size === filteredAudire.length) {
      setSelectedCnpjs(new Set());
    } else {
      setSelectedCnpjs(new Set(filteredAudire.map((s) => s.cnpj)));
    }
  };

  const handleManualAdd = () => {
    if (!manualCnpj || !manualName) {
      toast.error('Preencha todos os campos');
      return;
    }
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: manualName,
      cnpj: manualCnpj,
      fiscalScore: 75,
      fiscalStatus: 'regular',
      financialScore: 60,
      operationalScore: 80,
      judicialScore: 70,
      esgScore: 65,
      finalScore: 72,
      riskLevel: 'medium',
      circuitBreakerActive: false,
      structuralBlockActive: false,
      isFavorite: false,
      cnpjInapto: false,
      listaRestritiva: false,
      dividaAtiva: false,
      recuperacaoJudicial: false,
      operationalEvents: [],
      monthlyScores: [],
      auditTrail: [],
      lastUpdated: new Date().toISOString(),
    };
    onAdd(newSupplier);
    setManualCnpj('');
    setManualName('');
    toast.success('Fornecedor adicionado com sucesso');
    onClose();
  };

  const handleUpload = () => {
    toast.success('Planilha processada: 3 fornecedores importados');
    onClose();
  };

  const handleAudireImport = () => {
    if (selectedCnpjs.size === 0) {
      toast.error('Selecione ao menos um fornecedor');
      return;
    }
    const selected = audireSuppliers.filter((s) => selectedCnpjs.has(s.cnpj));
    selected.forEach((s) => {
      const newSupplier: Supplier = {
        id: Date.now().toString() + s.cnpj,
        name: s.name,
        cnpj: s.cnpj,
        fiscalScore: s.fiscalScore,
        fiscalStatus: s.fiscalStatus,
        financialScore: Math.round(50 + Math.random() * 40),
        operationalScore: Math.round(50 + Math.random() * 40),
        judicialScore: Math.round(50 + Math.random() * 40),
        esgScore: Math.round(40 + Math.random() * 50),
        finalScore: 0,
        riskLevel: 'medium',
        circuitBreakerActive: false,
        structuralBlockActive: false,
        isFavorite: false,
        cnpjInapto: s.fiscalStatus === 'irregular',
        listaRestritiva: false,
        dividaAtiva: false,
        recuperacaoJudicial: false,
        operationalEvents: [],
        monthlyScores: [],
        auditTrail: [
          { date: new Date().toISOString().split('T')[0], description: 'Fornecedor importado do Audire com dados fiscais', type: 'system' as const },
        ],
        lastUpdated: new Date().toISOString(),
      };
      onAdd(newSupplier);
    });
    toast.success(`${selected.length} fornecedor(es) importado(s) do Audire`);
    setSelectedCnpjs(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Adicionar Fornecedores</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="audire" className="mt-2 flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="audire" className="text-xs">Audire</TabsTrigger>
            <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="audire" className="mt-4 flex flex-col min-h-0 flex-1 space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Database className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Selecione fornecedores já cadastrados no seu sistema Audire para importá-los ao monitoramento SRM com dados fiscais pré-carregados.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  className="pl-9 h-9 text-sm"
                  value={audireSearch}
                  onChange={(e) => setAudireSearch(e.target.value)}
                />
              </div>
              <Select value={audireFilter} onValueChange={(v) => setAudireFilter(v as any)}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto border border-border rounded-lg min-h-0">
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground sticky top-0">
                <Checkbox
                  checked={filteredAudire.length > 0 && selectedCnpjs.size === filteredAudire.length}
                  onCheckedChange={toggleAll}
                />
                <span className="flex-1">Fornecedor</span>
                <span className="w-20 text-center">Fiscal</span>
                <span className="w-16 text-center">Status</span>
              </div>
              {filteredAudire.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">Nenhum fornecedor encontrado.</p>
              ) : (
                filteredAudire.map((s) => (
                  <label
                    key={s.cnpj}
                    className="flex items-center gap-3 px-3 py-2.5 border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedCnpjs.has(s.cnpj)}
                      onCheckedChange={() => toggleCnpj(s.cnpj)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.cnpj} · {s.city}/{s.state}</p>
                    </div>
                    <div className="w-20 text-center">
                      <Badge variant="outline" className="text-xs">{s.fiscalScore}</Badge>
                    </div>
                    <div className="w-16 flex justify-center">
                      {s.fiscalStatus === 'regular' ? (
                        <ShieldCheck className="h-4 w-4 text-risk-low" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-risk-high" />
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                {selectedCnpjs.size} de {filteredAudire.length} selecionado(s)
              </span>
              <Button onClick={handleAudireImport} disabled={selectedCnpjs.size === 0} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Importar Selecionados
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Arraste ou clique para enviar</p>
              <p className="text-xs text-muted-foreground">
                Envie uma planilha com os CNPJs dos seus fornecedores para iniciar o monitoramento.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Excel (.xlsx) ou CSV</p>
            </div>
            <Button onClick={handleUpload} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Processar Planilha
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="CNPJ"
                value={manualCnpj}
                onChange={(e) => setManualCnpj(e.target.value)}
              />
              <Input
                placeholder="Nome do Fornecedor"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <Button onClick={handleManualAdd} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
