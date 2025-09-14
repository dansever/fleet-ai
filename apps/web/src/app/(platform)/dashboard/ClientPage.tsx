'use client';

import { CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Airport, Rfq } from '@/drizzle/types';
import { BaseCard, MetricCard } from '@/stories/Card/Card';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  DollarSign,
  Target,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ActivityFeed } from './_components/ActivityFeed';
import { CatagorySpendingPie } from './_components/CatagorySpendingPie';
import { RiskAndCompliance } from './_components/RiskAndCompliance';

export default function DashboardClientPage({
  airports,
  rfqs,
}: {
  airports: Airport[];
  rfqs: Rfq[];
}) {
  // Chart colors
  const chartConfig = {
    spend: { label: 'Actual Spend' },
    budget: { label: 'Budget' },
    savings: { label: 'Savings' },
  };

  // Executive KPI Metrics
  const executiveMetrics = [
    {
      title: 'Total Spend',
      value: '$47.2M',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      description: 'YTD procurement spend',
    },
    {
      title: 'Cost Savings',
      value: '$1.8M',
      change: '-15.4%',
      trend: 'down',
      icon: Target,
      description: 'vs. previous year',
    },
    {
      title: 'Supplier Performance',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Award,
      description: 'On-time delivery',
    },
    {
      title: 'Risk Score',
      value: 'Low',
      change: '-12%',
      trend: 'neutral',
      icon: AlertTriangle,
      description: 'Supply chain risk',
    },
  ];

  // Monthly spend data
  const monthlySpendData = [
    { month: 'Jan', spend: 3.8, budget: 4.2, savings: 0.4 },
    { month: 'Feb', spend: 4.1, budget: 4.0, savings: 0.3 },
    { month: 'Mar', spend: 3.9, budget: 4.1, savings: 0.5 },
    { month: 'Apr', spend: 4.3, budget: 4.3, savings: 0.2 },
    { month: 'May', spend: 4.0, budget: 4.2, savings: 0.6 },
    { month: 'Jun', spend: 4.2, budget: 4.1, savings: 0.4 },
  ];

  // Category breakdown
  const categoryData = [
    { name: 'Aircraft Parts', value: 45, spend: 21.2 },
    { name: 'Fuel & Energy', value: 25, spend: 11.8 },
    { name: 'Ground Services', value: 15, spend: 7.1 },
    { name: 'IT & Technology', value: 8, spend: 3.8 },
    { name: 'Other', value: 7, spend: 3.3 },
  ];

  const categoryColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <div className="grid grid-cols-6 gap-4">
      {/* Executive KPI Metrics */}
      <div className="col-span-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            neutralChange={metric.trend === 'neutral'}
            icon={
              metric.trend === 'up' ? (
                <ArrowUpRight className="text-green-500" />
              ) : metric.trend === 'down' ? (
                <ArrowDownRight className="text-red-500" />
              ) : (
                <ArrowRight className="text-gray-500" />
              )
            }
          />
        ))}
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        {/* Charts and Analytics */}
        <BaseCard title="Monthly Spend vs Budget">
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="spend" fill="hsl(var(--chart-1))" name="Actual Spend ($M)" />
                <Bar dataKey="budget" fill="hsl(var(--chart-2))" name="Budget ($M)" />
                <Bar dataKey="savings" fill="hsl(var(--chart-4))" name="Savings ($M)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </BaseCard>

        <CatagorySpendingPie categoryData={categoryData} categoryColors={categoryColors} />
      </div>

      <div className="col-span-2 flex flex-col gap-4">
        <RiskAndCompliance />
        <ActivityFeed />
      </div>
    </div>
  );
}
