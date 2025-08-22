import { Button } from '@/components/ui/button';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { DetailDialog } from './Dialog';

const meta: Meta<typeof DetailDialog> = {
  title: 'Components/Dialog/DetailDialog',
  component: DetailDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive dialog component with gradient header, scrollable content area, and supporting components for structured information display. Includes InfoSection, KeyValuePair, TagList, and DialogSection sub-components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: false,
      description:
        'React element that triggers the dialog when clicked. Should be wrapped with asChild pattern.',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    title: {
      control: 'text',
      description: 'Main title displayed in the gradient header section',
      table: {
        type: { summary: 'string' },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle displayed below the title in the header',
      table: {
        type: { summary: 'string' },
      },
    },
    children: {
      control: false,
      description: 'Content to be displayed in the scrollable body area of the dialog',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the dialog content container',
      table: {
        type: { summary: 'string' },
      },
    },
    open: {
      control: 'boolean',
      description: 'Controls the open/closed state of the dialog when used in controlled mode',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      control: false,
      description: 'Callback function called when the dialog open state changes',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create consistent trigger buttons
const createTrigger = (text: string, variant: 'default' | 'outline' | 'secondary' = 'default') =>
  createElement(Button, { variant, className: 'min-w-[120px]' }, text);

// Helper function to create simple text content
const createSimpleContent = (content: string) =>
  createElement('div', { className: 'space-y-4' }, [
    createElement('p', { key: 'content', className: 'text-gray-600' }, content),
    createElement('div', { key: 'sample-data', className: 'space-y-2 border-t pt-4' }, [
      createElement('div', { key: 'item-1', className: 'flex justify-between' }, [
        createElement('span', { key: 'label-1', className: 'font-medium' }, 'Flight ID:'),
        createElement('span', { key: 'value-1' }, 'FL-2024-001'),
      ]),
      createElement('div', { key: 'item-2', className: 'flex justify-between' }, [
        createElement('span', { key: 'label-2', className: 'font-medium' }, 'Aircraft:'),
        createElement('span', { key: 'value-2' }, 'Boeing 737-800'),
      ]),
      createElement('div', { key: 'item-3', className: 'flex justify-between' }, [
        createElement('span', { key: 'label-3', className: 'font-medium' }, 'Status:'),
        createElement('span', { key: 'value-3' }, 'Active'),
      ]),
    ]),
  ]);

export const Default: Story = {
  args: {
    trigger: createTrigger('Open Dialog'),
    title: 'Flight Management',
    subtitle:
      'Streamline your fleet operations with advanced flight tracking and scheduling capabilities.',
    children: createSimpleContent(
      'This dialog demonstrates the basic usage with a title, subtitle, and structured content display.',
    ),
  },
};

export const WithoutSubtitle: Story = {
  args: {
    trigger: createTrigger('View Details', 'outline'),
    title: 'Aircraft Details',
    children: createSimpleContent('This example shows a dialog with just a title and no subtitle.'),
  },
};

export const WithSections: Story = {
  args: {
    trigger: createTrigger('Advanced View', 'secondary'),
    title: 'Fleet Analytics Dashboard',
    subtitle: 'Comprehensive overview of your fleet performance and operational metrics.',
    children: createElement('div', { className: 'space-y-6' }, [
      createElement('div', { key: 'section-1', className: 'p-4 bg-blue-50 rounded-lg border' }, [
        createElement(
          'h3',
          { key: 'title-1', className: 'font-semibold text-blue-900 mb-2' },
          'Performance Metrics',
        ),
        createElement(
          'p',
          { key: 'content-1', className: 'text-blue-700 text-sm' },
          'Fuel Efficiency: 98.5% • On-Time: 94.2% • Utilization: 87.3%',
        ),
      ]),
      createElement('div', { key: 'section-2', className: 'p-4 bg-green-50 rounded-lg border' }, [
        createElement(
          'h3',
          { key: 'title-2', className: 'font-semibold text-green-900 mb-2' },
          'Cost Analysis',
        ),
        createElement(
          'p',
          { key: 'content-2', className: 'text-green-700 text-sm' },
          'Fuel: $125,430 • Maintenance: $45,200 • Total: $234,890',
        ),
      ]),
    ]),
  },
};

export const LongContent: Story = {
  args: {
    trigger: createTrigger('View Full Report'),
    title: 'Comprehensive Fleet Report',
    subtitle:
      'Detailed analysis of all fleet operations, performance metrics, and recommendations.',
    children: createElement('div', { className: 'space-y-4' }, [
      ...Array.from({ length: 8 }, (_, i) =>
        createElement(
          'div',
          {
            key: `section-${i}`,
            className: 'p-4 border rounded-lg bg-gray-50',
          },
          [
            createElement(
              'h3',
              {
                key: 'title',
                className: 'font-semibold mb-2',
              },
              `Report Section ${i + 1}`,
            ),
            createElement(
              'p',
              {
                key: 'content',
                className: 'text-sm text-gray-600 mb-3',
              },
              `This is section ${i + 1} of the comprehensive fleet report with detailed metrics and analysis.`,
            ),
            createElement(
              'div',
              { key: 'metrics', className: 'text-xs text-gray-500' },
              `Sample Data ${i + 1}: Value ${(i + 1) * 10}%`,
            ),
          ],
        ),
      ),
    ]),
  },
};

export const CustomClassName: Story = {
  args: {
    trigger: createTrigger('Custom Dialog'),
    title: 'Custom Styled Dialog',
    subtitle: 'Example of a dialog with custom styling applied.',
    className: 'max-w-2xl',
    children: createSimpleContent(
      'This dialog demonstrates custom className usage to control the dialog width and styling.',
    ),
  },
};
