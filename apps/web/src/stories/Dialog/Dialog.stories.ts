import { Button } from '@/stories/Button/Button';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { DetailDialog, DialogSection, KeyValuePair, TagList } from './Dialog';

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
    onSave: {
      control: false,
      description: 'Callback function called when the dialog is saved',
      table: {
        type: { summary: '(data: any) => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: createElement(Button, { intent: 'primary', text: 'Open Dialog' }),
    title: 'Flight Management',
    subtitle:
      'Streamline your fleet operations with advanced flight tracking and scheduling capabilities.',
    children: createElement(
      'div',
      { className: 'space-y-4 grid grid-cols-1 md:grid-cols-2 gap-2 ' },
      [
        createElement(DialogSection, {
          title: 'Flight ID',
          children: createElement(
            'div',
            { className: 'flex flex-col justify-between' },
            createElement(KeyValuePair, { label: 'Flight ID', value: 'FL-2024-001' }),
            createElement(KeyValuePair, { label: 'Destination', value: 'London, United Kingdom' }),
            createElement(KeyValuePair, { label: 'Status', value: 'Active' }),
          ),
          gradient: 'from-violet-500 to-blue-500',
        }),
        createElement(DialogSection, {
          title: 'Flight ID',
          children: 'FL-2024-001',
          gradient: 'from-yellow-500 to-red-500',
        }),
        createElement(DialogSection, {
          className: 'col-span-full',
          title: 'Flight ID',
          children: createElement(TagList, { tags: ['Active', 'Pending', 'Cancelled'] }),
          gradient: 'from-green-500 to-blue-500',
        }),
      ],
    ),
  },
};
