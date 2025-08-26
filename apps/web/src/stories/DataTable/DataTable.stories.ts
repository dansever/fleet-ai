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
    csvDownload: {
      control: 'boolean',
      description: 'Whether CSV download is enabled',
      table: {
        type: { summary: 'boolean' },
      },
    },
    csvFilename: {
      control: 'text',
      description: 'Custom filename for CSV download',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        status: 'Active',
        department: 'Engineering',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        status: 'Active',
        department: 'Marketing',
      },
      {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        status: 'Inactive',
        department: 'Sales',
      },
      {
        id: 4,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        status: 'Active',
        department: 'HR',
      },
      {
        id: 5,
        name: 'Charlie Wilson',
        email: 'charlie.wilson@example.com',
        status: 'Pending',
        department: 'Finance',
      },
    ],
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Full Name' },
      { key: 'email', header: 'Email Address' },
      { key: 'status', header: 'Status' },
      { key: 'department', header: 'Department' },
    ],
    title: 'Employee Management',
    description: 'Manage employee data with search, filter, and export capabilities.',
    searchable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
    csvDownload: true,
    csvFilename: 'employees',
  },
};

export const WithCustomColumns: Story = {
  args: {
    ...Default.args,
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      {
        key: 'status',
        header: 'Status',
        accessor: (item: any) => `Status: ${item.status}`,
      },
    ],
    title: 'Custom Columns with CSV Export',
    description: 'Table with custom column accessors that work with CSV export.',
    csvFilename: 'custom-employees',
  },
};

export const WithoutCSVDownload: Story = {
  args: {
    ...Default.args,
    csvDownload: false,
    title: 'Table without CSV Download',
    description: 'This table has CSV download disabled.',
  },
};
