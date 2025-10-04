'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { getContractTypeDisplayName, getProcessStatusDisplay } from '@/drizzle/enums';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { formatDate } from '@/lib/core/formatters';
import { client as contractsClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { calculateProgress } from '@/utils/date-helpers';
import { Eye, MapPin, Quote, Sparkles, Trash, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractOverview() {
  const { selectedContract, refreshContracts, removeContract, setSelectedContract } =
    useAirportHub();

  if (!selectedContract) {
    return (
      <BaseCard title="Please select a contract to view its details">
        <CardContent>
          <div className="text-center py-8 text-gray-500 flex flex-col gap-4">
            <p className="text-sm">
              Select a contract from the list to view its details, edit it, or delete it.
            </p>
          </div>
        </CardContent>
      </BaseCard>
    );
  }

  const contract = selectedContract;

  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const deleteContract = async (contractId: string) => {
    try {
      await contractsClient.deleteContract(contractId);
      removeContract(contractId);
      setSelectedContract(null);
      toast.success('Contract has been deleted');
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
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
              <Badge variant="outline">{getContractTypeDisplayName(contract.contractType)}</Badge>
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
              onConfirm={() => deleteContract(contract.id)}
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
        <BaseCard title="Contract Period">
          <div className="space-y-4">
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
          </div>
        </BaseCard>

        {/* Vendor Information Section */}
        <BaseCard title="Vendor Information">
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-slate-50">
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-900 font-semibold">{contract.vendorName}</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div className="text-gray-600">{contract.vendorAddress}</div>
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div className="font-medium text-gray-600 underline">Contact Details</div>
                </div>
                <div>{contract.vendorContactName}</div>
                {contract.vendorContactEmail && (
                  <CopyableText className="text-sm" value={contract.vendorContactEmail} />
                )}
                <div>{contract.vendorContactPhone}</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 text-sm">
              <div className="flex items-center space-x-2">
                <Quote className="h-4 w-4 text-gray-400" />
                <div className="text-gray-600 font-medium underline">Comments</div>
              </div>
              {contract.vendorComments && (
                <span className="italic">{`"${contract.vendorComments}"`}</span>
              )}
            </div>
          </div>
        </BaseCard>

        {/* Summary Section */}
        <BaseCard title="Contract Summary" icon={<Sparkles />} className="lg:col-span-2">
          {contract.summary ? (
            <div>
              <div className="text-gray-700 leading-relaxed">{contract.summary}</div>
            </div>
          ) : (
            <div className="text-gray-500">No summary available</div>
          )}
        </BaseCard>
      </div>
    </BaseCard>
  );
}
