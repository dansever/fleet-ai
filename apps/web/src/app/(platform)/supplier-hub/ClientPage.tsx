'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSidebar } from '@/components/ui/sidebar';
import { getStatusDisplay, UrgencyLevel, urgencyLevelDisplayMap } from '@/drizzle/schema/enums';
import { Rfq } from '@/drizzle/types';
import RfqDialog from '@/features/rfqs/RfqDialog';
import { formatDate } from '@/lib/core/formatters';
import { Button } from '@/stories/Button/Button';
import { ContentSection } from '@/stories/Card/Card';
import { DatePicker, ModernInput, ModernSelect, ModernTextarea } from '@/stories/Form/Form';
import { PageLayout } from '@/stories/PageLayout/PageLayout';
import { KeyValuePair } from '@/stories/Utilities/KeyValuePair';
import {
  Building2,
  Calculator,
  CheckCircle,
  DollarSign,
  FileText,
  Package,
  Send,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import RfqList from '../_components/RfqSidebar';
import { useSupplierHub } from './ContextProvider';

// Mock inventory data - will be replaced with real API calls later
const mockInventoryData = {
  partNumber: 'CFM56-7B26-1AF',
  partDescription: 'Engine Turbine Blade Assembly',
  availableQuantity: 5,
  condition: 'New',
  location: 'Warehouse A-12',
  internalCost: 85000,
  suggestedPrice: 125000,
  lastSold: 118000,
  leadTime: '14 days',
  certifications: ['FAA 8130-3', 'EASA Form 1'],
};

export default function SupplierHubClientPage() {
  const {
    incomingRfqs,
    orgId,
    refreshIncomingRfqs,
    selectedRfq,
    setSelectedRfq,
    addRfq,
    updateRfq,
    loading,
    errors,
  } = useSupplierHub();

  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Helper function to create default quote form (will be replaced with API data loading)
  const createDefaultQuoteForm = () => ({
    unitPrice: '',
    quantity: 1,
    totalPrice: '',
    leadTime: '12 hours',
    validUntil: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    notes: '',
    terms: 'Net 30',
  });

  // Quote form state
  const [quoteForm, setQuoteForm] = useState(createDefaultQuoteForm());

  const handleQuoteInputChange = (field: string, value: string | number) => {
    setQuoteForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate total price when unit price or quantity changes
      if (field === 'unitPrice' || field === 'quantity') {
        const unitPrice =
          parseFloat(field === 'unitPrice' ? value.toString() : prev.unitPrice) || 0;
        const quantity = field === 'quantity' ? Number(value) : prev.quantity;
        updated.totalPrice = (unitPrice * quantity).toFixed(2);
      }

      return updated;
    });
  };

  // Email preview state
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  // Reset form and related state when switching RFQs
  const resetQuoteForm = () => {
    setQuoteForm(createDefaultQuoteForm());
    setShowEmailPreview(false);
    setEmailContent('');
  };

  const generateEmailContent = () => {
    if (!selectedRfq) return '';

    const rfqNumber = selectedRfq.rfqNumber || `RFQ-${selectedRfq.id.slice(0, 8)}`;
    const partNumber = selectedRfq.partNumber;
    const partDescription = selectedRfq.partDescription;
    const validUntilDate = new Date(quoteForm.validUntil).toLocaleDateString();

    return `Subject: Quote Response for ${rfqNumber} - ${partNumber}

Dear Procurement Team,

Thank you for your RFQ regarding the following part:

RFQ Number: ${rfqNumber}
Part Number: ${partNumber}
Part Description: ${partDescription}
Requested Quantity: ${selectedRfq.quantity}

QUOTE DETAILS:
- Quoted Quantity: ${quoteForm.quantity}
- Unit Price: $${parseFloat(quoteForm.unitPrice || '0').toLocaleString()}
- Total Price: $${parseFloat(quoteForm.totalPrice || '0').toLocaleString()}
- Lead Time: ${quoteForm.leadTime}
- Payment Terms: ${quoteForm.terms}
- Quote Valid Until: ${validUntilDate}

INVENTORY STATUS:
- Condition: ${mockInventoryData.condition}
- Location: ${mockInventoryData.location}
- Certifications: ${mockInventoryData.certifications.join(', ')}

${
  quoteForm.notes
    ? `ADDITIONAL NOTES:
${quoteForm.notes}`
    : ''
}

We look forward to your response and the opportunity to work with you.

Best regards,
${mockInventoryData.partNumber} Supply Team

---
This quote is valid until ${validUntilDate} and subject to the terms and conditions outlined above.`;
  };

  const handleSendQuote = () => {
    const content = generateEmailContent();
    setEmailContent(content);
    setShowEmailPreview(true);
  };

  const handleConfirmSendQuote = () => {
    // TODO: Implement actual quote sending logic
    console.log('Sending quote:', quoteForm);
    console.log('Email content:', emailContent);
    setShowEmailPreview(false);
    alert('Quote sent successfully!');
  };

  // Sidebar content
  const sidebarContent = (
    <RfqList
      rfqs={incomingRfqs}
      onRfqSelect={(rfq) => {
        const selectedRfq = incomingRfqs.find((r: Rfq) => r.id === rfq.id);
        setSelectedRfq(selectedRfq || null);

        // Reset quote form when selecting new RFQ
        // TODO: Replace with API call to load existing quote data for this RFQ
        resetQuoteForm();
      }}
      selectedRfq={selectedRfq}
      onRefresh={() => refreshIncomingRfqs(true)}
      isRefreshing={loading.isRefreshing}
      isLoading={loading.incomingRfqs}
      onCreatedRfq={refreshIncomingRfqs}
      addedRfqDirection={'received'}
    />
  );

  // Header content
  const headerContent = selectedRfq ? (
    <div className="flex items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-semibold mb-1">
          {selectedRfq.rfqNumber || `RFQ-${selectedRfq.id.slice(0, 8)}`}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Status: <Badge>{getStatusDisplay(selectedRfq.status)}</Badge>
          </span>
          <span>Created: {formatDate(new Date(selectedRfq.createdAt))}</span>
          {selectedRfq.sentAt && <span>Sent: {formatDate(new Date(selectedRfq.sentAt))}</span>}
        </div>
      </div>

      <div className="flex gap-2">
        <RfqDialog
          rfq={selectedRfq}
          onChange={(updatedRfq) => {
            updateRfq(updatedRfq);
          }}
          triggerText="View Details"
          triggerIntent="secondary"
          DialogType="view"
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-xl font-semibold">Supplier Hub</h1>
      <p className="text-sm text-muted-foreground">Select an RFQ to respond with a quote</p>
    </div>
  );

  // Main content
  const mainContent = selectedRfq ? (
    <div className="grid grid-cols-5 gap-4">
      {/* RFQ Details Section */}
      <ContentSection
        header={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="font-semibold">RFQ Details</span>
          </div>
        }
        headerGradient="from-emerald-500 to-emerald-500"
        className="col-span-3"
      >
        <div className="grid grid-cols-2 gap-6">
          {/* General RFQ Details */}
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              RFQ Details
            </h4>
            <KeyValuePair label="Part Number" value={selectedRfq.partNumber} valueType="string" />
            <KeyValuePair
              label="Alt. Part Number"
              value={selectedRfq.altPartNumber}
              valueType="string"
            />
            <KeyValuePair label="Quantity" value={selectedRfq.quantity} valueType="string" />
            <KeyValuePair
              label="Unit of Measure"
              value={selectedRfq.unitOfMeasure}
              valueType="string"
            />
            <KeyValuePair
              label="Urgency Level"
              value={urgencyLevelDisplayMap[selectedRfq.urgencyLevel as UrgencyLevel]}
              valueType="string"
            />
            <KeyValuePair
              label="Part Description"
              value={selectedRfq.partDescription}
              valueType="string"
            />
            <KeyValuePair
              label="Date Sent"
              value={selectedRfq.sentAt && formatDate(new Date(selectedRfq.sentAt))}
              valueType="string"
            />
          </div>

          {/* Vendor Information */}
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Vendor Information
            </h4>
            <KeyValuePair label="Name" value={selectedRfq.vendorName} valueType="string" />
            <KeyValuePair label="Address" value={selectedRfq.vendorAddress} valueType="string" />
            <KeyValuePair
              label="Contact Name"
              value={selectedRfq.vendorContactName}
              valueType="string"
            />
            <KeyValuePair label="Email" value={selectedRfq.vendorContactEmail} valueType="email" />
            <KeyValuePair
              label=" Phone"
              value={selectedRfq.vendorContactPhone}
              valueType="string"
            />
          </div>
          <KeyValuePair
            className="col-span-full"
            label="Buyer Comments"
            valueClassName="justify-start w-full"
            value={selectedRfq.buyerComments}
            valueType="string"
          />
        </div>
      </ContentSection>

      {/* Inventory Status Section */}
      <ContentSection
        header={
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <span className="font-semibold">Inventory Status</span>
          </div>
        }
        headerGradient="from-emerald-500 to-emerald-400"
        className="col-span-2"
      >
        <div className="flex flex-col gap-4">
          {/* Availability Status */}
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Availability
            </h4>

            <KeyValuePair
              label="In Stock"
              value={mockInventoryData.availableQuantity}
              valueType="number"
            />
            <KeyValuePair
              label="Condition"
              value={mockInventoryData.condition}
              valueType="string"
            />
            <KeyValuePair label="Location" value={mockInventoryData.location} valueType="string" />
            <KeyValuePair label="Lead Time" value={mockInventoryData.leadTime} valueType="string" />
          </div>

          {/* Pricing Information */}
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Internal Pricing
            </h4>
            <div>
              <KeyValuePair
                label="Internal Cost"
                value={`$${mockInventoryData.internalCost.toLocaleString()}`}
                valueType="string"
              />
              <KeyValuePair
                label="Suggested Price"
                value={`$${mockInventoryData.suggestedPrice.toLocaleString()}`}
                valueType="string"
              />
              <KeyValuePair
                label="Last Sold For"
                value={`$${mockInventoryData.lastSold.toLocaleString()}`}
                valueType="string"
              />
              <KeyValuePair
                label="Margin"
                value={`${Math.round(((mockInventoryData.suggestedPrice - mockInventoryData.internalCost) / mockInventoryData.internalCost) * 100)}%`}
                valueType="string"
              />
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Certifications
            </h4>
            <div className="space-y-2">
              {mockInventoryData.certifications.map((cert, index) => (
                <Badge key={index} className="mr-2 mb-1 bg-blue-100 text-blue-800 border-blue-200">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Quote Generator Section */}
      <ContentSection
        className="col-span-full"
        header={
          <div className="flex flex-row items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span className="font-semibold">Quote Generator</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                intent="secondary"
                className="bg-white/20 text-white "
                icon={Sparkles}
                text="Auto Generate"
              />
            </div>
          </div>
        }
        headerGradient="from-blue-500 via-violet-500 to-purple-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Inputs */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Pricing Details</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quoted Quantity
                {selectedRfq?.quantity && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Requested: {selectedRfq.quantity})
                  </span>
                )}
              </label>
              <ModernInput
                type="number"
                min="1"
                max={selectedRfq?.quantity || undefined}
                placeholder="1"
                value={quoteForm.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuoteInputChange('quantity', parseInt(e.target.value) || 1)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price ($)</label>
              <ModernInput
                type="number"
                min={0}
                placeholder={mockInventoryData.suggestedPrice.toString()}
                value={quoteForm.unitPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuoteInputChange('unitPrice', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price ($)
              </label>
              <ModernInput
                type="number"
                min={0}
                placeholder="Auto-calculated"
                value={quoteForm.totalPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuoteInputChange('totalPrice', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time</label>
              <ModernInput
                type="text"
                placeholder="14 days"
                value={quoteForm.leadTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuoteInputChange('leadTime', e.target.value)
                }
              />
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Terms & Conditions</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              <ModernSelect
                value={quoteForm.terms}
                onValueChange={(value: string) => handleQuoteInputChange('terms', value)}
                options={[
                  { value: 'Net 30', label: 'Net 30 Days' },
                  { value: 'Net 15', label: 'Net 15 Days' },
                  { value: 'Due on Receipt', label: 'Due on Receipt' },
                  { value: '2/10 Net 30', label: '2% 10 Days, Net 30' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid Until
              </label>
              <DatePicker
                value={quoteForm.validUntil}
                onChange={(value: string) => handleQuoteInputChange('validUntil', value)}
              />
              {/* <ModernInput
                type="date"
                value={quoteForm.validUntil}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleQuoteInputChange('validUntil', e.target.value)
                }
              /> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <ModernTextarea
                placeholder="Any additional terms, conditions, or notes..."
                value={quoteForm.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleQuoteInputChange('notes', e.target.value)
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Send Quote Button */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <Button
            intent="success"
            size="lg"
            icon={Send}
            text="Preview & Send Quote"
            onClick={handleSendQuote}
            disabled={!quoteForm.unitPrice || !quoteForm.totalPrice || !quoteForm.quantity}
          />
        </div>
      </ContentSection>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-violet-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-12 h-12 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFQ Selected</h3>
      <p className="text-gray-600 max-w-sm">
        Select an RFQ from the sidebar to view details and generate a quote response.
      </p>
    </div>
  );

  return (
    <>
      <PageLayout
        sidebarContent={sidebarContent}
        headerContent={headerContent}
        mainContent={mainContent}
        sidebarWidth={isCollapsed ? '20rem' : '18rem'}
      />

      {/* Email Preview Dialog */}
      <Dialog open={showEmailPreview} onOpenChange={setShowEmailPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Review Quote Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Email Preview:</p>
              <div className="bg-white p-4 rounded border">
                <pre className="whitespace-pre-wrap text-sm font-mono">{emailContent}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                intent="secondary"
                text="Edit Quote"
                onClick={() => setShowEmailPreview(false)}
              />
              <Button
                intent="success"
                icon={Send}
                text="Send Quote"
                onClick={handleConfirmSendQuote}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
