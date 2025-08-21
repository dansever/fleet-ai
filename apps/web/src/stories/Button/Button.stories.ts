import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlusIcon } from 'lucide-react';
import { Button, IconButton } from './Button';

const intents = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'ghost',
  'download',
  'add',
  'favorite',
  'edit',
  'icon',
] as const;

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    children: 'Default',
  },
};

export const Primary: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    children: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    size: 'md',
    children: 'Secondary',
  },
};

export const Sucess: Story = {
  args: {
    intent: 'success',
    size: 'md',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    intent: 'warning',
    size: 'md',
    children: 'Warning',
  },
};

export const Danger: Story = {
  args: {
    intent: 'danger',
    size: 'md',
    children: 'Danger',
  },
};

export const Ghost: Story = {
  args: {
    intent: 'ghost',
    size: 'md',
    children: 'Ghost',
  },
};

export const Download: Story = {
  args: {
    intent: 'download',
    size: 'md',
    children: 'Download',
  },
};

export const Add: Story = {
  args: {
    intent: 'add',
    size: 'md',
    children: 'Add',
  },
};

export const Favorite: Story = {
  args: {
    intent: 'favorite',
    size: 'md',
    children: 'Favorite',
  },
};

export const Edit: Story = {
  args: {
    intent: 'edit',
    size: 'md',
    children: 'Edit',
  },
};

// Icon Button Stories
type IconStory = StoryObj<typeof IconButton>;

export const IconSmall: IconStory = {
  args: {
    icon: PlusIcon,
    size: 'sm',
  },
};

export const IconMedium: IconStory = {
  args: {
    icon: PlusIcon,
    size: 'md',
  },
};

export const IconLarge: IconStory = {
  args: {
    icon: PlusIcon,
    size: 'lg',
  },
};

export const IconPrimary: IconStory = {
  args: {
    icon: PlusIcon,
    intent: 'primary',
    size: 'md',
  },
};

export const IconDanger: IconStory = {
  args: {
    icon: PlusIcon,
    intent: 'danger',
    size: 'md',
  },
};
