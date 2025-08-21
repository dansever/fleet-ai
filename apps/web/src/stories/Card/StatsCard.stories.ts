import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatsCard } from './Card';

const meta: Meta<typeof StatsCard> = {
  title: 'Components/Card/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A statistics card for displaying metrics with trend indicators and change values.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The metric title',
    },
    value: {
      control: 'text',
      description: 'The metric value (string or number)',
    },
    change: {
      control: 'text',
      description: 'Change description (optional)',
    },
    trend: {
      control: { type: 'select' },
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction for color coding',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: {
    title: 'Total Flights',
    value: '1,247',
    change: '+12.5% from last month',
    trend: 'up',
    className: 'w-80',
  },
};

export const Negative: Story = {
  args: {
    title: 'Fuel Costs',
    value: '$2.1M',
    change: '-8.3% from last month',
    trend: 'down',
    className: 'w-80',
  },
};

export const Neutral: Story = {
  args: {
    title: 'Active Routes',
    value: '42',
    change: 'No change',
    trend: 'neutral',
    className: 'w-80',
  },
};

export const NoChange: Story = {
  args: {
    title: 'Fleet Size',
    value: '28',
    className: 'w-80',
  },
};

export const Revenue: Story = {
  args: {
    title: 'Monthly Revenue',
    value: '$8.2M',
    change: '+18.7% from last month',
    trend: 'up',
    className: 'w-80',
  },
};
