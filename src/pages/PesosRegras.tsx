import { useState } from 'react';
import { WeightConfig } from '@/components/WeightConfig';
import { SubscoreConfig } from '@/components/SubscoreConfig';
import { defaultSubscores } from '@/data/mockData';
import type { PillarSubscores } from '@/data/mockData';
import { Info, AlertTriangle, LockKeyhole, ShieldCheck, HelpCircle, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useSRMConfig } from '@/context/SRMConfigContext';
import { defaultWeights, defaultSeverityPenalties, defaultStructuralBlockConfigs } from '@/data/mockData';

const PesosRegras = () => {
  const { weights, setWeights, severity, setSeverity, structuralBlockConfigs, setStructuralBlockConfigs } = useSRMConfig();
  const [subscores, setSubscores] = useState<PillarSubscores>(defaultSubscores);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Track changes via wrapper setters (context setters are called on save)
  const [localWeights, setLocalWeights] = useState(weights);
  const [localSeverity, setLocalSeverity] = useState(severity);
  const [localBlockConfigs, setLocalBlockConfigs] = useState(structuralBlockConfigs);

  const handleWeightsChange = (w: typeof weights) => { setLocalWeights(w); setHasUnsavedChanges(true); };
  const handleSeverityChange = (s: typeof severity) => { setLocalSeverity(s); setHasUnsavedChanges(true); };
  const handleSubscoresChange = (s: PillarSubscores) => { setSubscores(s); setHasUnsavedChanges(true); };
  const handleBlockConfigToggle = (id: string, ativo: boolean) => {
    setLocalBlockConfigs((prev) => prev.map((c) => c.id === id ? { ...c, ativo } : c));
    setHasUnsavedChanges(true);
  };

  const handleRestore = () => {
    setLocalWeights(defaultWeights);
    setLocalSeverity(defaultSeverityPenalties);
    setLocalBlockConfigs(defaultStructuralBlockConfigs);
    setSubscores(defaultSubscores);
    setHasUnsavedChanges(false);
    setShowRestoreDialog(false);
  };

  const handleSave = () => {
    // TODO: POST /api/configuracoes/pesos → atualiza score_configs (log de auditoria: changed_by, changed_at, weights).
    // Os pesos vigentes são gravados como weights_snapshot em cada registro de supplier_scores no momento do cálculo.
    setWeights(localWeights);
    setSeverity(localSeverity);
    setStructuralBlockConfigs(localBlockConfigs);
    setHasUnsavedChanges(false);
    setShowSaveDialog(false);
    toast({
      title: "Configuração de pesos atualizada com sucesso",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header with title, unsaved badge, and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Pesos & Regras</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure os pesos de cada pilar de risco e as regras de exceção aplicadas ao cálculo do Score Final.
            </p>
          </div>
          {hasUnsavedChanges && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100 shrink-0">
              Alterações não salvas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowRestoreDialog(true)} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar Padrão
          </Button>
          <Button size="sm" disabled={!hasUnsavedChanges} onClick={() => setShowSaveDialog(true)} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Modelo de Score Determinístico v1.0</strong> — Alterações nos pesos valem para scores calculados a partir de agora. Cada score registra os pesos usados no momento do cálculo, garantindo rastreabilidade histórica sem depender de versionamento de configuração.
        </p>
      </div>

      <WeightConfig weights={localWeights} onWeightsChange={handleWeightsChange} subscores={subscores} />

      <SubscoreConfig subscores={subscores} onSubscoresChange={handleSubscoresChange} severity={localSeverity} onSeverityChange={handleSeverityChange} />

      {/* Circuit Breaker Rule */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Circuit Breaker — Travamento Automático
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ativado automaticamente pelo sistema. Não pode ser desativado pelo tenant.
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm leading-relaxed">
              Quando um fornecedor fica com situação fiscal irregular, o score é automaticamente
              travado em 20 — independente do desempenho nos outros pilares. Essa regra é definida
              pelo sistema e não pode ser desativada.
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Quando o status fiscal de um fornecedor (CND ou situação fiscal via Audire) estiver como <strong>Irregular</strong>,
          o Score Final é automaticamente forçado para <strong>20</strong>, independentemente dos demais pilares.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Essa regra garante que fornecedores com pendências fiscais graves sejam sinalizados imediatamente,
          mesmo que apresentem bom desempenho financeiro e operacional.
        </p>
        <p className="text-xs text-muted-foreground italic">
          Circuit breakers são lógica fixa em código — não são configuráveis por tenant. Novos circuit breakers exigem deploy.
        </p>
      </div>

      {/* Separator between Circuit Breaker and Bloqueios Estruturais */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <p className="text-xs text-muted-foreground text-center shrink-0">
          Circuit Breakers são automáticos e valem para todos · Bloqueios Estruturais são configurados por você
        </p>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Structural Block Configs (Engine Configurável) */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-risk-high" />
                Bloqueios Estruturais — Regras do Tenant
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Você decide quais regras estão ativas para o seu tenant.
              </p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="text-sm leading-relaxed">
                Você define quais situações bloqueiam ou alertam um fornecedor. Exemplo: ativar
                'CNPJ Inapto' faz o sistema sinalizar automaticamente qualquer fornecedor nessa
                situação. As regras disponíveis são definidas pelo time de produto — você pode
                ativar ou desativar cada uma para o seu tenant.
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Instruction line */}
          <div className="flex items-start gap-2 pb-1">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              As regras disponíveis são definidas pelo time de produto. Você pode ativar ou desativar cada uma para o seu tenant, mas não é possível criar novas regras aqui.
            </p>
          </div>

          {/* MVP warning — updated */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-risk-medium-bg">
            <AlertTriangle className="h-4 w-4 text-risk-medium shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                ⚠️ Nenhuma regra ativa. Ative as regras que fazem sentido para o seu negócio.
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Os valores de gatilho estão pendentes de validação com especialista fiscal e jurídico.
              </p>
            </div>
          </div>

          {localBlockConfigs.map((config) => (
            <div key={config.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id={config.id}
                checked={config.ativo}
                onCheckedChange={(checked) => handleBlockConfigToggle(config.id, !!checked)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor={config.id} className="text-sm font-medium cursor-pointer">{config.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Campo avaliado: <code className="text-xs bg-muted px-1 rounded">{config.campo_origem}</code></p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-xs ${config.acao_recomendada === 'bloquear' ? 'text-risk-high border-risk-high/30' : 'text-risk-medium border-risk-medium/30'}`}
                >
                  {config.acao_recomendada === 'bloquear' ? 'Bloquear' : 'Alertar'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {config.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-risk-high-bg mt-2">
            <AlertTriangle className="h-4 w-4 text-risk-high shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Importante:</strong> Bloqueios estruturais sobrepõem o cálculo de score.
              Quando acionados, o Score Final pode continuar visível, mas a Ação Recomendada exibirá{' '}
              <strong className="text-risk-high">"Bloqueado por evento crítico"</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Restore Defaults Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar configuração padrão</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá restaurar todos os pesos para os valores padrão. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar nova versão</AlertDialogTitle>
            <AlertDialogDescription>
              Os novos pesos serão salvos e passarão a valer para todos os scores calculados a partir de agora. Scores já calculados registram os pesos que foram usados na época — a rastreabilidade histórica está garantida no próprio registro do score. Confirmar alteração?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Publicar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PesosRegras;
