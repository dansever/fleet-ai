import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Contract } from '@/drizzle/types';
import { formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import {
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';

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
  const daysRemaining = calculateDaysRemaining(contract.effectiveTo || undefined);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;

  return (
    <Card className={cn('w-full max-w-4xl mx-auto shadow-lg bg-white', className)}>
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contract.title}</h1>
              <p className="text-sm text-gray-500">Contract ID: {contract.id}</p>
              <Badge variant="outline" className="mt-1">
                {contract.contractType.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="text-right space-y-2">
            {contract.processStatus && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(contract.processStatus)}
                <Badge
                  className={cn('text-sm font-medium', getStatusColor(contract.processStatus))}
                >
                  {contract.processStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}

            {isExpiringSoon && (
              <Badge variant="destructive" className="text-xs">
                Expires in {daysRemaining} days
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {/* Contract Overview */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
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

            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company Name</p>
                    <p className="text-lg font-semibold text-gray-900">{contract.vendorName}</p>
                  </div>

                  {contract.vendorAddress && (
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="text-sm text-gray-900">{contract.vendorAddress}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {contract.vendorContactName && (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.vendorContactName}
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.vendorContactEmail && (
                    <div className="flex items-center space-x-2">
                      <MailIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.vendorContactEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.vendorContactPhone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {contract.vendorContactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Key Terms */}
        {(() => {
          const contractDetails =
            contract.details && typeof contract.details === 'object'
              ? (contract.details as Record<string, unknown>)
              : {};
          const keyTerms = contractDetails.keyTerms;

          return (
            keyTerms &&
            Array.isArray(keyTerms) &&
            keyTerms.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Key Terms & Conditions</h3>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <ul className="space-y-3">
                    {keyTerms.map((term: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700 leading-relaxed">{term}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          );
        })()}

        {/* Vendor Comments */}
        {contract.vendorComments && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendor Comments</h3>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <UserIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">{contract.vendorComments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Contract created: {formatDate(contract.createdAt)}</span>
            <span>Last updated: {formatDate(contract.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
