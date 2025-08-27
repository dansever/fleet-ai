import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { FileUploadPopover } from './Popover';

const meta: Meta<typeof FileUploadPopover> = {
  title: 'Components/Popover/FileUploadPopover',
  component: FileUploadPopover,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onSend: { action: 'onSend' },
  },
  args: {
    onSend: () => {},
    accept: '*/*',
    maxSize: 10,
    className: '',
  },
  render: (args) => createElement(FileUploadPopover, args),
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FileUpload: Story = {
  args: {
    onSend: () => {},
    accept: '*/*',
    maxSize: 10,
    className: '',
  },
};
