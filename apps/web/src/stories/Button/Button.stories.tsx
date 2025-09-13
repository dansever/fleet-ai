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
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import * as React from 'react';
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

// Loading Animation Showcase
export const LoadingAnimations: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Loading Animation Showcase
        </h1>
        <p className="text-lg text-muted-foreground">
          Elegant spinning animations for loading states
        </p>
      </div>

      {/* Default Loading Icons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Default Loading Animations
        </h2>
        <p className="text-muted-foreground mb-6">
          Default loading behavior uses Loader2 icon with smooth spinning animation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">WITH TEXT</h3>
            <div className="space-y-2">
              <Button intent="primary" text="Saving..." isLoading />
              <Button intent="secondary" text="Loading..." isLoading />
              <Button intent="success" text="Processing..." isLoading />
              <Button intent="warning" text="Updating..." isLoading />
              <Button intent="danger" text="Deleting..." isLoading />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">ICON ONLY</h3>
            <div className="flex flex-wrap gap-2">
              <Button intent="primary" isLoading />
              <Button intent="secondary" isLoading />
              <Button intent="success" isLoading />
              <Button intent="warning" isLoading />
              <Button intent="danger" isLoading />
              <Button intent="ghost" isLoading />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">DIFFERENT SIZES</h3>
            <div className="space-y-2">
              <Button size="sm" text="Small Loading" isLoading />
              <Button size="md" text="Medium Loading" isLoading />
              <Button size="lg" text="Large Loading" isLoading />
            </div>
          </div>
        </div>
      </section>

      {/* Smart Refresh Icon Behavior */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Smart Refresh Icon Behavior
        </h2>
        <p className="text-muted-foreground mb-6">
          When using RefreshCw icon, it automatically spins during loading state
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-violet-700">NORMAL STATE</h3>
            <div className="space-y-2">
              <Button text="Refresh Data" icon={RefreshCw} intent="secondary" />
              <Button text="Sync" icon={RefreshCw} intent="primary" />
              <Button icon={RefreshCw} intent="ghost" />
              <Button text="Reload" icon={RefreshCw} iconPosition="right" intent="secondary" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-violet-700">LOADING STATE</h3>
            <div className="space-y-2">
              <Button text="Refreshing..." icon={RefreshCw} intent="secondary" isLoading />
              <Button text="Syncing..." icon={RefreshCw} intent="primary" isLoading />
              <Button icon={RefreshCw} intent="ghost" isLoading />
              <Button
                text="Reloading..."
                icon={RefreshCw}
                iconPosition="right"
                intent="secondary"
                isLoading
              />
            </div>
          </div>
        </div>
      </section>

      {/* Custom Loading Icons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Custom Loading Icons
        </h2>
        <p className="text-muted-foreground mb-6">
          Override default loading behavior with custom icons
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-violet-700">CUSTOM LOADER2</h3>
            <div className="space-y-2">
              <Button text="Custom Loading" icon={Save} loadingIcon={Loader2} isLoading />
              <Button text="Processing" icon={Upload} loadingIcon={Loader2} isLoading />
              <Button icon={Download} loadingIcon={Loader2} isLoading />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-violet-700">CUSTOM REFRESH</h3>
            <div className="space-y-2">
              <Button text="Syncing Data" icon={Save} loadingIcon={RefreshCw} isLoading />
              <Button text="Updating" icon={Edit} loadingIcon={RefreshCw} isLoading />
              <Button icon={Settings} loadingIcon={RefreshCw} isLoading />
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Fleet AI Real-World Loading Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Common loading scenarios in fleet management applications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">DATA OPERATIONS</h3>
            <div className="space-y-2">
              <Button text="Saving Flight Plan..." icon={Save} isLoading />
              <Button text="Uploading Document..." icon={Upload} isLoading />
              <Button text="Exporting Report..." icon={Download} isLoading />
              <Button text="Refreshing Fleet Status..." icon={RefreshCw} isLoading />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">OPERATIONS</h3>
            <div className="space-y-2">
              <Button text="Scheduling Flight..." intent="primary" isLoading />
              <Button text="Approving Route..." intent="success" isLoading />
              <Button text="Updating Maintenance..." intent="warning" isLoading />
              <Button text="Processing Emergency..." intent="danger" isLoading />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">QUICK ACTIONS</h3>
            <div className="flex flex-wrap gap-2">
              <Button icon={RefreshCw} intent="ghost" isLoading />
              <Button icon={Settings} intent="ghost" isLoading />
              <Button icon={Search} intent="ghost" isLoading />
              <Button icon={Filter} intent="secondary" isLoading />
              <Button icon={Plus} intent="primary" isLoading />
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of loading animations including default behavior, smart refresh icon handling, and custom loading icons.',
      },
    },
  },
};

// Interactive Loading Test
export const InteractiveLoadingTest: Story = {
  render: function InteractiveLoadingStory() {
    const [loadingStates, setLoadingStates] = React.useState({
      refresh: false,
      save: false,
      upload: false,
      custom: false,
    });

    const toggleLoading = (key: keyof typeof loadingStates) => {
      setLoadingStates((prev) => ({ ...prev, [key]: !prev[key] }));

      // Auto-reset after 3 seconds for demo
      setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
      }, 3000);
    };

    return (
      <div className="space-y-8 max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Interactive Loading Test
          </h1>
          <p className="text-lg text-muted-foreground">
            Click buttons to test loading animations (auto-resets after 3 seconds)
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">SMART REFRESH BEHAVIOR</h3>
            <div className="flex gap-3">
              <Button
                text={loadingStates.refresh ? 'Refreshing...' : 'Refresh Data'}
                icon={RefreshCw}
                intent="secondary"
                isLoading={loadingStates.refresh}
                onClick={() => toggleLoading('refresh')}
              />
              <Button
                icon={RefreshCw}
                intent="ghost"
                isLoading={loadingStates.refresh}
                onClick={() => toggleLoading('refresh')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">DEFAULT LOADING BEHAVIOR</h3>
            <div className="flex gap-3">
              <Button
                text={loadingStates.save ? 'Saving...' : 'Save Document'}
                icon={Save}
                intent="primary"
                isLoading={loadingStates.save}
                onClick={() => toggleLoading('save')}
              />
              <Button
                text={loadingStates.upload ? 'Uploading...' : 'Upload File'}
                icon={Upload}
                intent="secondary"
                isLoading={loadingStates.upload}
                onClick={() => toggleLoading('upload')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-violet-700">CUSTOM LOADING ICON</h3>
            <div className="flex gap-3">
              <Button
                text={loadingStates.custom ? 'Processing...' : 'Process Data'}
                icon={Settings}
                loadingIcon={RefreshCw}
                intent="warning"
                isLoading={loadingStates.custom}
                onClick={() => toggleLoading('custom')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive test to demonstrate loading animations in action. Click buttons to see the spinning animations.',
      },
    },
  },
};

// Comprehensive Button Showcase - All variants in one story
export const AllButtonVariants: Story = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI Button Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of all 7 semantic button variants and configurations
        </p>
      </div>

      {/* Intent Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Button Intent Variants
        </h2>
        <p className="text-muted-foreground mb-6">
          Seven semantic variants designed for consistency and clear visual hierarchy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Primary */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">PRIMARY</h3>
              <p className="text-xs text-muted-foreground">Main CTA, most important actions</p>
            </div>
            <div className="space-y-2">
              <Button intent="primary" text="Save Changes" />
              <Button intent="primary" text="Create" icon={Plus} />
              <Button intent="primary" text="Submit" icon={ChevronRight} iconPosition="right" />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Submit forms, create actions, primary CTAs
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">SECONDARY</h3>
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
              <h3 className="font-semibold text-sm text-violet-700">GHOST</h3>
              <p className="text-xs text-muted-foreground">Minimal prominence, subtle actions</p>
            </div>
            <div className="space-y-2">
              <Button intent="ghost" text="Skip" />
              <Button intent="ghost" icon={Edit} />
              <Button intent="ghost" icon={Heart} />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Icon buttons, tertiary actions, skip options
            </div>
          </div>

          {/* Success */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">SUCCESS</h3>
              <p className="text-xs text-muted-foreground">Positive outcomes, confirmations</p>
            </div>
            <div className="space-y-2">
              <Button intent="success" text="Approve" icon={Check} />
              <Button intent="success" text="Complete" />
              <Button intent="success" text="Confirm" icon={Check} iconPosition="right" />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Approvals, completions, positive confirmations
            </div>
          </div>

          {/* Warning */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">WARNING</h3>
              <p className="text-xs text-muted-foreground">Caution required, potentially risky</p>
            </div>
            <div className="space-y-2">
              <Button intent="warning" text="Proceed" icon={AlertTriangle} />
              <Button intent="warning" text="Override" />
              <Button intent="warning" text="Caution" />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Caution actions, overrides, proceed with care
            </div>
          </div>

          {/* Danger */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">DANGER</h3>
              <p className="text-xs text-muted-foreground">
                Destructive actions, critical operations
              </p>
            </div>
            <div className="space-y-2">
              <Button intent="danger" text="Delete" icon={Trash2} />
              <Button intent="danger" text="Remove" />
              <Button intent="danger" text="Terminate" />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Delete actions, permanent removals, critical operations
            </div>
          </div>

          {/* Secondary Inverted */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-violet-700">SECONDARY INVERTED</h3>
              <p className="text-xs text-muted-foreground">For dark/colored backgrounds</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-violet-600 to-blue-600 rounded-lg">
              <div className="space-y-2">
                <Button intent="secondaryInverted" text="Learn More" />
                <Button
                  intent="secondaryInverted"
                  text="Get Started"
                  icon={ChevronRight}
                  iconPosition="right"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Buttons on hero sections, colored cards, dark themes
            </div>
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Size Variants
        </h2>
        <p className="text-muted-foreground mb-6">
          Three sizes to match content hierarchy and space constraints
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SMALL (sm)</h4>
            <div className="space-y-3">
              <Button size="sm" text="Small Primary" intent="primary" />
              <Button size="sm" text="Small Secondary" intent="secondary" />
              <Button size="sm" text="Export" icon={Download} intent="secondary" />
              <Button size="sm" icon={Edit} intent="ghost" />
            </div>
            <p className="text-xs text-muted-foreground">
              Use in compact spaces, table actions, inline controls
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">MEDIUM (md) - Default</h4>
            <div className="space-y-3">
              <Button size="md" text="Medium Primary" intent="primary" />
              <Button size="md" text="Medium Secondary" intent="secondary" />
              <Button size="md" text="Upload" icon={Upload} intent="secondary" />
              <Button size="md" icon={Settings} intent="ghost" />
            </div>
            <p className="text-xs text-muted-foreground">
              Standard size for most use cases, forms, modals
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">LARGE (lg)</h4>
            <div className="space-y-3">
              <Button size="lg" text="Large Primary" intent="primary" />
              <Button size="lg" text="Large Secondary" intent="secondary" />
              <Button
                size="lg"
                text="Continue"
                icon={ChevronRight}
                iconPosition="right"
                intent="success"
              />
              <Button size="lg" icon={Star} intent="ghost" />
            </div>
            <p className="text-xs text-muted-foreground">
              Hero sections, landing pages, prominent CTAs
            </p>
          </div>
        </div>
      </section>

      {/* Icon Configurations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Icon Configurations
        </h2>
        <p className="text-muted-foreground mb-6">
          Icon positions, icon-only buttons, and common icon patterns
        </p>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="font-medium">Icon Positions</h4>
            <div className="flex flex-wrap gap-3">
              <Button text="Back" icon={ChevronLeft} iconPosition="left" intent="secondary" />
              <Button text="Continue" icon={ChevronRight} iconPosition="right" intent="primary" />
              <Button text="Download" icon={Download} iconPosition="left" intent="secondary" />
              <Button
                text="External Link"
                icon={ExternalLink}
                iconPosition="right"
                intent="ghost"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Icon-Only Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <Button icon={Edit} intent="ghost" />
              <Button icon={Heart} intent="ghost" />
              <Button icon={Star} intent="ghost" />
              <Button icon={Settings} intent="ghost" />
              <Button icon={Search} intent="ghost" />
              <Button icon={Filter} intent="secondary" />
              <Button icon={Plus} intent="primary" />
              <Button icon={Trash2} intent="danger" />
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended to use ghost intent for most icon-only buttons
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Common Icon Patterns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <Button text="Save" icon={Save} intent="primary" />
                  <Button text="Edit" icon={Edit} intent="secondary" />
                  <Button text="Delete" icon={Trash2} intent="danger" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Data Operations</h5>
                <div className="flex flex-wrap gap-2">
                  <Button text="Export" icon={Download} intent="secondary" />
                  <Button text="Upload" icon={Upload} intent="secondary" />
                  <Button text="Search" icon={Search} intent="ghost" />
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Navigation</h5>
                <div className="flex flex-wrap gap-2">
                  <Button text="Back" icon={ChevronLeft} intent="secondary" />
                  <Button text="Next" icon={ChevronRight} iconPosition="right" intent="primary" />
                  <Button text="External" icon={ExternalLink} iconPosition="right" intent="ghost" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Button States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Button States
        </h2>
        <p className="text-muted-foreground mb-6">
          Normal, disabled, and loading states across all variants
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">NORMAL STATE</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" />
              <Button text="Secondary" intent="secondary" />
              <Button text="Success" intent="success" />
              <Button text="Warning" intent="warning" />
              <Button text="Danger" intent="danger" />
              <Button text="Ghost" intent="ghost" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">DISABLED STATE</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" disabled />
              <Button text="Secondary" intent="secondary" disabled />
              <Button text="Success" intent="success" disabled />
              <Button text="Warning" intent="warning" disabled />
              <Button text="Danger" intent="danger" disabled />
              <Button text="Ghost" intent="ghost" disabled />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">LOADING STATE</h4>
            <div className="space-y-2">
              <Button text="Primary" intent="primary" isLoading />
              <Button text="Secondary" intent="secondary" isLoading />
              <Button text="Success" intent="success" isLoading />
              <Button text="Warning" intent="warning" isLoading />
              <Button text="Danger" intent="danger" isLoading />
              <Button text="Ghost" intent="ghost" isLoading />
            </div>
          </div>
        </div>
      </section>

      {/* Link Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Link Usage
        </h2>
        <p className="text-muted-foreground mb-6">
          Button components as navigation links (internal and external)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">INTERNAL NAVIGATION</h4>
            <div className="space-y-2">
              <Button text="Dashboard" href="/dashboard" intent="primary" />
              <Button text="Fleet Management" href="/fleet" intent="secondary" />
              <Button text="Settings" href="/settings" intent="secondary" icon={Settings} />
              <Button text="Profile" href="/profile" intent="ghost" />
            </div>
            <p className="text-xs text-muted-foreground">
              Uses Next.js Link component for client-side navigation
            </p>
          </div>

          <div className="space-y-4">
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
                text="Support Center"
                href="https://support.example.com"
                external
                intent="secondary"
              />
              <Button
                text="API Reference"
                href="https://api.example.com"
                external
                intent="ghost"
                icon={ExternalLink}
                iconPosition="right"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Opens in new tab with proper security attributes
            </p>
          </div>
        </div>
      </section>

      {/* Fleet AI Real-World Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Fleet AI Application Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Real-world button usage in fleet management scenarios
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dashboard Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">Dashboard Actions</h4>
            <div className="space-y-3">
              <Button text="Add Aircraft" icon={Plus} intent="primary" />
              <Button text="Generate Report" icon={Download} intent="secondary" />
              <Button text="Filter Fleet" icon={Filter} intent="secondary" />
              <Button icon={Settings} intent="ghost" />
            </div>
          </div>

          {/* Operations Management */}
          <div className="space-y-4">
            <h4 className="font-medium">Operations Management</h4>
            <div className="space-y-3">
              <Button text="Schedule Flight" intent="primary" />
              <Button text="Approve Route" intent="success" icon={Check} />
              <Button text="Emergency Stop" intent="danger" icon={AlertTriangle} />
              <Button text="View Details" intent="secondary" />
            </div>
          </div>

          {/* Maintenance Operations */}
          <div className="space-y-4">
            <h4 className="font-medium">Maintenance Operations</h4>
            <div className="space-y-3">
              <Button text="Schedule Maintenance" intent="warning" />
              <Button text="Mark Complete" intent="success" icon={Check} />
              <Button text="Request Parts" intent="secondary" />
              <Button text="Notes" intent="ghost" icon={Edit} />
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h4 className="font-medium">Data & Analytics</h4>
            <div className="space-y-3">
              <Button text="Export Data" icon={Download} intent="secondary" />
              <Button text="Upload File" icon={Upload} intent="secondary" />
              <Button text="Search Records" icon={Search} intent="ghost" />
              <Button text="Delete Records" icon={Trash2} intent="danger" />
            </div>
          </div>

          {/* User Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">User Actions</h4>
            <div className="space-y-3">
              <Button text="Save Profile" intent="primary" icon={Save} />
              <Button text="Edit Profile" intent="secondary" icon={Edit} />
              <Button text="Change Password" intent="warning" />
              <Button text="Logout" intent="ghost" />
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-4">
            <h4 className="font-medium">Communication</h4>
            <div className="space-y-3">
              <Button text="Send Message" intent="primary" />
              <Button text="Call Support" intent="secondary" />
              <Button text="Emergency Contact" intent="danger" />
              <Button icon={Heart} intent="ghost" />
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available button components in the Fleet AI design system.',
      },
    },
  },
};
