import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile status badge component for displaying system states, operational status, and priority levels in Fleet AI applications.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['default', 'secondary', 'operational', 'pending', 'warning', 'error', 'processing'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    icon: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

// Comprehensive StatusBadge Showcase - All variants in one story
export const AllStatusBadgeVariants: Story = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI StatusBadge Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of status indicators and operational states
        </p>
      </div>

      {/* Status Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Status Types
        </h2>
        <p className="text-muted-foreground mb-6">
          Five semantic status types with appropriate colors and icons
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">DEFAULT</h4>
            <div className="flex flex-col space-y-3">
              <StatusBadge status="default" />
              <StatusBadge status="default" text="Round 2" />
              <StatusBadge status="default" text="Flight Ready" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Default state, placeholder text, optional text
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SECONDARY</h4>
            <div className="flex flex-col space-y-3">
              <StatusBadge status="secondary" />
              <StatusBadge status="secondary" text="Round 2" />
              <StatusBadge status="secondary" text="Flight Ready" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Default state, placeholder text, optional text
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">OPERATIONAL</h4>
            <div className="space-y-3">
              <StatusBadge status="operational" icon={CheckCircle} />
              <StatusBadge status="operational" text="All Systems Go" />
              <StatusBadge status="operational" text="Flight Ready" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Normal operations, systems running smoothly, ready states
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">PENDING</h4>
            <div className="space-y-3">
              <StatusBadge status="pending" />
              <StatusBadge status="pending" text="Awaiting Approval" />
              <StatusBadge status="pending" text="In Queue" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Waiting states, scheduled items, pending approvals
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">WARNING</h4>
            <div className="space-y-3">
              <StatusBadge status="warning" />
              <StatusBadge status="warning" text="Attention Required" />
              <StatusBadge status="warning" text="Fuel Low" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Caution states, attention needed, minor issues
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">ERROR</h4>
            <div className="space-y-3">
              <StatusBadge status="error" />
              <StatusBadge status="error" text="System Failure" />
              <StatusBadge status="error" text="Critical Issue" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Error states, system failures, critical problems
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">PROCESSING</h4>
            <div className="space-y-3">
              <StatusBadge status="processing" />
              <StatusBadge status="processing" text="Loading Data" />
              <StatusBadge status="processing" text="Calculating" />
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Use for:</strong> Active processes, loading states, calculations in progress
            </p>
          </div>
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Size Variants
        </h2>
        <p className="text-muted-foreground mb-6">
          Three sizes for different interface contexts and space constraints
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SMALL (sm)</h4>
            <div className="space-y-3">
              <StatusBadge status="operational" size="sm" />
              <StatusBadge status="pending" size="sm" text="Small Pending" />
              <StatusBadge status="warning" size="sm" text="Small Warning" />
              <StatusBadge status="error" size="sm" text="Small Error" />
              <StatusBadge status="processing" size="sm" text="Small Processing" />
            </div>
            <p className="text-xs text-muted-foreground">
              Use in compact spaces, tables, list items, inline indicators
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">MEDIUM (md) - Default</h4>
            <div className="space-y-3">
              <StatusBadge status="operational" size="md" />
              <StatusBadge status="pending" size="md" text="Medium Pending" />
              <StatusBadge status="warning" size="md" text="Medium Warning" />
              <StatusBadge status="error" size="md" text="Medium Error" />
              <StatusBadge status="processing" size="md" text="Medium Processing" />
            </div>
            <p className="text-xs text-muted-foreground">
              Standard size for most use cases, cards, forms, general UI
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">LARGE (lg)</h4>
            <div className="space-y-3">
              <StatusBadge status="operational" size="lg" />
              <StatusBadge status="pending" size="lg" text="Large Pending" />
              <StatusBadge status="warning" size="lg" text="Large Warning" />
              <StatusBadge status="error" size="lg" text="Large Error" />
              <StatusBadge status="processing" size="lg" text="Large Processing" />
            </div>
            <p className="text-xs text-muted-foreground">
              Prominent displays, dashboards, headers, important status indicators
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
          Icons can be shown or hidden based on design requirements
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">WITH ICONS (Default)</h4>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="operational" text="Operational" icon={CheckCircle} />
              <StatusBadge status="pending" text="Pending" icon={CheckCircle} />
              <StatusBadge status="warning" text="Warning" icon={CheckCircle} />
              <StatusBadge status="error" text="Error" icon={CheckCircle} />
              <StatusBadge status="processing" text="Processing" icon={CheckCircle} />
            </div>
            <p className="text-xs text-muted-foreground">
              Icons provide visual context and improve recognition
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">WITHOUT ICONS</h4>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="operational" text="Operational" icon={CheckCircle} />
              <StatusBadge status="pending" text="Pending" icon={CheckCircle} />
              <StatusBadge status="warning" text="Warning" icon={CheckCircle} />
              <StatusBadge status="error" text="Error" icon={CheckCircle} />
              <StatusBadge status="processing" text="Processing" icon={CheckCircle} />
            </div>
            <p className="text-xs text-muted-foreground">
              Clean text-only badges for minimal interfaces or space constraints
            </p>
          </div>
        </div>
      </section>

      {/* Fleet AI Application Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Fleet AI Application Examples
        </h2>
        <p className="text-muted-foreground mb-6">Real-world usage in fleet management scenarios</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Aircraft Status */}
          <div className="space-y-4">
            <h4 className="font-medium">Aircraft Status</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">N737BA</span>
                <StatusBadge status="operational" text="Flight Ready" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">N320AB</span>
                <StatusBadge status="warning" text="Maintenance Due" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">N777CD</span>
                <StatusBadge status="error" text="Grounded" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">N787EF</span>
                <StatusBadge status="processing" text="Pre-flight Check" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">N350GH</span>
                <StatusBadge status="pending" text="Scheduled" size="sm" />
              </div>
            </div>
          </div>

          {/* Flight Operations */}
          <div className="space-y-4">
            <h4 className="font-medium">Flight Operations</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA1247 JFK→LAX</span>
                <StatusBadge status="operational" text="On Time" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA2156 ORD→MIA</span>
                <StatusBadge status="warning" text="Delayed" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA3389 DEN→SEA</span>
                <StatusBadge status="error" text="Cancelled" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA4492 ATL→BOS</span>
                <StatusBadge status="processing" text="Boarding" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA5678 LAX→SFO</span>
                <StatusBadge status="pending" text="Scheduled" size="sm" />
              </div>
            </div>
          </div>

          {/* Maintenance Status */}
          <div className="space-y-4">
            <h4 className="font-medium">Maintenance Operations</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">A-Check #1247</span>
                <StatusBadge status="operational" text="Complete" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">C-Check #0892</span>
                <StatusBadge status="processing" text="In Progress" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engine Repair</span>
                <StatusBadge status="warning" text="Parts Needed" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avionics Update</span>
                <StatusBadge status="pending" text="Scheduled" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Safety Inspection</span>
                <StatusBadge status="error" text="Failed" size="sm" />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <h4 className="font-medium">System Health</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Flight Management</span>
                <StatusBadge status="operational" text="Online" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weather Service</span>
                <StatusBadge status="operational" text="Active" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fuel Management</span>
                <StatusBadge status="warning" text="Slow Response" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Crew Scheduling</span>
                <StatusBadge status="processing" text="Updating" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup Systems</span>
                <StatusBadge status="error" text="Offline" size="sm" />
              </div>
            </div>
          </div>

          {/* Route Performance */}
          <div className="space-y-4">
            <h4 className="font-medium">Route Performance</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">JFK-LAX Route</span>
                <StatusBadge status="operational" text="Excellent" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ORD-MIA Route</span>
                <StatusBadge status="operational" text="Good" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DEN-SEA Route</span>
                <StatusBadge status="warning" text="Weather Issues" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ATL-BOS Route</span>
                <StatusBadge status="processing" text="Analyzing" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LAX-SFO Route</span>
                <StatusBadge status="pending" text="Under Review" size="sm" />
              </div>
            </div>
          </div>

          {/* Crew Status */}
          <div className="space-y-4">
            <h4 className="font-medium">Crew Management</h4>
            <div className="space-y-3 p-4 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Captain Johnson</span>
                <StatusBadge status="operational" text="Available" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FO Chen</span>
                <StatusBadge status="operational" text="On Duty" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FA Thompson</span>
                <StatusBadge status="warning" text="Training Due" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Captain Rodriguez</span>
                <StatusBadge status="pending" text="Rest Period" size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FO Wilson</span>
                <StatusBadge status="error" text="Sick Leave" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Dashboard Integration
        </h2>
        <p className="text-muted-foreground mb-6">
          Status badges in dashboard and overview contexts
        </p>

        <div className="space-y-8">
          {/* Fleet Overview Dashboard */}
          <div className="space-y-4">
            <h4 className="font-medium">Fleet Overview Dashboard</h4>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">247</div>
                  <div className="text-sm text-muted-foreground mb-2">Total Aircraft</div>
                  <StatusBadge status="operational" text="Fleet Active" size="sm" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">234</div>
                  <div className="text-sm text-muted-foreground mb-2">Operational</div>
                  <StatusBadge status="operational" text="94.7%" size="sm" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
                  <div className="text-sm text-muted-foreground mb-2">Maintenance</div>
                  <StatusBadge status="warning" text="Scheduled" size="sm" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">5</div>
                  <div className="text-sm text-muted-foreground mb-2">Grounded</div>
                  <StatusBadge status="error" text="Critical" size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* System Status Dashboard */}
          <div className="space-y-4">
            <h4 className="font-medium">System Status Dashboard</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">Core Systems</h5>
                  <StatusBadge status="operational" size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">All primary systems operational</div>
              </div>
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">Data Processing</h5>
                  <StatusBadge status="processing" text="Active" size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">Processing flight data updates</div>
              </div>
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium">Weather Service</h5>
                  <StatusBadge status="warning" text="Delayed" size="sm" />
                </div>
                <div className="text-sm text-muted-foreground">
                  External service experiencing delays
                </div>
              </div>
            </div>
          </div>

          {/* Priority Alerts */}
          <div className="space-y-4">
            <h4 className="font-medium">Priority Alert Center</h4>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-red-900">Critical System Alert</div>
                    <div className="text-sm text-red-700">
                      Engine temperature exceeds safe limits - Aircraft N737BA
                    </div>
                  </div>
                  <StatusBadge status="error" text="Critical" size="lg" />
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-orange-900">Maintenance Warning</div>
                    <div className="text-sm text-orange-700">
                      Scheduled maintenance overdue for 3 aircraft
                    </div>
                  </div>
                  <StatusBadge status="warning" text="Action Required" size="lg" />
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">System Update</div>
                    <div className="text-sm text-blue-700">
                      Flight management system update in progress
                    </div>
                  </div>
                  <StatusBadge status="processing" text="Updating" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Custom Styling
        </h2>
        <p className="text-muted-foreground mb-6">
          StatusBadge components with custom styling for specific use cases
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">STANDARD STYLING</h4>
            <div className="flex flex-wrap gap-3 p-4 bg-white border rounded-xl">
              <StatusBadge status="operational" text="Standard Green" />
              <StatusBadge status="warning" text="Standard Orange" />
              <StatusBadge status="error" text="Standard Red" />
              <StatusBadge status="processing" text="Standard Blue" />
              <StatusBadge status="pending" text="Standard Amber" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">CUSTOM STYLING</h4>
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border rounded-xl">
              <StatusBadge
                status="operational"
                text="Custom Success"
                className="bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
              />
              <StatusBadge
                status="warning"
                text="Custom Warning"
                className="bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-600"
              />
              <StatusBadge
                status="error"
                text="Custom Error"
                className="bg-rose-500 text-white border-rose-600 hover:bg-rose-600"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Custom colors and styling can be applied using the className prop
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available StatusBadge component configurations in the Fleet AI design system.',
      },
    },
  },
};
