import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TagList } from './Card';

const meta: Meta<typeof TagList> = {
  title: 'Components/Card/TagList',
  component: TagList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A component for displaying a list of tags/badges in a flexible wrap layout. Perfect for categories, skills, labels, or any collection of related items.',
      },
    },
  },
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of strings to display as tags',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

// Basic tag list
export const Default: Story = {
  args: {
    tags: ['React', 'TypeScript', 'Tailwind', 'Storybook'],
  },
};

// Aviation categories
export const AviationCategories: Story = {
  args: {
    tags: ['Fuel Procurement', 'Technical Services', 'Ground Support', 'Catering', 'Maintenance'],
  },
};

// Status tags
export const StatusTags: Story = {
  args: {
    tags: ['Active', 'Pending', 'Completed', 'Cancelled'],
  },
};

// Single tag
export const SingleTag: Story = {
  args: {
    tags: ['Premium'],
  },
};

// Many tags (overflow behavior)
export const ManyTags: Story = {
  args: {
    tags: [
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'Storybook',
      'Figma',
      'Node.js',
      'PostgreSQL',
      'Docker',
      'AWS',
      'Vercel',
      'GitHub',
      'Linear',
      'Slack',
    ],
  },
};

// Empty tags
export const EmptyTags: Story = {
  args: {
    tags: [],
  },
};

// Custom styling
export const CustomStyling: Story = {
  args: {
    tags: ['High Priority', 'Urgent', 'Critical'],
    className: 'gap-3',
  },
};

// Aircraft types
export const AircraftTypes: Story = {
  args: {
    tags: ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A350', 'Embraer E190'],
  },
};
