import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { KeyValuePair } from './KeyValuePair';

const meta: Meta<typeof KeyValuePair> = {
  title: 'Components/Utilities/KeyValuePair',
  component: KeyValuePair,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible utility component for displaying structured key-value information with support for different data types and edit modes. Perfect for forms, details views, and data display.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'The label/key to display',
    },
    value: {
      control: 'text',
      description: 'The value to display (string, number, boolean, or ReactNode)',
    },
    editMode: {
      control: 'boolean',
      description: 'Whether the component is in edit mode',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof KeyValuePair>;

// String value
export const StringValue: Story = {
  args: {
    label: 'Company Name',
    value: 'Fleet AI Corporation',
  },
};

// Number value
export const NumberValue: Story = {
  args: {
    label: 'Employee Count',
    value: 150,
  },
};

// Boolean value (true)
export const BooleanTrue: Story = {
  args: {
    label: 'Active Status',
    value: true,
  },
};

// Boolean value (false)
export const BooleanFalse: Story = {
  args: {
    label: 'Public Company',
    value: false,
  },
};

// Long text value
export const LongText: Story = {
  args: {
    label: 'Description',
    value:
      'Fleet AI is a comprehensive platform for aviation procurement, analytics, and automation. We help airlines and aviation companies streamline their operations through intelligent technology solutions.',
  },
};

// Editable string
export const EditableString: Story = {
  args: {
    label: 'Aircraft Model',
    value: 'Boeing 737-800',
    editMode: true,
    onChange: (value) => console.log('String changed:', value),
  },
};

// Editable number
export const EditableNumber: Story = {
  args: {
    label: 'Passenger Capacity',
    value: 189,
    editMode: true,
    onChange: (value) => console.log('Number changed:', value),
  },
};

// Editable boolean
export const EditableBoolean: Story = {
  args: {
    label: 'Wi-Fi Available',
    value: true,
    editMode: true,
    onChange: (value) => console.log('Boolean changed:', value),
  },
};

// Multiple KeyValuePairs
export const MultipleItems: Story = {
  render: () =>
    createElement(
      'div',
      { className: 'space-y-0' },
      createElement(KeyValuePair, {
        label: 'Flight Number',
        value: 'AA-1234',
        valueType: 'string',
      }),
      createElement(KeyValuePair, {
        label: 'Departure Time',
        value: '14:30 UTC',
        valueType: 'string',
      }),
      createElement(KeyValuePair, { label: 'Duration', value: 385, valueType: 'number' }),
      createElement(KeyValuePair, { label: 'On Schedule', value: true, valueType: 'boolean' }),
      createElement(KeyValuePair, { label: 'Gate', value: 'B12', valueType: 'string' }),
    ),
};

// Mixed edit modes
export const MixedEditModes: Story = {
  render: () =>
    createElement(
      'div',
      { className: 'space-y-0' },
      createElement(KeyValuePair, {
        label: 'Airline Code',
        value: 'FL',
        valueType: 'string',
        editMode: false,
      }),
      createElement(KeyValuePair, {
        label: 'Flight Number',
        value: '001',
        valueType: 'string',
        editMode: true,
        onChange: (value) => console.log('Flight number:', value),
      }),
      createElement(KeyValuePair, {
        label: 'Passengers',
        value: 156,
        valueType: 'number',
        editMode: true,
        onChange: (value) => console.log('Passengers:', value),
      }),
      createElement(KeyValuePair, {
        label: 'Catering Required',
        value: true,
        valueType: 'boolean',
        editMode: true,
        onChange: (value) => console.log('Catering:', value),
      }),
      createElement(KeyValuePair, {
        label: 'Status',
        value: false,
        valueType: 'boolean',
        editMode: false,
      }),
    ),
};

// With custom styling
export const CustomStyling: Story = {
  render: () =>
    createElement(
      'div',
      { className: 'space-y-0' },
      createElement(KeyValuePair, {
        label: 'Priority Level',
        value: 'High',
        valueType: 'string',
        className: 'bg-red-50 rounded-lg px-3',
      }),
      createElement(KeyValuePair, {
        label: 'Urgency',
        value: 'Medium',
        valueType: 'string',
        className: 'bg-yellow-50 rounded-lg px-3',
      }),
      createElement(KeyValuePair, {
        label: 'Complexity',
        value: 'Low',
        valueType: 'string',
        className: 'bg-green-50 rounded-lg px-3',
      }),
    ),
};
