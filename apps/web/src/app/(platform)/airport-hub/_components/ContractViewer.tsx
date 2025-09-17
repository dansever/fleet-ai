import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getContractTypeDisplay, getProcessStatusDisplay } from '@/drizzle/enums';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { calculateProgress, safeDate } from '@/utils/date-helpers';
import { Building2, CalendarDays, Eye, Sparkles, Tag, Trash } from 'lucide-react';
import { useAirportHub } from '../ContextProvider';

export function ContractViewer({ contract }: { contract: Contract }) {
  const { selectedContract, refreshContracts, removeContract, setSelectedContract } =
    useAirportHub();

  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    const date = safeDate(dateString);
    return date
      ? date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Invalid date';
  };

  const daysRemaining = calculateDaysRemaining(contract.effectiveTo || undefined);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  // Calculate contract progress if both dates are available
  const contractProgress =
    contract.effectiveFrom && contract.effectiveTo
      ? calculateProgress(contract.effectiveFrom, contract.effectiveTo)
      : null;

  // Parse key terms JSON
  const keyTerms =
    contract.keyTerms && typeof contract.keyTerms === 'object'
      ? (contract.keyTerms as Record<string, unknown>)
      : {};

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <BaseCard
      headerClassName="from-blue-100 via-purple-100 to-orange-100"
      header={
        <div className="flex flex-row justify-between items-start">
          {/* Title, Subtitle, Badges */}
          <div className="flex flex-col gap-2">
            <h2>{contract.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{getContractTypeDisplay(contract.contractType)}</Badge>
              <Badge variant={getStatusBadgeVariant(contract.processStatus || 'pending')}>
                {getProcessStatusDisplay(contract.processStatus)}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {isExpiringSoon && !isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Expires in {daysRemaining} days
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <ContractDialog
              DialogType="view"
              contract={contract}
              trigger={<Button intent="secondary" text="View Contract" icon={Eye}></Button>}
              onChange={refreshContracts}
            />

            <ConfirmationPopover
              onConfirm={() => removeContract(contract.id)}
              trigger={<Button intent="secondary" icon={Trash} />}
              popoverIntent="danger"
              title="Delete Contract"
              description="Are you sure you want to delete this contract?"
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Period Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Contract Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Effective From:</span>
                <span className="text-sm">{formatDate(contract.effectiveFrom)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Effective To:</span>
                <span className="text-sm">{formatDate(contract.effectiveTo)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span>{contractProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    contractProgress && contractProgress > 80
                      ? 'bg-red-500'
                      : contractProgress && contractProgress > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${contractProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardContent className="space-y-4 py-2 rounded-lg bg-slate-50">
              <div className="space-y-2">
                <div className="font-medium text-gray-900">{contract.vendorName}</div>
                <div className="text-sm text-gray-600">{contract.vendorAddress}</div>
              </div>
            </CardContent>
            <CardContent className="space-y-4 py-2 rounded-lg bg-slate-50">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Contact Details:</div>
                <div className="text-sm">{contract.vendorContactName}</div>
                {contract.vendorContactEmail && (
                  <CopyableText className="text-sm" value={contract.vendorContactEmail} />
                )}
                <div className="text-sm">{contract.vendorContactPhone}</div>
              </div>
            </CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md italic">
                {contract.vendorComments && `Comments: ${contract.vendorComments}`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              Contract Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 leading-relaxed">{contract.summary}</div>
          </CardContent>
        </Card>

        {/* Key Terms Section */}
        {/* {Object.keys(keyTerms).length > 0 && ( */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5" />
              Key Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(keyTerms).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-900">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseCard>
  );
}
