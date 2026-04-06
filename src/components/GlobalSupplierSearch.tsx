import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, UserRoundSearch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSuppliers } from '@/context/SuppliersContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

// TODO: em produção, a busca consulta GET /api/fornecedores?q=<termo> no backend.
// O mock local é suficiente para o protótipo.

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70
    ? 'bg-risk-low-bg text-risk-low'
    : score >= 40
      ? 'bg-risk-medium-bg text-risk-medium'
      : 'bg-risk-high-bg text-risk-high';
  return (
    <span className={`${cls} inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold`}>
      {score}
    </span>
  );
}

export function GlobalSupplierSearch() {
  const { computed } = useSuppliers();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return computed
      .filter((s) => s.name.toLowerCase().includes(q) || s.cnpj.includes(q))
      .slice(0, 5);
  }, [query, computed]);

  const showDropdown = open && query.length >= 2;

  const handleSelect = useCallback((id: string) => {
    setQuery('');
    setOpen(false);
    setMobileExpanded(false);
    navigate(`/fornecedores?highlight=${id}`);
  }, [navigate]);

  const handleCadastrar = useCallback(() => {
    setQuery('');
    setOpen(false);
    setMobileExpanded(false);
    navigate('/fornecedores?cadastrar=true');
  }, [navigate]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setMobileExpanded(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Mobile: icon-only mode
  if (isMobile && !mobileExpanded) {
    return (
      <button
        onClick={() => {
          setMobileExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Buscar fornecedor"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar fornecedor ou CNPJ..."
          className="pl-9 h-8 text-sm bg-muted/50 border-border/50 w-56 focus:w-72 transition-all duration-200"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => handleSelect(s.id)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-muted/60 transition-colors text-left"
                  >
                    <UserRoundSearch className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.cnpj}</p>
                    </div>
                    <ScoreBadge score={s.finalScore} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Fornecedor não encontrado</p>
              <Button size="sm" variant="outline" onClick={handleCadastrar}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Cadastrar fornecedor
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
