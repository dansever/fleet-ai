import { Badge } from '@/components/ui/badge';
import { CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Contract } from '@/drizzle/types';
import ContractDialog from '@/features/contracts/contracts/ContractDialog';
import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import { client as contractsClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import {
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  Eye,
  FileTextIcon,
  HouseIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  Trash,
  UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

interface ContractViewerProps {
  contract: Contract;
  className?: string;
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'executed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
    case 'draft':
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'expired':
    case 'terminated':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'executed':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'pending':
    case 'draft':
    case 'under_review':
      return <ClockIcon className="h-4 w-4 text-yellow-600" />;
    default:
      return <FileTextIcon className="h-4 w-4 text-gray-600" />;
  }
};

const calculateDaysRemaining = (endDate?: string) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export function ContractViewer({ contract, className }: ContractViewerProps) {
  const { selectedContract, refreshContracts, removeContract, setSelectedContract } =
    useAirportHub();
  const daysRemaining = calculateDaysRemaining(contract.effectiveTo || undefined);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;

  const handleDeleteContract = async () => {
    try {
      if (!selectedContract) return;

      // Delete from server first
      await contractsClient.deleteContract(selectedContract.id);

      // Immediately update local state - removeContract is synchronous
      removeContract(selectedContract.id);

      // Clear selection since the contract no longer exists
      setSelectedContract(null);

      toast.success('Contract has been deleted');
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  return (
    <div>
      <BaseCard
        header={
          <CardHeader className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            {/* Main Header Row */}
            <div className="flex items-start justify-between">
              {/* Left Section - Contract Info */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                  <FileTextIcon className="h-7 w-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900">{contract.title}</h2>
                  {/* Status and Metadata Row */}
                  <div className="flex items-center justify-between">
                    {/* Left Section - Status Badges */}
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {contract.contractType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {contract.processStatus && (
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(contract.processStatus)}
                          <Badge className={cn(getStatusColor(contract.processStatus))}>
                            {contract.processStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Expiration Warning */}
                    {isExpiringSoon && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                          Expires in {daysRemaining} days
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <ContractDialog
                  contract={selectedContract}
                  DialogType="view"
                  trigger={<Button intent="secondary" text="View" icon={Eye} />}
                  onChange={refreshContracts}
                />
                <ConfirmationPopover
                  onConfirm={handleDeleteContract}
                  trigger={<Button intent="secondary" text="Delete" icon={Trash} />}
                  popoverIntent="danger"
                  title="Delete Contract"
                  description="Are you sure you want to delete this contract?"
                />
              </div>
            </div>
          </CardHeader>
        }
      >
        <div className="space-y-4">
          {/* Contract Overview */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-xl border border-green-200">
            <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Contract Period</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Effective From</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(contract.effectiveFrom)}
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Effective To</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(contract.effectiveTo)}
                </p>
              </div>

              {daysRemaining !== null && (
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      daysRemaining <= 0
                        ? 'text-red-600'
                        : daysRemaining <= 30
                          ? 'text-yellow-600'
                          : 'text-green-600',
                    )}
                  >
                    {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vendor Information */}
          {(contract as any).vendorName && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BuildingIcon className="h-5 w-5 text-gray-600" />
                <span>Vendor Information</span>
              </h3>

              <div className="bg-gray-50 px-4 py-2 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <HouseIcon className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Company Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {contract.vendorAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-sm text-gray-900">{contract.vendorAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.vendorContactName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="text-sm font-medium text-gray-900">
                            {contract.vendorContactEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="text-sm font-medium text-gray-900">
                            {contract.vendorContactPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contract Summary */}
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contract Summary</h3>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed">{contract.summary}</p>
              </div>
            </div>
          </>

          {/* Key Terms */}
          {contract.keyTerms &&
            Array.isArray(contract.keyTerms) &&
            contract.keyTerms.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Terms & Conditions</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <ul className="space-y-3">
                      {contract.keyTerms.map((term: string, index: number) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700 leading-relaxed">{term}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

          {/* Vendor Comments */}
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Comments</h3>
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <UserIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{contract.vendorComments}</p>
                </div>
              </div>
            </div>
          </>

          {/* Document Footer */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Contract created: {formatDate(contract.createdAt)}</span>
              <span>Last updated: {formatDate(contract.updatedAt)}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
}
