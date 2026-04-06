import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, RefreshCw, Clock } from 'lucide-react';

const fields = [
  { name: 'cnpj', type: 'string', description: 'CNPJ do fornecedor' },
  { name: 'score_final', type: 'number (0–100)', description: 'Score de risco consolidado' },
  { name: 'status', type: 'string', description: 'Verde / Amarelo / Vermelho' },
  { name: 'status_fiscal', type: 'string', description: 'Regular / Irregular (via Audire)' },
  { name: 'ultima_atualizacao', type: 'ISO 8601', description: 'Timestamp da última atualização' },
];

const exampleResponse = `{
  "cnpj": "12.345.678/0001-90",
  "score_final": 74,
  "status": "Verde",
  "status_fiscal": "Regular",
  "ultima_atualizacao": "2024-03-15T08:30:00Z"
}`;

const ApiDados = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">API & Compartilhamento de Dados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          O Score de Risco e os status dos fornecedores podem ser consumidos via API REST por sistemas externos como ERPs, plataformas de BI e sistemas de compras.
        </p>
      </div>

      {/* Endpoint */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Endpoint Disponível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">GET</Badge>
            <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded-md flex-1">
              /api/fornecedores/score
            </code>
          </div>
          <p className="text-sm text-muted-foreground">
            Retorna o score de risco consolidado e o status atual de cada fornecedor monitorado.
          </p>
        </CardContent>
      </Card>

      {/* Fields */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Campos Disponibilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Campo</th>
                  <th className="text-left px-4 py-2 font-medium">Tipo</th>
                  <th className="text-left px-4 py-2 font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.name} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs">{f.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{f.type}</td>
                    <td className="px-4 py-2 text-muted-foreground">{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Example Response */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Exemplo de Resposta</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">
            {exampleResponse}
          </pre>
        </CardContent>
      </Card>

      {/* Update Frequency */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Frequência de Atualização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Automática (Diária)</p>
              <p className="text-xs text-muted-foreground">Os scores são recalculados automaticamente a cada 24h.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <RefreshCw className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Sob Demanda</p>
              <p className="text-xs text-muted-foreground">Utilize o botão "Atualizar agora" no painel do fornecedor para forçar reconsulta imediata.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Esta tela é conceitual e demonstra a capacidade de integração outbound da plataforma.
      </p>
    </div>
  );
};

export default ApiDados;
