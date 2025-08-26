import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { KeyValuePair } from '../Utilities/KeyValuePair';
import { ContentSection, TagList } from './Card';

const meta: Meta<typeof ContentSection> = {
  title: 'Components/Card/ContentSection',
  component: ContentSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A sectioned card component with gradient header, perfect for organizing content in any structured layout. Accepts a flexible header ReactNode for custom titles, subtitles, and buttons.',
      },
    },
  },
  argTypes: {
    header: {
      control: 'text',
      description:
        'The header content (ReactNode) displayed in the gradient header - can be string, JSX, or complex elements',
    },
    headerGradient: {
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
type Story = StoryObj<typeof ContentSection>;

// Basic ContentSection with string header
export const Default: Story = {
  render: () =>
    createElement(ContentSection, {
      header: 'Basic Information',
      children: createElement(
        'div',
        { className: 'space-y-3' },
        createElement(KeyValuePair, {
          label: 'Name',
          value: 'Fleet AI Platform',
          valueType: 'string',
        }),
        createElement(KeyValuePair, { label: 'Version', value: '1.0.0', valueType: 'string' }),
        createElement(KeyValuePair, { label: 'Status', value: true, valueType: 'boolean' }),
      ),
    }),
};

// ContentSection with custom header containing title and subtitle
export const CustomHeader: Story = {
  render: () =>
    createElement(ContentSection, {
      header: createElement(
        'div',
        null,
        createElement('h4', { className: 'font-semibold text-sm' }, 'Flight Details'),
        createElement(
          'p',
          { className: 'text-xs text-white/80 mt-1' },
          'Real-time flight information',
        ),
      ),
      headerGradient: 'from-emerald-500 to-teal-500',
      children: createElement(
        'div',
        { className: 'space-y-3' },
        createElement(KeyValuePair, { label: 'Flight Number', value: 'FL-001' }),
        createElement(KeyValuePair, { label: 'Departure', value: 'JFK Airport' }),
        createElement(KeyValuePair, { label: 'Arrival', value: 'LAX Airport' }),
        createElement(KeyValuePair, { label: 'On Time', value: true }),
      ),
    }),
};

// ContentSection with header containing title and button
export const HeaderWithButton: Story = {
  render: () =>
    createElement(ContentSection, {
      header: createElement(
        'div',
        { className: 'flex items-center justify-between' },
        createElement('h4', { className: 'font-semibold text-sm' }, 'Procurement Summary'),
        createElement(
          'button',
          {
            className:
              'px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors',
            onClick: () => alert('Export clicked!'),
          },
          'Export',
        ),
      ),
      headerGradient: 'from-orange-500 to-red-500',
      children: createElement(
        'div',
        { className: 'space-y-4' },
        createElement(
          'div',
          { className: 'space-y-3' },
          createElement(KeyValuePair, { label: 'Total RFQs', value: 24 }),
          createElement(KeyValuePair, { label: 'Active Tenders', value: 8 }),
          createElement(KeyValuePair, { label: 'Completed', value: 16 }),
        ),
        createElement(
          'div',
          { className: 'space-y-3' },
          createElement('p', { className: 'font-medium text-gray-600 mb-2' }, 'Categories'),
          createElement(TagList, { tags: ['Fuel', 'Technical', 'Catering', 'Ground Support'] }),
        ),
      ),
    }),
};

// ContentSection with complex header structure
export const ComplexHeader: Story = {
  render: () =>
    createElement(ContentSection, {
      header: createElement(
        'div',
        { className: 'flex items-start justify-between' },
        createElement(
          'div',
          null,
          createElement('h4', { className: 'font-semibold text-sm' }, 'Aircraft Information'),
          createElement(
            'p',
            { className: 'text-xs text-white/80 mt-1' },
            'Last updated: 2 minutes ago',
          ),
        ),
        createElement(
          'div',
          { className: 'flex gap-2' },
          createElement(
            'button',
            {
              className: 'px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs',
              onClick: () => alert('Edit clicked!'),
            },
            '✏️',
          ),
          createElement(
            'button',
            {
              className: 'px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs',
              onClick: () => alert('Refresh clicked!'),
            },
            '🔄',
          ),
        ),
      ),
      headerGradient: 'from-purple-500 to-pink-500',
      children: createElement(
        'div',
        { className: 'space-y-3' },
        createElement(KeyValuePair, {
          label: 'Aircraft Type',
          value: 'Boeing 737-800',
          editMode: true,
          onChange: (value) => console.log('Aircraft Type changed:', value),
        }),
        createElement(KeyValuePair, {
          label: 'Capacity',
          value: 189,
          editMode: true,
          onChange: (value) => console.log('Capacity changed:', value),
        }),
        createElement(KeyValuePair, {
          label: 'Active',
          value: true,
          editMode: true,
          onChange: (value) => console.log('Active changed:', value),
        }),
      ),
    }),
};

// Multiple sections
export const MultipleSections: Story = {
  render: () =>
    createElement(
      'div',
      { className: 'w-full max-w-2xl space-y-4' },
      createElement(ContentSection, {
        header: 'Basic Details',
        headerGradient: 'from-blue-500 to-violet-500',
        children: createElement(
          'div',
          { className: 'space-y-3' },
          createElement(KeyValuePair, { label: 'Company', value: 'Fleet AI Corp' }),
          createElement(KeyValuePair, { label: 'Founded', value: 2024 }),
          createElement(KeyValuePair, { label: 'Public', value: false }),
        ),
      }),
      createElement(ContentSection, {
        header: createElement(
          'div',
          null,
          createElement('h4', { className: 'font-semibold text-sm' }, 'Contact Information'),
          createElement(
            'p',
            { className: 'text-xs text-white/80 mt-1' },
            'Primary contact details',
          ),
        ),
        headerGradient: 'from-green-500 to-emerald-500',
        children: createElement(
          'div',
          { className: 'space-y-3' },
          createElement(KeyValuePair, { label: 'Email', value: 'contact@fleetai.com' }),
          createElement(KeyValuePair, { label: 'Phone', value: '+1 (555) 123-4567' }),
          createElement(KeyValuePair, { label: 'Address', value: '123 Aviation Blvd, Sky City' }),
        ),
      }),
      createElement(ContentSection, {
        header: createElement(
          'div',
          { className: 'flex items-center justify-between' },
          createElement('h4', { className: 'font-semibold text-sm' }, 'Services'),
          createElement(
            'span',
            { className: 'px-2 py-1 bg-white/20 rounded text-xs font-medium' },
            '12 Active',
          ),
        ),
        headerGradient: 'from-amber-500 to-orange-500',
        children: createElement(
          'div',
          { className: 'space-y-4' },
          createElement(
            'div',
            { className: 'space-y-3' },
            createElement(KeyValuePair, { label: 'Total Services', value: 12 }),
            createElement(KeyValuePair, { label: '24/7 Support', value: true }),
          ),
          createElement(
            'div',
            null,
            createElement('p', { className: 'font-medium text-gray-600 mb-2' }, 'Service Types'),
            createElement(TagList, { tags: ['Procurement', 'Analytics', 'Automation', 'Support'] }),
          ),
        ),
      }),
    ),
};
