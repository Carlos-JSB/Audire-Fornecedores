import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Supplier } from '@/data/mockData';

interface RiskDistributionChartProps {
  suppliers: Supplier[];
}

export function RiskDistributionChart({ suppliers }: RiskDistributionChartProps) {
  const distribution = [
    {
      name: 'Baixo Risco',
      value: suppliers.filter((s) => s.riskLevel === 'low').length,
      color: 'hsl(145, 58%, 42%)',
    },
    {
      name: 'Risco Médio',
      value: suppliers.filter((s) => s.riskLevel === 'medium').length,
      color: 'hsl(36, 90%, 50%)',
    },
    {
      name: 'Alto Risco',
      value: suppliers.filter((s) => s.riskLevel === 'high').length,
      color: 'hsl(0, 72%, 51%)',
    },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Distribuição de Risco</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} fornecedores`, '']}
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '13px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
