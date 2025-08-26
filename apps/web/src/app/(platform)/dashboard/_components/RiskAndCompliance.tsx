import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseCard } from '@/stories/Card/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function RiskAndCompliance() {
  return (
    <BaseCard title="Risk and Compliance" description="Risk and Compliance" className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Risk & Compliance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Low Risk</span>
            </div>
            <p className="text-2xl font-bold">67%</p>
            <p className="text-xs text-muted-foreground">of suppliers</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium">Medium Risk</span>
            </div>
            <p className="text-2xl font-bold">28%</p>
            <p className="text-xs text-muted-foreground">of suppliers</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">High Risk</span>
            </div>
            <p className="text-2xl font-bold">5%</p>
            <p className="text-xs text-muted-foreground">of suppliers</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-sm font-medium">Compliance</span>
            </div>
            <p className="text-2xl font-bold">98.2%</p>
            <p className="text-xs text-muted-foreground">rate</p>
          </div>
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium">Recent Alerts</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Supplier ABC Corp - Contract renewal due</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>XYZ Aviation - Late delivery alert</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>New supplier certified</span>
            </div>
          </div>
        </div>
      </CardContent>
    </BaseCard>
  );
}
