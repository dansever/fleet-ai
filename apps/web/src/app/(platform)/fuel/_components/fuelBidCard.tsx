'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FuelBid } from '@/drizzle/types';
import { formatCurrency, formatDate } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import {
  Building2,
  Calculator,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Fuel,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface FuelBidCardProps {
  bid: FuelBid;
  className?: string;
}

export function FuelBidCard({ bid, className }: FuelBidCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDecisionConfig = () => {
    switch (bid.decision) {
      case 'accepted':
        return {
          badge: (
            <Badge className="bg-emerald-500 text-white shadow-lg">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          ),
          borderColor: 'border-l-emerald-500',
          bgGradient: 'from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/30',
        };
      case 'rejected':
        return {
          badge: (
            <Badge className="bg-red-500 text-white shadow-lg">
              <XCircle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          ),
          borderColor: 'border-l-red-500',
          bgGradient: 'from-red-50/50 via-transparent to-transparent dark:from-red-950/30',
        };
      default:
        return {
          badge: (
            <Badge className="bg-amber-500 text-white shadow-lg">
              <Clock className="w-3 h-3 mr-1" />
              Open
            </Badge>
          ),
          borderColor: 'border-l-amber-500',
          bgGradient: 'from-amber-50/50 via-transparent to-transparent dark:from-amber-950/30',
        };
    }
  };

  const decisionConfig = getDecisionConfig();

  return (
    <Card
      className={cn(
        'group hover:shadow-xl transition-all duration-500 border-l-4 bg-gradient-to-br overflow-hidden',
        decisionConfig.borderColor,
        decisionConfig.bgGradient,
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xl text-balance leading-tight mb-2">{bid.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg w-fit">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(bid.bidSubmittedAt || '')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">{bid.vendorName}</span>
                  </div>
                  <Badge variant="secondary" className="shadow-sm">
                    Round {bid.round}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">{decisionConfig.badge}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Summary - Prominent Display */}
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-green-500 rounded-lg shadow-sm">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="h-full">
              <p className="text-xs text-muted-foreground">Base Price</p>
              <p className="font-semibold">
                {formatCurrency(bid.baseUnitPrice)} / {bid.uom}
              </p>
              <p className="text-xs text-muted-foreground">{bid.currency}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <div className="h-full">
              <p className="text-xs text-muted-foreground">Price Type</p>
              <p className="font-semibold capitalize">{bid.priceType?.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground truncate">{bid.indexName || ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="h-full">
              <p className="text-xs text-muted-foreground">Normalized (USD/USG)</p>
              <p className="font-semibold">{formatCurrency(bid.normalizedUnitPriceUsdPerUsg)}</p>
              <p className="text-xs text-muted-foreground">
                Density: {bid.densityAt15C || ''} kg/m³
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-500 rounded-lg shadow-sm">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="h-full">
              <p className="text-xs text-muted-foreground">Payment Terms</p>
              <p className="font-semibold">{bid.paymentTerms}</p>
              <p className="text-xs text-muted-foreground">+ Additional Fees</p>
            </div>
          </div>
        </div>
        <div className="relative p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm">
          <div className="absolute top-2 right-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                AI Analysis
              </p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {bid.aiSummary}
            </p>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
            >
              <span className="font-medium">
                {isExpanded ? 'Hide Detailed Information' : 'View Detailed Information'}
              </span>
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendor Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Vendor Information
                </h4>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl space-y-3 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium text-sm">{bid.vendorAddress || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{bid.vendorContactName || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{bid.vendorContactEmail || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{bid.vendorContactPhone || ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Pricing Breakdown
                </h4>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl space-y-3 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Index Reference</span>
                    </div>
                    <span className="font-medium text-sm">
                      {bid.indexName || ''} {bid.indexLocation && `(${bid.indexLocation})`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm">Differential</span>
                    <span className="font-medium text-sm">
                      {bid.differential && Number.parseFloat(bid.differential) > 0 ? '+' : ''}
                      {bid.differential || ''} {bid.differentialUnit && `(${bid.differentialUnit})`}
                    </span>
                  </div>
                  <div className="py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm text-muted-foreground">Formula Notes:</span>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {bid.formulaNotes || ''}
                    </p>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm">Into-Plane Fee</span>
                    <span className="font-medium text-sm">
                      {formatCurrency(bid.intoPlaneFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-sm">Handling Fee</span>
                    <span className="font-medium text-sm">
                      {formatCurrency(bid.handlingFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">{bid.otherFeeDescription || 'Other Fee'}</span>
                    <span className="font-medium text-sm">{formatCurrency(bid.otherFee || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
              <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                Inclusions & Exclusions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  {bid.includesTaxes ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Taxes {bid.includesTaxes ? 'Included' : 'Excluded'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  {bid.includesAirportFees ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Airport Fees {bid.includesAirportFees ? 'Included' : 'Excluded'}
                  </span>
                </div>
              </div>
            </div>

            {/* Decision Tracking */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl">
              <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                Decision Tracking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Decision Date</p>
                    <p className="font-medium">
                      {bid.decisionAt ? formatDate(bid.decisionAt.toString()) : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Decision By</p>
                    <p className="font-medium">
                      User ID:{' '}
                      {bid.decisionByUserId ? bid.decisionByUserId.slice(0, 8) + '...' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Vendor Comments
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {bid.vendorComments || ''}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                  Decision Notes
                </h4>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {bid.decisionNotes || ''}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
