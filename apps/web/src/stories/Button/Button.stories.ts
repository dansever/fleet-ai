import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Download as DownloadIcon, Edit as EditIcon, Heart, Plus } from 'lucide-react';
import { Button } from './Button';

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
] as const;

const sizes = ['sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    intent: {
      control: 'select',
      options: intents,
    },
    size: {
      control: { type: 'inline-radio' }, // radio buttons
      options: sizes,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    text: 'Default',
  },
};

export const Primary: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    text: 'Primary',
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    size: 'md',
    text: 'Secondary',
  },
};

export const Sucess: Story = {
  args: {
    intent: 'success',
    size: 'md',
    text: 'Success',
  },
};

export const Warning: Story = {
  args: {
    intent: 'warning',
    size: 'md',
    text: 'Warning',
  },
};

export const Danger: Story = {
  args: {
    intent: 'danger',
    size: 'md',
    text: 'Danger',
  },
};

export const Ghost: Story = {
  args: {
    intent: 'ghost',
    size: 'md',
    text: 'Ghost',
  },
};

export const Download: Story = {
  args: {
    intent: 'download',
    size: 'md',
    text: 'Download',
  },
};

export const DownloadWithIcon: Story = {
  args: {
    intent: 'download',
    size: 'md',
    text: 'Download File',
    icon: DownloadIcon,
  },
};

export const Add: Story = {
  args: {
    intent: 'add',
    size: 'md',
    text: 'Add Item',
    icon: Plus,
  },
};

export const Favorite: Story = {
  args: {
    intent: 'favorite',
    size: 'md',
    text: 'Add to Favorites',
    icon: Heart,
  },
};

export const Edit: Story = {
  args: {
    intent: 'edit',
    size: 'md',
    text: 'Edit',
  },
};

export const EditWithIcon: Story = {
  args: {
    intent: 'edit',
    size: 'md',
    text: 'Edit Item',
    icon: EditIcon,
  },
};

// Example of icon-only button
export const HeartIconOnly: Story = {
  args: {
    intent: 'favorite',
    size: 'md',
    text: 'Favorite',
    icon: Heart,
    iconOnly: true,
  },
};

// Example of icon on the right
export const IconRight: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    text: 'Continue',
    icon: Heart,
    iconPosition: 'right',
  },
};

export const Like: Story = {
  args: {
    intent: 'favorite',
    icon: Heart,
  },
};

// Example of different sizes with icons
export const SmallWithIcon: Story = {
  args: {
    intent: 'favorite',
    size: 'sm',
    text: 'Small',
    icon: Heart,
  },
};

export const LargeWithIcon: Story = {
  args: {
    intent: 'favorite',
    size: 'lg',
    text: 'Large',
    icon: Heart,
  },
};
