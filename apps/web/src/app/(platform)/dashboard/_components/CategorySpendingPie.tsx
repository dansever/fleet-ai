import { CardContent } from '@/components/ui/card';
import { BaseCard } from '@/stories/Card/Card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'; // use Recharts' Tooltip to be safe

type CategoryDatum = { name: string; value: number }; // value = spend amount (e.g. in millions)

export function CategorySpendingPie({
  categoryData,
  categoryColors,
}: {
  categoryData: CategoryDatum[];
  categoryColors: string[];
}) {
  const total = categoryData.reduce((acc, d) => acc + d.value, 0);

  return (
    <BaseCard title="Spend by Category">
      <CardContent className="pt-0">
        {/* Give the container a real height so the chart can render */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ name, value }) => {
                  const pct = total ? Math.round((Number(value) / total) * 100) : 0;
                  return `${name}: ${pct}%`;
                }}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={categoryColors[index % categoryColors.length]}
                  />
                ))}
              </Pie>

              {/* Safe tooltip using Recharts */}
              <Tooltip
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as CategoryDatum;
                    const pct = total ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-medium">{d.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {pct}% (${d.value.toLocaleString()}M)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </BaseCard>
  );
}
