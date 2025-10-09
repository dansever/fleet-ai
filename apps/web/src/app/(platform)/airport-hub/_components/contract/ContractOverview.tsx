'use client';

import { CopyableText } from '@/components/miscellaneous/CopyableText';
import { CardContent } from '@/components/ui/card';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDate, formatSnakeCaseToTitle } from '@/lib/core/formatters';
import { client as contractsClient } from '@/modules/contracts';
import { BaseCard } from '@/stories/Card/Card';
import { calculateProgress } from '@/utils/date-helpers';
import { AlertCircle, Building2, Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../../context';

export function ContractOverview() {
  const {
    selectedContract,
    selectedAirport,
    refreshContracts,
    removeContract,
    setSelectedContract,
  } = useAirportHub();

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
  const contractDetails =
    contract.details && typeof contract.details === 'object'
      ? (contract.details as Record<string, unknown>)
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
      toast.success('Contract has been permanently deleted');
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Warning Banner for Contract-Level Actions */}
      <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">Contract Management</p>
          <p className="text-xs text-blue-700 mt-1">
            This page manages the entire contract. To manage individual documents, navigate to the{' '}
            <span className="font-semibold">Files</span> tab.
          </p>
        </div>
      </div>

      <BaseCard
        className="border-0 p-0"
        contentClassName="p-0"
        footer={
          <div className="w-full flex flex-row gap-2 justify-between items-center text-sm text-gray-500">
            <p>Contract Created: {formatDate(contract.createdAt)}</p>
            <p>Last Updated: {formatDate(contract.updatedAt)}</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Contract Period Section */}
          <BaseCard cardType="inner" icon={<Calendar />} title="Contract Period">
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
          <BaseCard cardType="inner" icon={<Building2 />} title="Vendor Information">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-row gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p>Company Name</p>
                  <p className="font-semibold">{contract.vendorName}</p>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p>Address</p>
                  <p className="font-semibold">{contract.vendorAddress}</p>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <User className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <div>
                  <p>Contact Person</p>
                  <p className="font-semibold">{contract.vendorContactName}</p>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p>Email</p>
                  {contract.vendorContactEmail && (
                    <CopyableText
                      className="text-sm font-semibold"
                      value={contract.vendorContactEmail}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p>Phone</p>
                  <p className="font-semibold">{contract.vendorContactPhone}</p>
                </div>
              </div>
            </div>
          </BaseCard>

          {/* Summary Section */}
          <BaseCard cardType="inner" className="col-span-full">
            <div className="space-y-6">
              {contractDetails && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Key Details & Conditions</h3>
                  <Table>
                    <TableBody>
                      {contract.summary && (
                        <TableRow>
                          <TableCell className="font-bold">Summary</TableCell>
                          <TableCell className="whitespace-pre-wrap">{contract.summary}</TableCell>
                        </TableRow>
                      )}
                      {Object.entries(contractDetails).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-bold">{formatSnakeCaseToTitle(key)}</TableCell>
                          <TableCell className="whitespace-pre-wrap">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </BaseCard>
        </div>
      </BaseCard>
    </div>
  );
}
