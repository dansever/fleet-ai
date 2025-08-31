import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  Filter,
  Heart,
  Plus,
  Save,
  Search,
  Settings,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive button component with 7 semantic variants designed for consistency and clear hierarchy. Each variant serves specific use cases to maintain design system coherence.',
      },
    },
  },
  argTypes: {
    intent: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'secondaryInverted',
        'success',
        'warning',
        'danger',
        'ghost',
      ],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    iconPosition: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Overview showing all button variants with usage guidance
export const Overview: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Button System Overview</h1>
        <p className="text-muted-foreground">
          7 semantic button variants designed for consistency and clear visual hierarchy
        </p>
      </div>

      {/* Primary Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Primary Actions</h2>
          <p className="text-sm text-muted-foreground">
            High emphasis - Main call-to-action, most important user actions
          </p>
        </div>
        <div className="flex gap-3">
          <Button intent="primary" text="Save Changes" />
          <Button intent="primary" text="Create Account" />
          <Button intent="primary" text="Submit Request" icon={ChevronRight} iconPosition="right" />
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Secondary Actions</h2>
          <p className="text-sm text-muted-foreground">
            Medium emphasis - Alternative actions, less prominent than primary
          </p>
        </div>
        <div className="flex gap-3">
          <Button intent="secondary" text="Cancel" />
          <Button intent="secondary" text="View Details" />
          <Button intent="secondary" text="Export Data" icon={Download} />
          <Button intent="secondary" text="Filter" icon={Filter} />
          <Button intent="secondary" text="Settings" icon={Settings} />
        </div>
      </div>

      {/* Ghost Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Ghost Actions</h2>
          <p className="text-sm text-muted-foreground">
            Minimal emphasis - Tertiary actions, icon buttons, subtle interactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button intent="ghost" text="Skip" />
          <Button intent="ghost" icon={Edit} />
          <Button intent="ghost" icon={Heart} />
          <Button intent="ghost" icon={Star} />
        </div>
      </div>

      {/* Semantic Actions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Semantic Actions</h2>
          <p className="text-sm text-muted-foreground">
            Context-specific variants for success, warning, and danger states
          </p>
        </div>
        <div className="flex gap-3">
          <Button intent="success" text="Approve" icon={Check} />
          <Button intent="warning" text="Caution" icon={AlertTriangle} />
          <Button intent="danger" text="Delete" icon={Trash2} />
        </div>
      </div>

      {/* Secondary Inverted */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Secondary Inverted</h2>
          <p className="text-sm text-muted-foreground">For use on dark or colored backgrounds</p>
        </div>
        <div className="p-6 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg w-fit">
          <div className="flex gap-3">
            <Button intent="secondaryInverted" text="Learn More" />
            <Button
              intent="secondaryInverted"
              text="Get Started"
              icon={ChevronRight}
              iconPosition="right"
            />
          </div>
        </div>
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Size Variants</h2>
          <p className="text-sm text-muted-foreground">
            Three sizes to match content hierarchy and space constraints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" text="Small" />
          <Button size="md" text="Medium" />
          <Button size="lg" text="Large" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete overview of the 7-variant button system with clear usage guidance for each type.',
      },
    },
  },
};

// Detailed Intent Variants with Usage Guidelines
export const IntentVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">PRIMARY</h3>
            <p className="text-xs text-muted-foreground">Main CTA, most important actions</p>
          </div>
          <div className="space-y-2">
            <Button intent="primary" text="Save Changes" />
            <Button intent="primary" text="Create" icon={Plus} />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Submit forms, create actions, primary CTAs
          </div>
        </div>

        {/* Secondary */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">SECONDARY</h3>
            <p className="text-xs text-muted-foreground">Alternative actions, less prominent</p>
          </div>
          <div className="space-y-2">
            <Button intent="secondary" text="Cancel" />
            <Button intent="secondary" text="Filter" icon={Filter} />
            <Button intent="secondary" text="Settings" icon={Settings} />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Cancel actions, filters, settings, secondary CTAs
          </div>
        </div>

        {/* Ghost */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">GHOST</h3>
            <p className="text-xs text-muted-foreground">Minimal prominence, subtle actions</p>
          </div>
          <div className="space-y-2">
            <Button intent="ghost" text="Skip" />
            <Button intent="ghost" icon={Edit} />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Icon buttons, tertiary actions, skip options
          </div>
        </div>

        {/* Success */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">SUCCESS</h3>
            <p className="text-xs text-muted-foreground">Positive outcomes, confirmations</p>
          </div>
          <div className="space-y-2">
            <Button intent="success" text="Approve" icon={Check} />
            <Button intent="success" text="Complete" />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Approvals, completions, positive confirmations
          </div>
        </div>

        {/* Warning */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">WARNING</h3>
            <p className="text-xs text-muted-foreground">Caution required, potentially risky</p>
          </div>
          <div className="space-y-2">
            <Button intent="warning" text="Proceed" icon={AlertTriangle} />
            <Button intent="warning" text="Override" />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Caution actions, overrides, proceed with care
          </div>
        </div>

        {/* Danger */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">DANGER</h3>
            <p className="text-xs text-muted-foreground">
              Destructive actions, critical operations
            </p>
          </div>
          <div className="space-y-2">
            <Button intent="danger" text="Delete" icon={Trash2} />
            <Button intent="danger" text="Remove" />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Delete actions, permanent removals, critical operations
          </div>
        </div>

        {/* Secondary Inverted */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">SECONDARY INVERTED</h3>
            <p className="text-xs text-muted-foreground">For dark/colored backgrounds</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg">
            <Button intent="secondaryInverted" text="Learn More" />
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Use for:</strong> Buttons on hero sections, colored cards, dark themes
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Detailed breakdown of each button variant with specific usage guidelines and examples.',
      },
    },
  },
};

// Size and Icon Configurations
export const SizeAndIconConfigurations: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Size Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Size Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">SMALL (sm)</h4>
            <Button size="sm" text="Small Button" />
            <p className="text-xs text-muted-foreground">
              Use in compact spaces, table actions, inline controls
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">MEDIUM (md) - Default</h4>
            <Button size="md" text="Medium Button" />
            <p className="text-xs text-muted-foreground">
              Standard size for most use cases, forms, modals
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">LARGE (lg)</h4>
            <Button size="lg" text="Large Button" />
            <p className="text-xs text-muted-foreground">
              Hero sections, landing pages, prominent CTAs
            </p>
          </div>
        </div>
      </div>

      {/* Icon Configurations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Icon Usage</h3>
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium">Icon Positions</h4>
            <div className="flex gap-3">
              <Button text="Back" icon={ChevronLeft} iconPosition="left" intent="secondary" />
              <Button text="Continue" icon={ChevronRight} iconPosition="right" intent="success" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Secondary Buttons with Icons</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button text="Export" icon={Download} intent="secondary" />
              <Button text="Upload" icon={Upload} intent="secondary" />
              <Button text="Filter" icon={Filter} intent="secondary" />
              <Button text="Settings" icon={Settings} intent="secondary" />
              <Button text="Search" icon={Search} intent="secondary" />
              <Button text="Edit" icon={Edit} intent="secondary" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Icon-Only Buttons (Ghost recommended)</h4>
            <div className="flex gap-2">
              <Button icon={Edit} intent="ghost" />
              <Button icon={Heart} intent="ghost" />
              <Button icon={Star} intent="ghost" />
              <Button icon={Settings} intent="ghost" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Primary vs Secondary with Icons</h4>
            <div className="flex gap-3">
              <Button text="Save Changes" icon={Save} intent="primary" />
              <Button text="Save Draft" icon={Save} intent="secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Size guidelines and icon usage patterns for consistent button implementation.',
      },
    },
  },
};

// State Variants and Link Usage
export const StatesAndLinks: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Button States */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Button States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">NORMAL</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" />
              <Button text="Secondary" intent="secondary" />
              <Button text="Success" intent="success" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">DISABLED</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" disabled />
              <Button text="Secondary" intent="secondary" disabled />
              <Button text="Success" intent="success" disabled />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">LOADING</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" isLoading />
              <Button text="Secondary" intent="secondary" isLoading />
              <Button text="Success" intent="success" isLoading />
            </div>
          </div>
        </div>
      </div>

      {/* Link Usage */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Link Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">INTERNAL NAVIGATION</h4>
            <div className="space-y-2">
              <Button text="Dashboard" href="/dashboard" intent="primary" />
              <Button text="Settings" href="/settings" intent="secondary" />
              <Button text="Profile" href="/profile" intent="secondary" icon={Settings} />
            </div>
            <p className="text-xs text-muted-foreground">
              Uses Next.js Link component for client-side navigation
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">EXTERNAL LINKS</h4>
            <div className="space-y-2">
              <Button
                text="Documentation"
                href="https://docs.example.com"
                external
                intent="secondary"
                icon={ExternalLink}
                iconPosition="right"
              />
              <Button
                text="Support"
                href="https://support.example.com"
                external
                intent="secondary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Opens in new tab with proper security attributes
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button states (normal, disabled, loading) and link usage patterns.',
      },
    },
  },
};

// Fleet AI Real-World Examples
export const FleetAIExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Fleet AI Application Examples</h3>
        <p className="text-sm text-muted-foreground">
          Real-world button usage in fleet management scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dashboard Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Dashboard Actions</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button text="Add Aircraft" icon={Plus} intent="primary" />
              <Button text="Generate Report" icon={Download} intent="secondary" />
            </div>
            <div className="flex gap-2">
              <Button text="Filter Fleet" icon={Filter} intent="secondary" />
              <Button icon={Settings} intent="ghost" />
            </div>
          </div>
        </div>

        {/* Operations Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Operations Management</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button text="Schedule Flight" intent="primary" />
              <Button text="Emergency Stop" intent="danger" icon={AlertTriangle} />
            </div>
            <div className="flex gap-2">
              <Button text="Approve Route" intent="success" icon={Check} />
              <Button text="View Details" intent="secondary" />
            </div>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Maintenance Operations</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button text="Schedule Maintenance" intent="warning" />
              <Button text="Mark Complete" intent="success" icon={Check} />
            </div>
            <div className="flex gap-2">
              <Button text="Request Parts" intent="secondary" />
              <Button text="Technician Notes" intent="ghost" icon={Edit} />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h4 className="font-medium">Data & Analytics</h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button text="Export Data" icon={Download} intent="secondary" />
              <Button text="Upload File" icon={Upload} intent="secondary" />
            </div>
            <div className="flex gap-2">
              <Button text="Search Records" icon={Search} intent="ghost" />
              <Button text="Delete Records" icon={Trash2} intent="danger" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Practical examples of button usage in Fleet AI application contexts.',
      },
    },
  },
};

// Interactive Controls Story
export const Interactive: Story = {
  args: {
    intent: 'primary',
    size: 'md',
    text: 'Interactive Button',
    icon: undefined,
    iconPosition: 'left',
    disabled: false,
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive button with controls to test all available configurations.',
      },
    },
  },
};
