import type { FuelBid } from '@/drizzle/types';
import FuelBidDialog from '@/features/fuel/bid/FuelBidDialog';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

// Mock fuel bid data
const mockFuelBid: FuelBid = {
  id: 'bid-123',
  tenderId: 'tender-456',
  title: 'Q4 Jet A-1 Fuel Bid - LAX',
  round: 2,
  bidSubmittedAt: '2024-01-15',
  vendorName: 'Shell Aviation',
  vendorAddress: '123 Aviation Way, Los Angeles, CA 90045',
  vendorContactName: 'John Smith',
  vendorContactEmail: 'john.smith@shell.com',
  vendorContactPhone: '+1-310-555-0123',
  vendorComments: 'Competitive pricing with volume discounts available',
  priceType: 'fixed',
  currency: 'USD',
  uom: 'USG',
  paymentTerms: 'Net 30',
  baseUnitPrice: '2.45',
  indexName: null,
  indexLocation: null,
  differential: null,
  differentialUnit: null,
  formulaNotes: null,
  intoPlaneFee: '0.15',
  handlingFee: '0.05',
  otherFee: null,
  otherFeeDescription: null,
  includesTaxes: false,
  includesAirportFees: true,
  densityAt15C: '0.775',
  normalizedUnitPriceUsdPerUsg: '2.65',
  aiSummary: 'Competitive fixed-price bid with standard terms and good vendor reputation.',
  decision: 'undecided',
  decisionByUserId: null,
  decisionAt: null,
  decisionNotes: null,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
};

const mockIndexLinkedBid: FuelBid = {
  ...mockFuelBid,
  id: 'bid-456',
  title: 'Q1 Jet A-1 Index-Linked Bid - JFK',
  priceType: 'index_formula',
  baseUnitPrice: null,
  indexName: 'Platts Jet A-1 Med',
  indexLocation: 'Mediterranean',
  differential: '0.25',
  differentialUnit: 'USD/USG',
  formulaNotes: 'Platts Jet A-1 Med + $0.25/USG differential',
  vendorName: 'BP Aviation',
  vendorContactName: 'Sarah Johnson',
  vendorContactEmail: 'sarah.johnson@bp.com',
  aiSummary: 'Index-linked pricing based on Platts Mediterranean with competitive differential.',
};

const meta: Meta<typeof FuelBidDialog> = {
  title: 'Dialog/FuelBidDialog',
  component: FuelBidDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive dialog for viewing, creating, and editing fuel bids with vendor information, pricing structure, and fee details.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    DialogType: {
      control: 'select',
      options: ['view', 'edit', 'add'],
      description: 'Type of dialog interaction',
    },
    buttonSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the trigger button',
    },
    bid: {
      description: 'Fuel bid data object (null for add mode)',
    },
    tenderId: {
      description: 'Required tender ID when creating new bids',
    },
    onChange: {
      description: 'Callback fired when bid is created or updated',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// View existing fuel bid with fixed pricing
export const ViewFixedPriceBid: Story = {
  args: {
    bid: mockFuelBid,
    DialogType: 'view',
    buttonSize: 'md',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid changed:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'View a fuel bid with fixed pricing structure, showing all vendor information and fee details.',
      },
    },
  },
};

// View index-linked pricing bid
export const ViewIndexLinkedBid: Story = {
  args: {
    bid: mockIndexLinkedBid,
    DialogType: 'view',
    buttonSize: 'md',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid changed:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'View a fuel bid with index-linked pricing based on market indices like Platts.',
      },
    },
  },
};

// Edit existing fuel bid
export const EditBid: Story = {
  args: {
    bid: mockFuelBid,
    DialogType: 'edit',
    buttonSize: 'md',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid updated:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit an existing fuel bid with all fields editable.',
      },
    },
  },
};

// Add new fuel bid
export const AddNewBid: Story = {
  args: {
    bid: null,
    tenderId: 'tender-789',
    DialogType: 'add',
    buttonSize: 'md',
    onChange: (bid: FuelBid) => {
      console.log('New fuel bid created:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Create a new fuel bid for a specific tender.',
      },
    },
  },
};

// Small button variant
export const SmallButton: Story = {
  args: {
    bid: mockFuelBid,
    DialogType: 'view',
    buttonSize: 'sm',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid changed:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Fuel bid dialog with small trigger button size.',
      },
    },
  },
};

// Large button variant
export const LargeButton: Story = {
  args: {
    bid: mockFuelBid,
    DialogType: 'view',
    buttonSize: 'lg',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid changed:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Fuel bid dialog with large trigger button size.',
      },
    },
  },
};

// Minimal bid data
export const MinimalBidData: Story = {
  args: {
    bid: {
      id: 'bid-minimal',
      tenderId: 'tender-minimal',
      title: 'Basic Fuel Bid',
      round: null,
      bidSubmittedAt: null,
      vendorName: 'Generic Fuel Co.',
      vendorAddress: null,
      vendorContactName: null,
      vendorContactEmail: null,
      vendorContactPhone: null,
      vendorComments: null,
      priceType: 'fixed',
      currency: 'USD',
      uom: 'USG',
      paymentTerms: null,
      baseUnitPrice: '2.50',
      indexName: null,
      indexLocation: null,
      differential: null,
      differentialUnit: null,
      formulaNotes: null,
      intoPlaneFee: null,
      handlingFee: null,
      otherFee: null,
      otherFeeDescription: null,
      includesTaxes: false,
      includesAirportFees: false,
      densityAt15C: null,
      normalizedUnitPriceUsdPerUsg: null,
      aiSummary: null,
      decision: null,
      decisionByUserId: null,
      decisionAt: null,
      decisionNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    DialogType: 'view',
    buttonSize: 'md',
    onChange: (bid: FuelBid) => {
      console.log('Fuel bid changed:', bid);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fuel bid dialog with minimal data, showing how the component handles null/empty values.',
      },
    },
  },
};
