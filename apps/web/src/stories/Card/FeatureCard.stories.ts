import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FeatureCard } from './Card';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/Card/FeatureCard',
  component: FeatureCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A feature card with gradient background, perfect for showcasing key features or services.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the feature',
    },
    description: {
      control: 'text',
      description: 'The description of the feature',
    },
    gradient: {
      control: 'text',
      description: 'Tailwind gradient classes for the background',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Flight Management',
    description:
      'Streamline your fleet operations with advanced flight tracking and scheduling capabilities.',
    className: 'w-80',
  },
};

export const CustomGradient: Story = {
  args: {
    title: 'Fuel Optimization',
    description:
      'Reduce costs and improve efficiency with AI-powered fuel management and route optimization.',
    gradient: 'from-emerald-600 to-teal-600',
    className: 'w-80',
  },
};

export const Analytics: Story = {
  args: {
    title: 'Cost Analytics',
    description: 'Advanced analytics and reporting for operational cost optimization and insights.',
    gradient: 'from-amber-600 to-orange-600',
    className: 'w-80',
  },
};
