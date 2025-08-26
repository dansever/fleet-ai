import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { BaseCard } from './Card';

const meta: Meta<typeof BaseCard> = {
  title: 'Components/Card/BaseCard',
  component: BaseCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A minimal, flexible base card component with rounded corners and clean styling. Perfect as a foundation for custom card layouts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the card',
    },
    description: {
      control: 'text',
      description: 'The description of the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: false,
      description: 'Child elements to render inside the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Base Card',
    description: 'A simple base card component',
    className: 'w-80',
    children: createElement(
      'div',
      { className: 'p-4' },
      createElement(
        'p',
        { className: 'text-gray-600' },
        'This is the default base card with some sample content.',
      ),
    ),
  },
};

export const WithCustomContent: Story = {
  args: {
    title: 'Custom Content Card',
    description: 'Base card with rich content',
    className: 'w-96',
    children: createElement(
      'div',
      { className: 'p-6 space-y-4' },
      createElement('h3', { className: 'text-xl font-bold text-gray-800' }, 'Fleet Management'),
      createElement(
        'p',
        { className: 'text-gray-600' },
        'Streamline your aviation operations with our comprehensive fleet management solution.',
      ),
      createElement(
        'div',
        { className: 'flex gap-2 pt-2' },
        createElement(
          'button',
          {
            className:
              'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
          },
          'Learn More',
        ),
        createElement(
          'button',
          {
            className:
              'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors',
          },
          'Contact Us',
        ),
      ),
    ),
  },
};

export const MinimalCard: Story = {
  args: {
    title: 'Minimal',
    description: 'Clean and simple',
    className: 'w-64',
    children: createElement(
      'div',
      { className: 'p-4 text-center' },
      createElement('div', {
        className:
          'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3',
      }),
      createElement('p', { className: 'text-sm text-gray-500' }, 'Minimal design approach'),
    ),
  },
};

export const DataCard: Story = {
  args: {
    title: 'Data Display',
    description: 'Perfect for showing structured information',
    className: 'w-80',
    children: createElement(
      'div',
      { className: 'p-4 space-y-3' },
      createElement(
        'div',
        { className: 'flex justify-between items-center border-b pb-2' },
        createElement('span', { className: 'text-sm font-medium text-gray-600' }, 'Total Aircraft'),
        createElement('span', { className: 'text-lg font-bold text-gray-900' }, '24'),
      ),
      createElement(
        'div',
        { className: 'flex justify-between items-center border-b pb-2' },
        createElement('span', { className: 'text-sm font-medium text-gray-600' }, 'Active Routes'),
        createElement('span', { className: 'text-lg font-bold text-gray-900' }, '156'),
      ),
      createElement(
        'div',
        { className: 'flex justify-between items-center' },
        createElement(
          'span',
          { className: 'text-sm font-medium text-gray-600' },
          'Monthly Savings',
        ),
        createElement('span', { className: 'text-lg font-bold text-green-600' }, '$2.4M'),
      ),
    ),
  },
};

export const ImageCard: Story = {
  args: {
    title: 'Image Content',
    description: 'Base card with image content',
    className: 'w-80',
    children: createElement(
      'div',
      { className: 'space-y-4' },
      createElement(
        'div',
        {
          className:
            'aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center',
        },
        createElement('span', { className: 'text-white text-lg font-semibold' }, 'Fleet AI'),
      ),
      createElement(
        'div',
        { className: 'p-4' },
        createElement(
          'h4',
          { className: 'font-semibold text-gray-800 mb-2' },
          'Aviation Excellence',
        ),
        createElement(
          'p',
          { className: 'text-sm text-gray-600' },
          'Transforming aviation operations through intelligent automation and data-driven insights.',
        ),
      ),
    ),
  },
};

export const CompactCard: Story = {
  args: {
    title: 'Compact',
    description: 'Small footprint design',
    className: 'w-48',
    children: createElement(
      'div',
      { className: 'p-3 text-center' },
      createElement('div', { className: 'text-2xl mb-2' }, '✈️'),
      createElement('h4', { className: 'text-sm font-semibold text-gray-800' }, 'Quick Action'),
      createElement('p', { className: 'text-xs text-gray-500 mt-1' }, 'Compact card design'),
    ),
  },
};

export const WideCard: Story = {
  args: {
    title: 'Wide Layout',
    description: 'Horizontal layout design',
    className: 'w-full max-w-2xl',
    children: createElement(
      'div',
      { className: 'p-6' },
      createElement(
        'div',
        { className: 'flex items-center gap-6' },
        createElement(
          'div',
          {
            className:
              'flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center',
          },
          createElement('span', { className: 'text-white text-2xl' }, '🚀'),
        ),
        createElement(
          'div',
          { className: 'flex-1' },
          createElement(
            'h3',
            { className: 'text-xl font-bold text-gray-800 mb-2' },
            'Fleet Optimization',
          ),
          createElement(
            'p',
            { className: 'text-gray-600' },
            'Advanced algorithms optimize your fleet operations, reducing costs and improving efficiency across all aviation services.',
          ),
        ),
        createElement(
          'div',
          { className: 'flex-shrink-0' },
          createElement(
            'button',
            {
              className:
                'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
            },
            'Optimize Now',
          ),
        ),
      ),
    ),
  },
};
