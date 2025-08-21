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
    variant: {
      control: 'select',
      options: ['custom', 'airport', 'person'],
      description: 'The variant of the list item card',
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
    // Airport variant controls
    airportCode: {
      control: 'text',
      description: 'Airport code (for airport variant)',
    },
    airportName: {
      control: 'text',
      description: 'Airport name (for airport variant)',
    },
    city: {
      control: 'text',
      description: 'City (for airport variant)',
    },
    country: {
      control: 'text',
      description: 'Country (for airport variant)',
    },
    terminals: {
      control: 'number',
      description: 'Number of terminals (for airport variant)',
    },
    // Person variant controls
    personName: {
      control: 'text',
      description: 'Person name (for person variant)',
    },
    personRole: {
      control: 'text',
      description: 'Person role (for person variant)',
    },
    personInitials: {
      control: 'text',
      description: 'Person initials (for person variant)',
    },
    status: {
      control: 'text',
      description: 'Status (for person variant)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'custom',
    children: 'Custom List Item Card',
    isSelected: false,
    onClick: () => console.log('Custom item clicked'),
    className: 'w-96',
  },
};

export const AirportListItem: Story = {
  args: {
    variant: 'airport',
    isSelected: false,
    onClick: () => console.log('Airport selected'),
    className: 'w-96',
    airportCode: 'JFK',
    airportName: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    terminals: 6,
  },
};

export const AirportListItemSelected: Story = {
  args: {
    variant: 'airport',
    isSelected: true,
    onClick: () => console.log('Selected airport clicked'),
    className: 'w-96',
    airportCode: 'LAX',
    airportName: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    terminals: 9,
  },
};

export const PersonListItem: Story = {
  args: {
    variant: 'person',
    isSelected: false,
    onClick: () => console.log('Person selected'),
    className: 'w-96',
    personName: 'John Doe',
    personRole: 'Senior Flight Engineer',
    personInitials: 'JD',
    status: 'active',
  },
};

export const PersonListItemSelected: Story = {
  args: {
    variant: 'person',
    isSelected: true,
    onClick: () => console.log('Selected person clicked'),
    className: 'w-96',
    personName: 'Sarah Miller',
    personRole: 'Operations Manager',
    personInitials: 'SM',
    status: 'active',
  },
};
