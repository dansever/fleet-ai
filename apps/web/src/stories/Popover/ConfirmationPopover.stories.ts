import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { Button } from '../Button/Button';
import { ConfirmationPopover } from './Popover';

const meta: Meta<typeof ConfirmationPopover> = {
  title: 'Components/Popover/ConfirmationPopover',
  component: ConfirmationPopover,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onConfirm: { action: 'onConfirm' },
    onCancel: { action: 'onCancel' },
  },
  args: {
    title: 'Delete Service Contract',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {},
  },
  render: (args) => createElement(ConfirmationPopover, args),
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Delete: Story = {
  args: {
    trigger: createElement(Button, { intent: 'danger', text: 'Delete' }),
    intent: 'danger',
  },
};

export const Archive: Story = {
  args: {
    trigger: createElement(Button, { intent: 'secondary', text: 'Archive' }),
    intent: 'warning',
  },
};

export const Info: Story = {
  args: {
    trigger: createElement(Button, { intent: 'secondary', text: 'Save Changes' }),
    intent: 'info',
  },
};
