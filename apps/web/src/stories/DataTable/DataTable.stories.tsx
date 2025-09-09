import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { toast } from 'sonner';
import { DataTable } from './DataTable';

// Sample data for demonstrations
const sampleUsers = [
  {
    id: 1,
    name: 'John Doe',
    displayname: 'John Doe',
    age: 25,
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    department: 'Engineering',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    displayname: 'Jane Smith',
    age: 25,
    gender: 'Female',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-10T14:20:00Z',
    department: 'Marketing',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    displayname: 'Bob Johnson',
    age: 25,
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'bob.johnson@example.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2024-01-14T09:15:00Z',
    department: 'Sales',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 4,
    name: 'Alice Brown',
    displayname: 'Alice Brown',
    age: 25,
    gender: 'Female',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'alice.brown@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-13T16:45:00Z',
    department: 'HR',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    displayname: 'Charlie Wilson',
    age: 25,
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'charlie.wilson@example.com',
    role: 'Admin',
    status: 'suspended',
    lastLogin: '2024-01-08T11:20:00Z',
    department: 'Engineering',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 6,
    name: 'Diana Davis',
    displayname: 'Diana Davis',
    age: 25,
    gender: 'Female',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'diana.davis@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-12T13:30:00Z',
    department: 'Finance',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 7,
    name: 'Eve Miller',
    displayname: 'Eve Miller',
    age: 25,
    gender: 'Female',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'eve.miller@example.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2024-01-11T08:45:00Z',
    department: 'Operations',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 8,
    name: 'Frank Garcia',
    displayname: 'Frank Garcia',
    age: 25,
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'frank.garcia@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2024-01-09T15:10:00Z',
    department: 'Engineering',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 9,
    name: 'Grace Lee',
    displayname: 'Grace Lee',
    age: 25,
    gender: 'Female',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'grace.lee@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-16T12:00:00Z',
    department: 'Legal',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 10,
    name: 'Henry Taylor',
    displayname: 'Henry Taylor',
    age: 25,
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'henry.taylor@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-14T17:20:00Z',
    department: 'Sales',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
];

const sampleProducts = [
  {
    id: 'P001',
    name: 'Laptop Pro',
    category: 'Electronics',
    price: 1299.99,
    stock: 45,
    rating: 4.8,
    vendor: 'TechCorp',
  },
  {
    id: 'P002',
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 29.99,
    stock: 120,
    rating: 4.5,
    vendor: 'AccessTech',
  },
  {
    id: 'P003',
    name: 'Mechanical Keyboard',
    category: 'Accessories',
    price: 149.99,
    stock: 30,
    rating: 4.9,
    vendor: 'KeyMaster',
  },
  {
    id: 'P004',
    name: '4K Monitor',
    category: 'Electronics',
    price: 399.99,
    stock: 25,
    rating: 4.7,
    vendor: 'DisplayPro',
  },
  {
    id: 'P005',
    name: 'USB-C Cable',
    category: 'Accessories',
    price: 12.99,
    stock: 200,
    rating: 4.3,
    vendor: 'CableCo',
  },
];

// Column definitions with different configurations
const userColumns = [
  {
    key: 'id' as const,
    header: 'ID',
    sortable: true,
    className: 'w-16',
  },
  {
    key: 'name' as const,
    header: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'displayname' as const,
    header: 'Display Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'age' as const,
    header: 'Age',
    sortable: true,
    filterable: true,
  },
  {
    key: 'gender' as const,
    header: 'Gender',
    sortable: true,
    filterable: true,
  },
  {
    key: 'address' as const,
    header: 'Address',
    sortable: true,
    filterable: true,
  },
  {
    key: 'phone' as const,
    header: 'Phone',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email' as const,
    header: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    key: 'createdAt' as const,
    header: 'Created At',
    sortable: true,
    filterable: true,
    accessor: (item: any) => new Date(item.createdAt as string).toLocaleDateString(),
  },
  {
    key: 'role' as const,
    header: 'Role',
    sortable: true,
    filterable: true,
    accessor: (item: any) => <StatusBadge text={item.role as string} status={'operational'} />,
  },
  {
    key: 'status' as const,
    header: 'Status',
    sortable: true,
    filterable: true,
    accessor: (item: any) => <StatusBadge text={item.status as string} status={'operational'} />,
  },
  {
    key: 'department' as const,
    header: 'Department',
    sortable: true,
    filterable: true,
  },
  {
    key: 'lastLogin' as const,
    header: 'Last Login',
    sortable: true,
    accessor: (item: any) => new Date(item.lastLogin as string).toLocaleDateString(),
  },
];

const productColumns = [
  {
    key: 'id' as const,
    header: 'Product ID',
    sortable: true,
    className: 'w-24',
  },
  {
    key: 'name' as const,
    header: 'Product Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'category' as const,
    header: 'Category',
    sortable: true,
    filterable: true,
  },
  {
    key: 'price' as const,
    header: 'Price',
    sortable: true,
    accessor: (item: any) => `$${(item.price as number).toFixed(2)}`,
    className: 'text-right',
  },
  {
    key: 'stock' as const,
    header: 'Stock',
    sortable: true,
    accessor: (item: any) => (
      <span className={(item.stock as number) < 50 ? 'text-orange-600 font-medium' : ''}>
        {item.stock}
      </span>
    ),
    className: 'text-center',
  },
  {
    key: 'rating' as const,
    header: 'Rating',
    sortable: true,
    accessor: (item: any) => (
      <div className="flex items-center gap-1">
        <span className="text-yellow-500">★</span>
        <span>{item.rating}</span>
      </div>
    ),
    className: 'text-center',
  },
  {
    key: 'vendor' as const,
    header: 'Vendor',
    sortable: true,
    filterable: true,
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive data table component with search, filtering, sorting, pagination, and action capabilities.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// Basic DataTable with minimal configuration
export const Basic: Story = {
  args: {
    data: sampleUsers.slice(0, 5),
    columns: userColumns.slice(0, 4), // Only show first 4 columns
    title: 'Basic User Table',
    description: 'Simple table with basic functionality',
  },
};

// Full-featured DataTable with all capabilities
export const FullFeatured: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    title: 'Full-Featured User Management',
    description: 'Complete table with search, filtering, sorting, pagination, and actions',
    searchable: true,
    pagination: true,
    pageSize: 5,
    csvDownload: true,
    csvFilename: 'users-export',
    onRowClick: (row) => toast.info(`Clicked on ${row.name}`),
  },
};

// Product table with custom rendering
export const ProductTable: Story = {
  args: {
    data: sampleProducts,
    columns: productColumns,
    title: 'Product Inventory',
    description: 'Product table with custom cell rendering and formatting',
    searchable: true,
    pagination: true,
    pageSize: 3,
    csvDownload: true,
    csvFilename: 'products-inventory',
    onRowClick: (row) => toast.info(`Selected ${row.name}`),
  },
};

// Table without search functionality
export const NoSearch: Story = {
  args: {
    data: sampleUsers.slice(0, 8),
    columns: userColumns.slice(0, 5),
    title: 'User List (No Search)',
    description: 'Table without search functionality',
    searchable: false,
    pagination: true,
    pageSize: 4,
  },
};

// Table with only view actions
export const ViewOnly: Story = {
  args: {
    data: sampleUsers.slice(0, 6),
    columns: userColumns.slice(0, 4),
    title: 'User Directory (View Only)',
    description: 'Table with only view actions, no edit/delete',
    searchable: true,
    onRowClick: (row) => toast.success(`Viewing profile: ${row.name}`),
  },
};

// Table with custom empty state
export const CustomEmptyState: Story = {
  args: {
    data: [],
    columns: userColumns.slice(0, 4),
    title: 'Empty Table Example',
    description: 'Demonstrates custom empty state message',
    searchable: true,
  },
};

// Table with large page size
export const LargePageSize: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns,
    title: 'Large Page Size Example',
    description: 'Table with larger page size for better overview',
    searchable: true,
    pagination: true,
    pageSize: 8,
    csvDownload: true,
  },
};

// Table without pagination
export const NoPagination: Story = {
  args: {
    data: sampleUsers,
    columns: userColumns.slice(0, 5),
    title: 'All Users (No Pagination)',
    description: 'Table showing all data without pagination',
    searchable: true,
    pagination: false,
    csvDownload: true,
    onRowClick: (row) => toast.info(`Selected: ${row.name}`),
  },
};

// Table with minimal columns
export const MinimalColumns: Story = {
  args: {
    data: sampleUsers.slice(0, 7),
    columns: [
      {
        key: 'name' as const,
        header: 'Name',
        sortable: true,
      },
      {
        key: 'email' as const,
        header: 'Email',
        sortable: true,
      },
      {
        key: 'role' as const,
        header: 'Role',
        sortable: true,
        accessor: (item: any) => <StatusBadge text={item.role as string} status={'operational'} />,
      },
    ],
    title: 'Minimal User Table',
    description: 'Table with only essential columns',
    searchable: true,
    onRowClick: (row) => toast.info(`Clicked: ${row.name}`),
  },
};

// Table with custom styling
export const CustomStyling: Story = {
  args: {
    data: sampleUsers.slice(0, 6),
    columns: userColumns.slice(0, 4),
    title: 'Custom Styled Table',
    description: 'Table with custom className for styling',
    className: 'bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl',
    searchable: true,
    pagination: true,
    pageSize: 3,
    onRowClick: (row) => toast.info(`Selected: ${row.name}`),
  },
};

// Table with filterable columns only
export const FilterableOnly: Story = {
  args: {
    data: sampleUsers.slice(0, 8),
    columns: [
      {
        key: 'name' as const,
        header: 'Name',
        filterable: true,
      },
      {
        key: 'department' as const,
        header: 'Department',
        filterable: true,
      },
      {
        key: 'role' as const,
        header: 'Role',
        filterable: true,
        accessor: (item: any) => <StatusBadge text={item.role as string} status={'operational'} />,
      },
    ],
    title: 'Filterable Columns Only',
    description: 'Table with filterable columns but no search',
    searchable: false,
    pagination: true,
    pageSize: 4,
  },
};

// Table with all features disabled
export const MinimalFeatures: Story = {
  args: {
    data: sampleUsers.slice(0, 5),
    columns: userColumns.slice(0, 3),
    title: 'Minimal Features Table',
    description: 'Table with all optional features disabled',
    searchable: false,
    pagination: false,
    csvDownload: false,
  },
};

// Table with custom search placeholder
export const CustomSearchPlaceholder: Story = {
  args: {
    data: sampleUsers.slice(0, 7),
    columns: userColumns.slice(0, 4),
    title: 'Custom Search Placeholder',
    description: 'Table with custom search placeholder text',
    searchable: true,
    pagination: true,
    pageSize: 4,
    onRowClick: (row) => toast.info(`Selected: ${row.name}`),
  },
};
