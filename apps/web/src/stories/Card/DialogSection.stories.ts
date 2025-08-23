import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DialogSection, KeyValuePair, TagList } from './Card';

const meta: Meta<typeof DialogSection> = {
  title: 'Components/Card/DialogSection',
  component: DialogSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A sectioned card component with gradient header, perfect for organizing content in dialogs, forms, or any structured layout. Now moved from Dialog to Card for better reusability.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title displayed in the gradient header',
    },
    gradient: {
      control: 'text',
      description: 'Tailwind gradient classes for the header background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogSection>;

// Basic DialogSection
export const Default: Story = {
  args: {
    title: 'Basic Information',
    children: (
      <div className="space-y-3">
        <KeyValuePair label="Name" value="Fleet AI Platform" />
        <KeyValuePair label="Version" value="1.0.0" />
        <KeyValuePair label="Status" value={true} />
      </div>
    ),
  },
};

// DialogSection with different gradient
export const CustomGradient: Story = {
  args: {
    title: 'Flight Details',
    gradient: 'from-emerald-500 to-teal-500',
    children: (
      <div className="space-y-3">
        <KeyValuePair label="Flight Number" value="FL-001" />
        <KeyValuePair label="Departure" value="JFK Airport" />
        <KeyValuePair label="Arrival" value="LAX Airport" />
        <KeyValuePair label="On Time" value={true} />
      </div>
    ),
  },
};

// DialogSection with mixed content
export const MixedContent: Story = {
  args: {
    title: 'Procurement Summary',
    gradient: 'from-orange-500 to-red-500',
    children: (
      <div className="space-y-4">
        <div className="space-y-3">
          <KeyValuePair label="Total RFQs" value={24} />
          <KeyValuePair label="Active Tenders" value={8} />
          <KeyValuePair label="Completed" value={16} />
        </div>
        <div>
          <p className="font-medium text-gray-600 mb-2">Categories</p>
          <TagList tags={['Fuel', 'Technical', 'Catering', 'Ground Support']} />
        </div>
      </div>
    ),
  },
};

// DialogSection with editable content
export const EditableContent: Story = {
  args: {
    title: 'Aircraft Information',
    gradient: 'from-purple-500 to-pink-500',
    children: (
      <div className="space-y-3">
        <KeyValuePair 
          label="Aircraft Type" 
          value="Boeing 737-800" 
          editMode={true}
          onChange={(value) => console.log('Aircraft Type changed:', value)}
        />
        <KeyValuePair 
          label="Capacity" 
          value={189} 
          editMode={true}
          onChange={(value) => console.log('Capacity changed:', value)}
        />
        <KeyValuePair 
          label="Active" 
          value={true} 
          editMode={true}
          onChange={(value) => console.log('Active changed:', value)}
        />
      </div>
    ),
  },
};

// Multiple sections
export const MultipleSections: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <DialogSection
        title="Basic Details"
        gradient="from-blue-500 to-violet-500"
      >
        <div className="space-y-3">
          <KeyValuePair label="Company" value="Fleet AI Corp" />
          <KeyValuePair label="Founded" value={2024} />
          <KeyValuePair label="Public" value={false} />
        </div>
      </DialogSection>
      
      <DialogSection
        title="Contact Information"
        gradient="from-green-500 to-emerald-500"
      >
        <div className="space-y-3">
          <KeyValuePair label="Email" value="contact@fleetai.com" />
          <KeyValuePair label="Phone" value="+1 (555) 123-4567" />
          <KeyValuePair label="Address" value="123 Aviation Blvd, Sky City" />
        </div>
      </DialogSection>
      
      <DialogSection
        title="Services"
        gradient="from-amber-500 to-orange-500"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <KeyValuePair label="Total Services" value={12} />
            <KeyValuePair label="24/7 Support" value={true} />
          </div>
          <div>
            <p className="font-medium text-gray-600 mb-2">Service Types</p>
            <TagList tags={['Procurement', 'Analytics', 'Automation', 'Support']} />
          </div>
        </div>
      </DialogSection>
    </div>
  ),
};
