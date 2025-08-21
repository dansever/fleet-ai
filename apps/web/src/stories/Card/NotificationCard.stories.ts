import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NotificationCard } from './Card';

const meta: Meta<typeof NotificationCard> = {
  title: 'Components/Card/NotificationCard',
  component: NotificationCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A notification card for displaying alerts and messages with different severity types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The notification title',
    },
    message: {
      control: 'text',
      description: 'The notification message',
    },
    type: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
      description: 'The notification type for styling',
    },
    timestamp: {
      control: 'text',
      description: 'When the notification occurred (optional)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    title: 'Flight Schedule Update',
    message: 'Flight AA-1234 has been rescheduled to depart at 3:30 PM due to weather conditions.',
    type: 'info',
    timestamp: '2 min ago',
    className: 'w-96',
  },
};

export const Success: Story = {
  args: {
    title: 'Maintenance Complete',
    message:
      'Scheduled maintenance for aircraft N123AB has been successfully completed and cleared for service.',
    type: 'success',
    timestamp: '15 min ago',
    className: 'w-96',
  },
};

export const Warning: Story = {
  args: {
    title: 'Fuel Level Alert',
    message:
      'Aircraft N456CD fuel levels are below recommended threshold. Refueling required before next flight.',
    type: 'warning',
    timestamp: '1 hour ago',
    className: 'w-96',
  },
};

export const Error: Story = {
  args: {
    title: 'System Malfunction',
    message:
      'Critical system error detected in navigation equipment. Immediate attention required.',
    type: 'error',
    timestamp: '5 min ago',
    className: 'w-96',
  },
};

export const WeatherAlert: Story = {
  args: {
    title: 'Weather Advisory',
    message:
      'Severe weather expected in the northeastern region. Flights may be delayed or cancelled.',
    type: 'warning',
    timestamp: '30 min ago',
    className: 'w-96',
  },
};
