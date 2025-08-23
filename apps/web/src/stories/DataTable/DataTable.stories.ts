import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTable } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive dialog component with gradient header, scrollable content area, and supporting components for structured information display. Includes InfoSection, KeyValuePair, TagList, and DialogSection sub-components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Data to be displayed in the table',
      table: {
        type: { summary: 'any[]' },
      },
    },
    columns: {
      control: 'object',
      description: 'Columns to be displayed in the table',
      table: {
        type: { summary: 'any[]' },
      },
    },
    title: {
      control: 'text',
      description: 'Title of the table',
      table: {
        type: { summary: 'string' },
      },
    },
    description: {
      control: 'text',
      description: 'Description of the table',
      table: {
        type: { summary: 'string' },
      },
    },
    searchable: {
      control: 'boolean',
      description: 'Whether the table is searchable',
      table: {
        type: { summary: 'boolean' },
      },
    },
    filterable: {
      control: 'boolean',
      description: 'Whether the table is filterable',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    pagination: {
      control: 'boolean',
      description: 'Whether the table has pagination',
      table: {
        type: { summary: 'boolean' },
      },
    },
    pageSize: {
      control: 'number',
      description: 'Number of items per page',
      table: {
        type: { summary: 'number' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    ],
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ],
    title: 'Flight Management',
    description:
      'Streamline your fleet operations with advanced flight tracking and scheduling capabilities.',
    searchable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
  },
};

export const WithCustomColumns: Story = {
  args: {
    ...Default.args,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
    ],
  },
};
