import { ChartArea } from './_components/chart-area';
import { ChartBar } from './_components/chart-bar';
import { ChartLine } from './_components/chart-line';
import { ChartPie } from './_components/chart-pie';

export default function AnalyticsClientPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <ChartLine />
        <ChartBar />
        <ChartArea />
        <ChartPie />
      </div>
    </div>
  );
}
