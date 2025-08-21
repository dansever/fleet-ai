import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProfileCard } from './Card';

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/Card/ProfileCard',
  component: ProfileCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A profile card for displaying user information, avatars, and optional statistics.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: "The person's name",
    },
    role: {
      control: 'text',
      description: "The person's role or title",
    },
    bio: {
      control: 'text',
      description: 'Biography or description (optional)',
    },
    avatar: {
      control: 'text',
      description: 'Avatar image URL (optional)',
    },
    stats: {
      control: 'object',
      description: 'Array of statistics with label and value',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    name: 'Sarah Johnson',
    role: 'Fleet Manager',
    bio: 'Experienced aviation professional with 15+ years in fleet operations and management.',
    className: 'w-80',
  },
};

export const WithAvatar: Story = {
  args: {
    name: 'Captain Mike Rodriguez',
    role: 'Chief Pilot',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Leading our pilot team with expertise in international operations and safety protocols.',
    className: 'w-80',
  },
};

export const WithStats: Story = {
  args: {
    name: 'Emma Chen',
    role: 'Operations Director',
    bio: 'Streamlining operations and driving efficiency across all departments.',
    stats: [
      { label: 'Years Experience', value: '12' },
      { label: 'Projects Led', value: '34' },
      { label: 'Team Size', value: '15' },
    ],
    className: 'w-80',
  },
};

export const Pilot: Story = {
  args: {
    name: 'Alex Thompson',
    role: 'Safety Officer',
    stats: [
      { label: 'Audits', value: '127' },
      { label: 'Compliance', value: '100%' },
      { label: 'Certifications', value: '8' },
    ],
    className: 'w-80',
  },
};
