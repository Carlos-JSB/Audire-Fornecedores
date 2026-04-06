import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getRecommendedAction } from '@/utils/riskCalculations';
import { useSuppliers } from '@/context/SuppliersContext';
import type { Supplier } from '@/data/mockData';

interface SupplierTableProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  highlightId?: string | null;
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 80 ? 'risk-badge-low' : score >= 60 ? 'risk-badge-medium' : 'risk-badge-high';
  return <div className={`${cls} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`}>{score}</div>;
}

function RiskBadge({ level, score }: { level: string; score: number }) {
  const cls = score >= 80 ? 'risk-badge-low' : score >= 60 ? 'risk-badge-medium' : 'risk-badge-high';
  return <div className={`${cls} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`}>{score}</div>;
}

export function SupplierTable({ suppliers, onSelectSupplier, highlightId }: SupplierTableProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState(false);
  const { toggleFavorite } = useSuppliers();

  const filtered = useMemo(() => {
    let result = [...suppliers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.cnpj.includes(q));
    }
    if (filter === 'fiscal') result = result.filter((s) => s.fiscalStatus === 'irregular');
    if (filter === 'financial') result = result.filter((s) => s.financialScore < 50);
    if (filter === 'operational') result = result.filter((s) => s.operationalScore < 50);
    result.sort((a, b) => (sortAsc ? a.finalScore - b.finalScore : b.finalScore - a.finalScore));
    return result;
  }, [suppliers, search, filter, sortAsc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-none shadow-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-none shadow-sm">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="fiscal">Fiscal Irregular</SelectItem>
            <SelectItem value="financial">Financeiro Crítico</SelectItem>
            <SelectItem value="operational">Operacional Crítico</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortAsc(!sortAsc)}
          className="bg-card border-none shadow-sm shrink-0"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl bg-card shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider w-10"></TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">Fornecedor</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Score Final</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Fiscal</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center">Crédito</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center hidden md:table-cell">Operacional</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center hidden md:table-cell">Judicial</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center hidden lg:table-cell">ESG</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-center hidden lg:table-cell">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supplier) => {
              const action = getRecommendedAction(supplier.finalScore, supplier.circuitBreakerActive);
              return (
                <TableRow
                  key={supplier.id}
                  id={`supplier-row-${supplier.id}`}
                  className={`cursor-pointer hover:bg-muted/50 transition-all duration-500 border-b border-border/30 ${highlightId === supplier.id ? 'bg-yellow-100/60 dark:bg-yellow-900/20' : ''}`}
                  onClick={() => onSelectSupplier(supplier)}
                >
                  <TableCell className="w-10 px-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(supplier.id);
                      }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          supplier.isFavorite
                            ? 'fill-current text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.cnpj}</p>
                      <div className="flex gap-1 mt-1">
                        {supplier.circuitBreakerActive && (
                          <Badge className="bg-risk-high-bg text-risk-high border-none text-[10px] px-1.5 py-0">Circuit Breaker</Badge>
                        )}
                        {supplier.structuralBlockActive && (
                          <Badge className="bg-risk-medium-bg text-risk-medium border-none text-[10px] px-1.5 py-0">Bloqueio Ativo</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <RiskBadge level={supplier.riskLevel} score={supplier.finalScore} />
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={supplier.fiscalScore} />
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={supplier.financialScore} />
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <ScoreBadge score={supplier.operationalScore} />
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <ScoreBadge score={supplier.judicialScore} />
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">
                    <ScoreBadge score={supplier.esgScore} />
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">
                    <Badge className={`${action.bgColor} ${action.color} border-none font-medium text-xs`}>
                      {action.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
