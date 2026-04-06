import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Building2, MapPin, Users, Receipt, Briefcase,
} from 'lucide-react';
import { cadastralDataBySupplier, type CadastralData } from '@/data/cadastralMockData';

interface Props {
  supplierId: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-right max-w-[60%]">{value || '—'}</span>
    </div>
  );
}

function SectionIcon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

export function SupplierCadastralData({ supplierId }: Props) {
  const data: CadastralData | undefined = cadastralDataBySupplier[supplierId];

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Dados cadastrais não disponíveis para este fornecedor.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={['geral', 'estabelecimento', 'socios', 'tributario', 'atividades']} className="space-y-2">
      {/* 1) Informações Gerais */}
      <AccordionItem value="geral" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <SectionIcon icon={Building2} label="Informações Gerais" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-0">
            <InfoRow label="Raiz do CNPJ" value={data.raizCnpj} />
            <InfoRow label="Razão Social" value={data.razaoSocial} />
            <InfoRow label="Capital Social" value={data.capitalSocial} />
            <InfoRow label="Porte da Empresa" value={data.porteEmpresa} />
            <InfoRow label="Natureza Jurídica" value={data.naturezaJuridica} />
            <InfoRow label="Qualificação do Responsável" value={data.qualificacaoResponsavel} />
            <InfoRow label="Criado em" value={new Date(data.criadoEm).toLocaleDateString('pt-BR')} />
            <InfoRow label="Atualizado em" value={new Date(data.atualizadoEm).toLocaleDateString('pt-BR')} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2) Estabelecimento */}
      <AccordionItem value="estabelecimento" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <SectionIcon icon={MapPin} label="Estabelecimento" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-0">
            <InfoRow label="CNPJ" value={data.cnpjCompleto} />
            <InfoRow label="Tipo" value={data.tipo} />
            <InfoRow label="Nome Fantasia" value={data.nomeFantasia} />
            <div className="flex justify-between py-1.5 border-b border-border/30">
              <span className="text-xs text-muted-foreground">Situação Cadastral</span>
              <Badge variant={data.situacaoCadastral === 'Ativa' ? 'default' : 'destructive'} className="text-xs">
                {data.situacaoCadastral}
              </Badge>
            </div>
            <InfoRow label="Data da Situação" value={new Date(data.dataSituacaoCadastral).toLocaleDateString('pt-BR')} />
            <InfoRow label="Início das Atividades" value={new Date(data.dataInicioAtividades).toLocaleDateString('pt-BR')} />
            <InfoRow label="País" value={data.pais} />
            <InfoRow label="Estado" value={data.estado} />
            <InfoRow label="Cidade" value={data.cidade} />
            <InfoRow label="CEP" value={data.cep} />
            <InfoRow label="Logradouro" value={`${data.logradouro}, ${data.numero}`} />
            {data.complemento && <InfoRow label="Complemento" value={data.complemento} />}
            <InfoRow label="Bairro" value={data.bairro} />
            <InfoRow label="Telefone(s)" value={data.telefones.join(' | ')} />
            <InfoRow label="E-mail" value={data.email} />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3) Sócios */}
      <AccordionItem value="socios" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <SectionIcon icon={Users} label={`Sócios (${data.socios.length})`} />
        </AccordionTrigger>
        <AccordionContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">CPF/CNPJ</TableHead>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Tipo</TableHead>
                  <TableHead className="text-xs">Entrada</TableHead>
                  <TableHead className="text-xs">Qualificação</TableHead>
                  <TableHead className="text-xs">Faixa Etária</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.socios.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{s.cpfCnpj}</TableCell>
                    <TableCell className="text-xs font-medium">{s.nome}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-xs">{s.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(s.dataEntrada).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-xs">{s.qualificacao}</TableCell>
                    <TableCell className="text-xs">{s.faixaEtaria}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 4) Regime Tributário */}
      <AccordionItem value="tributario" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <SectionIcon icon={Receipt} label="Regime Tributário" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-0">
            <div className="flex justify-between py-1.5 border-b border-border/30">
              <span className="text-xs text-muted-foreground">Optante pelo Simples Nacional</span>
              <Badge variant={data.optanteSimples ? 'default' : 'secondary'} className="text-xs">
                {data.optanteSimples ? 'Sim' : 'Não'}
              </Badge>
            </div>
            {data.optanteSimples && data.dataOpcaoSimples && (
              <InfoRow label="Data da Opção" value={new Date(data.dataOpcaoSimples).toLocaleDateString('pt-BR')} />
            )}
            {data.dataExclusaoSimples && (
              <InfoRow label="Data de Exclusão" value={new Date(data.dataExclusaoSimples).toLocaleDateString('pt-BR')} />
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-xs text-muted-foreground">Optante pelo MEI</span>
              <Badge variant={data.optanteMEI ? 'default' : 'secondary'} className="text-xs">
                {data.optanteMEI ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 5) Atividades Econômicas */}
      <AccordionItem value="atividades" className="border rounded-lg px-4">
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <SectionIcon icon={Briefcase} label="Atividades Econômicas" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Atividade Principal</p>
              <p className="text-xs font-medium bg-muted/50 rounded-md p-2">{data.atividadePrincipal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Atividades Secundárias</p>
              <div className="space-y-1">
                {data.atividadesSecundarias.map((a, i) => (
                  <p key={i} className="text-xs bg-muted/30 rounded-md p-2">{a}</p>
                ))}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
