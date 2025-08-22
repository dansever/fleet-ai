import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { PageLayout } from './PageLayout';

const meta: Meta<typeof PageLayout> = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A flexible page layout with a fixed sidebar and main content area with fixed header.',
      },
    },
  },
  argTypes: {
    sidebarWidth: {
      control: 'text',
      description: 'Width of the sidebar panel',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PageLayout>;

// Sample data for demonstrations
const sampleItems = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  description: `Description for item ${i + 1}`,
}));

const sampleContent = Array.from(
  { length: 20 },
  (_, i) =>
    `This is paragraph ${i + 1} of the main content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
);

export const WithSidebar: Story = {
  args: {
    sidebarContent: createElement('div', { className: 'p-4' }, [
      createElement('h3', { key: 'title', className: 'text-lg font-semibold mb-4' }, 'Items List'),
      createElement(
        'div',
        { key: 'items', className: 'space-y-2' },
        sampleItems.map((item) =>
          createElement(
            'div',
            {
              key: item.id,
              className:
                'p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors',
            },
            [
              createElement('div', { key: 'title', className: 'font-medium' }, item.title),
              createElement(
                'div',
                { key: 'desc', className: 'text-sm text-muted-foreground' },
                item.description,
              ),
            ],
          ),
        ),
      ),
    ]),
    headerContent: createElement('div', { className: 'flex items-center justify-between w-full' }, [
      createElement(
        'h1',
        { key: 'title', className: 'text-xl font-semibold' },
        'Selected Item Details',
      ),
      createElement('div', { key: 'actions', className: 'flex gap-2' }, [
        createElement(
          'button',
          {
            key: 'edit',
            className:
              'px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90',
          },
          'Edit',
        ),
        createElement(
          'button',
          {
            key: 'delete',
            className:
              'px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90',
          },
          'Delete',
        ),
      ]),
    ]),
    mainContent: createElement('div', { className: 'p-6' }, [
      createElement(
        'div',
        { key: 'content', className: 'space-y-4' },
        sampleContent.map((paragraph, i) =>
          createElement(
            'p',
            {
              key: i,
              className: 'text-sm leading-relaxed text-muted-foreground',
            },
            paragraph,
          ),
        ),
      ),
    ]),
  },
};

export const WithoutSidebar: Story = {
  args: {
    sidebarContent: null,
    headerContent: createElement('div', { className: 'flex items-center justify-between w-full' }, [
      createElement('h1', { key: 'title', className: 'text-xl font-semibold' }, 'Dashboard'),
      createElement('div', { key: 'actions', className: 'flex gap-2' }, [
        createElement(
          'button',
          {
            key: 'add',
            className:
              'px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90',
          },
          'Add New',
        ),
        createElement(
          'button',
          {
            key: 'settings',
            className:
              'px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90',
          },
          'Settings',
        ),
      ]),
    ]),
    mainContent: createElement('div', { className: 'p-6' }, [
      createElement(
        'div',
        { key: 'content', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        Array.from({ length: 9 }, (_, i) =>
          createElement(
            'div',
            {
              key: i,
              className:
                'p-6 border border-border rounded-lg bg-card hover:shadow-md transition-shadow',
            },
            [
              createElement(
                'h4',
                { key: 'title', className: 'font-semibold mb-3' },
                `Item ${i + 1}`,
              ),
              createElement(
                'p',
                { key: 'desc', className: 'text-sm text-muted-foreground mb-4' },
                'This is a sample card showing content in a full-width layout without sidebar.',
              ),
              createElement(
                'button',
                {
                  key: 'action',
                  className: 'text-sm text-primary hover:underline',
                },
                'View Details',
              ),
            ],
          ),
        ),
      ),
    ]),
  },
};
