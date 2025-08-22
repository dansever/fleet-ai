import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ListItemCard } from './Card';

const meta: Meta<typeof ListItemCard> = {
  title: 'Components/Card/ListItemCard',
  component: ListItemCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible list item card with selection states and hover effects, perfect for scrollable lists and interactive content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'object',
      description: 'The icon to display in the card',
    },
    children: {
      control: 'object',
      description: 'The content to display in the card',
    },
    iconBackground: {
      control: 'text',
      description: 'Tailwind gradient classes for the icon background',
    },
    isSelected: {
      control: 'boolean',
      description: 'Whether the card is selected',
    },
    onClick: {
      control: 'object',
      description: 'The function to call when the card is clicked',
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
    children: 'Custom List Item Card',
    isSelected: false,
    onClick: () => console.log('Custom item clicked'),
    className: 'w-96',
  },
};

export const AirportListItem: Story = {
  args: {
    isSelected: false,
    onClick: () => console.log('Airport selected'),
    className: 'w-96',
  },
};

export const AirportListItemSelected: Story = {
  args: {
    isSelected: true,
    onClick: () => console.log('Selected airport clicked'),
    className: 'w-96',
  },
};

export const PersonListItem: Story = {
  args: {
    isSelected: false,
    onClick: () => console.log('Person selected'),
    className: 'w-96',
  },
};

export const PersonListItemSelected: Story = {
  args: {
    isSelected: true,
    onClick: () => console.log('Selected person clicked'),
    className: 'w-96',
  },
};
