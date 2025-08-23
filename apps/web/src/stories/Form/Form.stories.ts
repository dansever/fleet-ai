import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import {
  DatePicker,
  ModernInput,
  ModernSelect,
  ModernSwitch,
  ModernTextarea,
  PasswordInput,
  SearchInput,
} from './Form';

const meta: Meta<typeof ModernInput> = {
  title: 'Components/Form',
  component: ModernInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Input
export const Input: Story = {
  args: {
    placeholder: 'Enter your email',
    type: 'email',
  },
};

// Search Input
export const Search: StoryObj<typeof SearchInput> = {
  render: (args) => createElement(SearchInput, args),
  args: {
    placeholder: 'Search...',
  },
};

// Password Input
export const Password: StoryObj<typeof PasswordInput> = {
  render: (args) => createElement(PasswordInput, args),
  args: {
    placeholder: 'Enter your password',
  },
};

// Textarea
export const Textarea: StoryObj<typeof ModernTextarea> = {
  render: (args) => createElement(ModernTextarea, args),
  args: {
    placeholder: 'Enter your message...',
  },
};

// Select
export const Select: StoryObj<typeof ModernSelect> = {
  render: (args) => createElement(ModernSelect, args),
  args: {
    placeholder: 'Select an option',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

// Switch
export const Switch: StoryObj<typeof ModernSwitch> = {
  render: (args) => createElement(ModernSwitch, args),
  args: {},
};

// Date Picker
export const DateSelector: StoryObj<typeof DatePicker> = {
  render: (args) => createElement(DatePicker, args),
  args: {},
};
