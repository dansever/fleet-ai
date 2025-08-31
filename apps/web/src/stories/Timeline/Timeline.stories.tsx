import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  FileText,
  Plane,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A timeline component for displaying chronological events, processes, and status updates in Fleet AI applications.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

// Comprehensive Timeline Showcase - All variants in one story
export const AllTimelineVariants: Story = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI Timeline Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of timeline configurations for tracking events and processes
        </p>
      </div>

      {/* Status Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Timeline Status Types
        </h2>
        <p className="text-muted-foreground mb-6">
          Four status types with appropriate colors and visual indicators
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">BASIC STATUS FLOW</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Task Completed',
                  description: 'Successfully finished maintenance check',
                  timestamp: '2 hours ago',
                  status: 'completed',
                },
                {
                  id: '2',
                  title: 'Currently Active',
                  description: 'Pre-flight inspection in progress',
                  timestamp: 'Now',
                  status: 'current',
                },
                {
                  id: '3',
                  title: 'Scheduled Task',
                  description: 'Fuel loading scheduled for 3:00 PM',
                  timestamp: 'In 1 hour',
                  status: 'pending',
                },
                {
                  id: '4',
                  title: 'Overdue Task',
                  description: 'Documentation review past due date',
                  timestamp: '1 day overdue',
                  status: 'overdue',
                },
              ]}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">WITH CUSTOM ICONS</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Flight Completed',
                  description: 'JFK to LAX route successfully completed',
                  timestamp: '3 hours ago',
                  status: 'completed',
                  icon: <Plane className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Maintenance Active',
                  description: 'A-Check maintenance currently underway',
                  timestamp: 'Now',
                  status: 'current',
                  icon: <Wrench className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '3',
                  title: 'Crew Briefing',
                  description: 'Pre-flight crew briefing scheduled',
                  timestamp: 'In 30 minutes',
                  status: 'pending',
                  icon: <Users className="w-4 h-4 text-gray-600" />,
                },
                {
                  id: '4',
                  title: 'Safety Report',
                  description: 'Monthly safety report submission overdue',
                  timestamp: '2 days overdue',
                  status: 'overdue',
                  icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Fleet AI Application Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Fleet AI Application Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Real-world timeline usage in fleet management scenarios
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aircraft Maintenance Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">Aircraft Maintenance Timeline - N737BA</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Pre-maintenance Inspection',
                  description: 'Initial assessment and documentation review completed',
                  timestamp: 'Jan 15, 2024',
                  status: 'completed',
                  icon: <FileText className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Engine Service',
                  description: 'Routine engine maintenance and component replacement',
                  timestamp: 'Jan 16, 2024',
                  status: 'completed',
                  icon: <Settings className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Avionics Update',
                  description: 'Software updates and system calibration in progress',
                  timestamp: 'Jan 17, 2024',
                  status: 'current',
                  icon: <Wrench className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '4',
                  title: 'Final Inspection',
                  description: 'Comprehensive systems check and certification',
                  timestamp: 'Jan 18, 2024',
                  status: 'pending',
                  icon: <Check className="w-4 h-4 text-gray-600" />,
                },
                {
                  id: '5',
                  title: 'Return to Service',
                  description: 'Aircraft cleared for operational duty',
                  timestamp: 'Jan 19, 2024',
                  status: 'pending',
                  icon: <Plane className="w-4 h-4 text-gray-600" />,
                },
              ]}
            />
          </div>

          {/* Flight Operations Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">Flight Operations - FA1247</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Flight Planning',
                  description: 'Route optimization and weather analysis completed',
                  timestamp: '6:00 AM',
                  status: 'completed',
                  icon: <Calendar className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Crew Assignment',
                  description: 'Flight crew assigned and briefed',
                  timestamp: '7:00 AM',
                  status: 'completed',
                  icon: <Users className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Aircraft Preparation',
                  description: 'Pre-flight checks and fuel loading in progress',
                  timestamp: '8:30 AM',
                  status: 'current',
                  icon: <Settings className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '4',
                  title: 'Passenger Boarding',
                  description: 'Boarding process scheduled to begin',
                  timestamp: '9:15 AM',
                  status: 'pending',
                  icon: <Users className="w-4 h-4 text-gray-600" />,
                },
                {
                  id: '5',
                  title: 'Departure',
                  description: 'Scheduled takeoff from JFK',
                  timestamp: '10:00 AM',
                  status: 'pending',
                  icon: <Plane className="w-4 h-4 text-gray-600" />,
                },
              ]}
            />
          </div>

          {/* Safety Incident Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">Safety Incident Investigation - SR-2024-089</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Incident Reported',
                  description: 'Initial report filed by flight crew',
                  timestamp: 'Feb 10, 2024',
                  status: 'completed',
                  icon: <AlertTriangle className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Investigation Started',
                  description: 'Safety team assigned to investigate',
                  timestamp: 'Feb 11, 2024',
                  status: 'completed',
                  icon: <FileText className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Data Collection',
                  description: 'Gathering flight data and witness statements',
                  timestamp: 'Feb 12, 2024',
                  status: 'current',
                  icon: <Settings className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '4',
                  title: 'Analysis Phase',
                  description: 'Root cause analysis and recommendations',
                  timestamp: 'Feb 15, 2024',
                  status: 'pending',
                  icon: <Clock className="w-4 h-4 text-gray-600" />,
                },
                {
                  id: '5',
                  title: 'Final Report',
                  description: 'Report submission to regulatory authorities',
                  timestamp: 'Feb 20, 2024',
                  status: 'overdue',
                  icon: <FileText className="w-4 h-4 text-red-600" />,
                },
              ]}
            />
          </div>

          {/* Training Program Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">Pilot Training Program - Emergency Procedures</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Ground School',
                  description: 'Theoretical training and procedures review',
                  timestamp: 'Week 1-2',
                  status: 'completed',
                  icon: <FileText className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Simulator Training',
                  description: 'Emergency scenarios and procedures practice',
                  timestamp: 'Week 3',
                  status: 'completed',
                  icon: <Settings className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Practical Assessment',
                  description: 'Hands-on evaluation of emergency procedures',
                  timestamp: 'Week 4',
                  status: 'current',
                  icon: <Check className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '4',
                  title: 'Certification Review',
                  description: 'Final review and certification approval',
                  timestamp: 'Week 5',
                  status: 'pending',
                  icon: <FileText className="w-4 h-4 text-gray-600" />,
                },
                {
                  id: '5',
                  title: 'License Update',
                  description: 'Update pilot license with new certifications',
                  timestamp: 'Week 6',
                  status: 'pending',
                  icon: <Users className="w-4 h-4 text-gray-600" />,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Timeline Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Timeline Variations
        </h2>
        <p className="text-muted-foreground mb-6">
          Different timeline configurations for various use cases
        </p>

        <div className="space-y-8">
          {/* Short Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SHORT TIMELINE (3 Items)</h4>
            <div className="max-w-md">
              <Timeline
                items={[
                  {
                    id: '1',
                    title: 'Departure',
                    description: 'Flight departed JFK on time',
                    timestamp: '10:00 AM',
                    status: 'completed',
                  },
                  {
                    id: '2',
                    title: 'En Route',
                    description: 'Currently cruising at 35,000 ft',
                    timestamp: '12:30 PM',
                    status: 'current',
                  },
                  {
                    id: '3',
                    title: 'Arrival',
                    description: 'Expected arrival at LAX',
                    timestamp: '1:45 PM',
                    status: 'pending',
                  },
                ]}
              />
            </div>
          </div>

          {/* Extended Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              EXTENDED TIMELINE (6+ Items)
            </h4>
            <div className="max-w-2xl">
              <Timeline
                items={[
                  {
                    id: '1',
                    title: 'Project Initiation',
                    description: 'Fleet modernization project approved and funded',
                    timestamp: 'Jan 1, 2024',
                    status: 'completed',
                    icon: <FileText className="w-4 h-4 text-green-600" />,
                  },
                  {
                    id: '2',
                    title: 'Vendor Selection',
                    description: 'Aircraft manufacturer and suppliers chosen',
                    timestamp: 'Jan 15, 2024',
                    status: 'completed',
                    icon: <Check className="w-4 h-4 text-green-600" />,
                  },
                  {
                    id: '3',
                    title: 'Contract Signing',
                    description: 'Purchase agreements finalized and executed',
                    timestamp: 'Feb 1, 2024',
                    status: 'completed',
                    icon: <FileText className="w-4 h-4 text-green-600" />,
                  },
                  {
                    id: '4',
                    title: 'Manufacturing',
                    description: 'Aircraft production and customization in progress',
                    timestamp: 'Feb 15, 2024',
                    status: 'current',
                    icon: <Settings className="w-4 h-4 text-blue-600" />,
                  },
                  {
                    id: '5',
                    title: 'Quality Inspection',
                    description: 'Pre-delivery inspection and testing',
                    timestamp: 'Jun 1, 2024',
                    status: 'pending',
                    icon: <Check className="w-4 h-4 text-gray-600" />,
                  },
                  {
                    id: '6',
                    title: 'Delivery',
                    description: 'Aircraft delivery to home base',
                    timestamp: 'Jul 1, 2024',
                    status: 'pending',
                    icon: <Plane className="w-4 h-4 text-gray-600" />,
                  },
                  {
                    id: '7',
                    title: 'Service Entry',
                    description: 'Aircraft enters commercial service',
                    timestamp: 'Jul 15, 2024',
                    status: 'pending',
                    icon: <Calendar className="w-4 h-4 text-gray-600" />,
                  },
                ]}
              />
            </div>
          </div>

          {/* Mixed Status Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">MIXED STATUS TIMELINE</h4>
            <div className="max-w-2xl">
              <Timeline
                items={[
                  {
                    id: '1',
                    title: 'System Backup',
                    description: 'Daily system backup completed successfully',
                    timestamp: '12:00 AM',
                    status: 'completed',
                  },
                  {
                    id: '2',
                    title: 'Weather Update',
                    description: 'Severe weather alert - flights may be affected',
                    timestamp: '6:00 AM',
                    status: 'completed',
                    icon: <AlertTriangle className="w-4 h-4 text-green-600" />,
                  },
                  {
                    id: '3',
                    title: 'Route Optimization',
                    description: 'AI system analyzing optimal flight paths',
                    timestamp: '8:00 AM',
                    status: 'current',
                    icon: <Settings className="w-4 h-4 text-blue-600" />,
                  },
                  {
                    id: '4',
                    title: 'Crew Scheduling',
                    description: "Automated crew assignment for tomorrow's flights",
                    timestamp: '2:00 PM',
                    status: 'pending',
                    icon: <Users className="w-4 h-4 text-gray-600" />,
                  },
                  {
                    id: '5',
                    title: 'Maintenance Report',
                    description: 'Weekly maintenance summary report generation',
                    timestamp: 'Yesterday',
                    status: 'overdue',
                    icon: <FileText className="w-4 h-4 text-red-600" />,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Tracking */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Process Tracking
        </h2>
        <p className="text-muted-foreground mb-6">
          Timeline components for tracking multi-step processes and workflows
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flight Preparation Process */}
          <div className="space-y-4">
            <h4 className="font-medium">Flight Preparation Process</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Flight Plan Filed',
                  description: 'Route filed with air traffic control',
                  timestamp: '6:00 AM',
                  status: 'completed',
                },
                {
                  id: '2',
                  title: 'Weather Briefing',
                  description: 'Crew received weather and NOTAM briefing',
                  timestamp: '7:00 AM',
                  status: 'completed',
                },
                {
                  id: '3',
                  title: 'Aircraft Inspection',
                  description: 'Pre-flight inspection currently in progress',
                  timestamp: '8:00 AM',
                  status: 'current',
                },
                {
                  id: '4',
                  title: 'Fuel Loading',
                  description: 'Fuel loading scheduled to begin',
                  timestamp: '8:45 AM',
                  status: 'pending',
                },
                {
                  id: '5',
                  title: 'Passenger Boarding',
                  description: 'Boarding process to commence',
                  timestamp: '9:30 AM',
                  status: 'pending',
                },
              ]}
            />
          </div>

          {/* Incident Response Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">Emergency Response Protocol</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Alert Received',
                  description: 'Emergency signal received from aircraft',
                  timestamp: '14:32',
                  status: 'completed',
                  icon: <AlertTriangle className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '2',
                  title: 'Emergency Services Notified',
                  description: 'Airport emergency services dispatched',
                  timestamp: '14:33',
                  status: 'completed',
                  icon: <Users className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Communication Established',
                  description: 'Direct contact with flight crew established',
                  timestamp: '14:35',
                  status: 'completed',
                  icon: <Settings className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '4',
                  title: 'Emergency Landing',
                  description: 'Aircraft executing emergency landing procedures',
                  timestamp: '14:45',
                  status: 'current',
                  icon: <Plane className="w-4 h-4 text-blue-600" />,
                },
                {
                  id: '5',
                  title: 'Ground Response',
                  description: 'Emergency vehicles standing by at runway',
                  timestamp: '14:50',
                  status: 'pending',
                  icon: <Clock className="w-4 h-4 text-gray-600" />,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Compact Timeline Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Compact Timeline Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Simplified timelines for quick status updates and recent activity
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">RECENT ACTIVITY</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'System Login',
                  timestamp: '2 min ago',
                  status: 'completed',
                },
                {
                  id: '2',
                  title: 'Data Sync',
                  timestamp: 'Now',
                  status: 'current',
                },
                {
                  id: '3',
                  title: 'Report Generation',
                  timestamp: 'In 5 min',
                  status: 'pending',
                },
              ]}
            />
          </div>

          {/* Quick Status */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">QUICK STATUS</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Pre-flight Check',
                  timestamp: 'Complete',
                  status: 'completed',
                },
                {
                  id: '2',
                  title: 'Boarding',
                  timestamp: 'Active',
                  status: 'current',
                },
                {
                  id: '3',
                  title: 'Departure',
                  timestamp: 'Pending',
                  status: 'pending',
                },
              ]}
            />
          </div>

          {/* Alert Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">ALERT TIMELINE</h4>
            <Timeline
              items={[
                {
                  id: '1',
                  title: 'Normal Operations',
                  timestamp: '8:00 AM',
                  status: 'completed',
                },
                {
                  id: '2',
                  title: 'Warning Issued',
                  timestamp: '10:30 AM',
                  status: 'completed',
                  icon: <AlertTriangle className="w-4 h-4 text-green-600" />,
                },
                {
                  id: '3',
                  title: 'Investigation',
                  timestamp: 'Now',
                  status: 'current',
                },
                {
                  id: '4',
                  title: 'Resolution',
                  timestamp: 'Overdue',
                  status: 'overdue',
                },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available Timeline component configurations in the Fleet AI design system.',
      },
    },
  },
};
