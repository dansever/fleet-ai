import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProjectCard } from './Card';

const meta: Meta<typeof ProjectCard> = {
  title: 'Components/Card/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A project card for displaying projects with progress tracking, categories, and optional images.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The project title',
    },
    description: {
      control: 'text',
      description: 'The project description',
    },
    category: {
      control: 'text',
      description: 'The project category',
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress percentage (0-100)',
    },
    image: {
      control: 'text',
      description: 'URL of the project image',
    },
    isNew: {
      control: 'boolean',
      description: 'Whether to show the "New" badge',
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
    title: 'Fleet Modernization',
    description: 'Upgrading our entire fleet with next-generation aircraft and systems.',
    category: 'Infrastructure',
    progress: 75,
    className: 'w-80',
  },
};

export const WithImage: Story = {
  args: {
    title: 'Route Expansion',
    description: 'Opening new international routes to expand our global presence.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=225&fit=crop',
    category: 'Expansion',
    progress: 45,
    isNew: true,
    className: 'w-80',
  },
};

export const NoProgress: Story = {
  args: {
    title: 'Safety Training Program',
    description: 'Comprehensive safety training initiative for all crew members.',
    category: 'Training',
    className: 'w-80',
  },
};

export const NewProject: Story = {
  args: {
    title: 'Digital Transformation',
    description: 'Implementing cutting-edge digital solutions across all operations.',
    category: 'Technology',
    progress: 15,
    isNew: true,
    className: 'w-80',
  },
};
