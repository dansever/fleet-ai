import { TabsContent } from '@/components/ui/tabs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BarChart3, Calendar, FileText, Globe, MapPin, Plane, Settings, Users } from 'lucide-react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible tabs component for organizing content into sections. Perfect for dashboards, forms, and navigation in Fleet AI applications.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Comprehensive Tabs Showcase - All variants in one story
export const AllTabsVariants: Story = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI Tabs Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of tabs component configurations and usage patterns
        </p>
      </div>

      {/* Basic Tabs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Basic Tabs
        </h2>
        <p className="text-muted-foreground mb-6">
          Simple tab navigation with different numbers of tabs
        </p>

        <div className="space-y-8">
          {/* Two Tabs */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">TWO TABS</h4>
            <Tabs
              tabs={[
                { label: 'Overview', value: 'overview' },
                { label: 'Details', value: 'details' },
              ]}
              selectedTab="overview"
              onTabChange={() => {}}
            >
              <TabsContent value="overview" className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Overview Content</h3>
                <p className="text-muted-foreground">
                  High-level information and key metrics displayed here.
                </p>
              </TabsContent>
              <TabsContent value="details" className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Details Content</h3>
                <p className="text-muted-foreground">
                  Detailed information and comprehensive data shown here.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Three Tabs */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">THREE TABS</h4>
            <Tabs
              tabs={[
                { label: 'Dashboard', value: 'dashboard' },
                { label: 'Analytics', value: 'analytics' },
                { label: 'Settings', value: 'settings' },
              ]}
              selectedTab="dashboard"
              onTabChange={() => {}}
            >
              <TabsContent value="dashboard" className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Dashboard</h3>
                <p className="text-muted-foreground">
                  Main dashboard with key performance indicators and quick actions.
                </p>
              </TabsContent>
              <TabsContent value="analytics" className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting tools for data analysis.
                </p>
              </TabsContent>
              <TabsContent value="settings" className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground">
                  Configuration options and system preferences.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Four Tabs */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">FOUR TABS</h4>
            <Tabs
              tabs={[
                { label: 'Fleet', value: 'fleet' },
                { label: 'Routes', value: 'routes' },
                { label: 'Crew', value: 'crew' },
                { label: 'Reports', value: 'reports' },
              ]}
              selectedTab="fleet"
              onTabChange={() => {}}
            >
              <TabsContent value="fleet" className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Fleet Management</h3>
                <p className="text-muted-foreground">
                  Aircraft inventory, maintenance schedules, and fleet status overview.
                </p>
              </TabsContent>
              <TabsContent value="routes" className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Route Planning</h3>
                <p className="text-muted-foreground">
                  Flight routes, scheduling, and optimization tools.
                </p>
              </TabsContent>
              <TabsContent value="crew" className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Crew Management</h3>
                <p className="text-muted-foreground">
                  Staff scheduling, certifications, and crew assignments.
                </p>
              </TabsContent>
              <TabsContent value="reports" className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">Reports & Analytics</h3>
                <p className="text-muted-foreground">
                  Performance reports, compliance documents, and data insights.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Five Tabs */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">FIVE TABS</h4>
            <Tabs
              tabs={[
                { label: 'Operations', value: 'operations' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Finance', value: 'finance' },
                { label: 'Safety', value: 'safety' },
                { label: 'Admin', value: 'admin' },
              ]}
              selectedTab="operations"
              onTabChange={() => {}}
            >
              <TabsContent value="operations" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Operations Center</h3>
                <p className="text-muted-foreground">
                  Daily operations, flight monitoring, and operational coordination.
                </p>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Maintenance Hub</h3>
                <p className="text-muted-foreground">
                  Aircraft maintenance tracking, scheduling, and compliance management.
                </p>
              </TabsContent>
              <TabsContent value="finance" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Financial Management</h3>
                <p className="text-muted-foreground">
                  Budget tracking, cost analysis, and financial reporting tools.
                </p>
              </TabsContent>
              <TabsContent value="safety" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Safety & Compliance</h3>
                <p className="text-muted-foreground">
                  Safety protocols, incident reporting, and regulatory compliance.
                </p>
              </TabsContent>
              <TabsContent value="admin" className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Administration</h3>
                <p className="text-muted-foreground">
                  System administration, user management, and configuration settings.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Fleet AI Application Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Fleet AI Application Examples
        </h2>
        <p className="text-muted-foreground mb-6">
          Real-world tab usage in fleet management scenarios
        </p>

        <div className="space-y-8">
          {/* Aircraft Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Aircraft Details View</h4>
            <Tabs
              tabs={[
                { label: 'General Info', value: 'general' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Flight History', value: 'history' },
                { label: 'Documentation', value: 'docs' },
              ]}
              selectedTab="general"
              onTabChange={() => {}}
            >
              <TabsContent value="general" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Plane className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Boeing 737-800 - N12345</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Model:</strong> Boeing 737-800
                  </div>
                  <div>
                    <strong>Registration:</strong> N12345
                  </div>
                  <div>
                    <strong>Capacity:</strong> 189 passengers
                  </div>
                  <div>
                    <strong>Status:</strong> <span className="text-green-600">Active</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-lg">Maintenance Schedule</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Next A-Check:</span> <span>March 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last C-Check:</span> <span>January 10, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours Since Last:</span> <span>245.5 hrs</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="history" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-lg">Flight History</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Flights:</span> <span>1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hours:</span> <span>3,892.5 hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Flight:</span> <span>JFK → LAX</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="docs" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-gray-600" />
                  <h3 className="font-semibold text-lg">Documentation</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• Airworthiness Certificate</div>
                  <div>• Registration Certificate</div>
                  <div>• Maintenance Manuals</div>
                  <div>• Service Bulletins</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Route Management */}
          <div className="space-y-4">
            <h4 className="font-medium">Route Management Dashboard</h4>
            <Tabs
              tabs={[
                { label: 'Active Routes', value: 'active' },
                { label: 'Schedule', value: 'schedule' },
                { label: 'Performance', value: 'performance' },
              ]}
              selectedTab="active"
              onTabChange={() => {}}
            >
              <TabsContent value="active" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-lg">Active Routes Today</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">JFK → LAX</span>
                    <span className="text-green-600 text-sm">On Time</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">ORD → MIA</span>
                    <span className="text-blue-600 text-sm">In Flight</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="font-medium">DEN → SEA</span>
                    <span className="text-yellow-600 text-sm">Delayed</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Weekly Schedule</h3>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  <div className="font-medium">Mon</div>
                  <div className="font-medium">Tue</div>
                  <div className="font-medium">Wed</div>
                  <div className="font-medium">Thu</div>
                  <div className="font-medium">Fri</div>
                  <div className="font-medium">Sat</div>
                  <div className="font-medium">Sun</div>
                  <div className="p-2 bg-blue-100 rounded">24</div>
                  <div className="p-2 bg-green-100 rounded">28</div>
                  <div className="p-2 bg-blue-100 rounded">26</div>
                  <div className="p-2 bg-green-100 rounded">30</div>
                  <div className="p-2 bg-blue-100 rounded">25</div>
                  <div className="p-2 bg-yellow-100 rounded">18</div>
                  <div className="p-2 bg-yellow-100 rounded">16</div>
                </div>
              </TabsContent>
              <TabsContent value="performance" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-lg">Route Performance</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">94.2%</div>
                    <div className="text-sm text-muted-foreground">On-Time Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">87.5%</div>
                    <div className="text-sm text-muted-foreground">Load Factor</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">$2.4M</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Crew Management */}
          <div className="space-y-4">
            <h4 className="font-medium">Crew Management System</h4>
            <Tabs
              tabs={[
                { label: 'Pilots', value: 'pilots' },
                { label: 'Cabin Crew', value: 'cabin' },
                { label: 'Ground Staff', value: 'ground' },
                { label: 'Schedules', value: 'schedules' },
                { label: 'Training', value: 'training' },
              ]}
              selectedTab="pilots"
              onTabChange={() => {}}
            >
              <TabsContent value="pilots" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Pilot Roster</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Captain Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">Boeing 737 Type Rating</div>
                    </div>
                    <span className="text-green-600 text-sm">Available</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">First Officer Mike Chen</div>
                      <div className="text-sm text-muted-foreground">Boeing 737/Airbus A320</div>
                    </div>
                    <span className="text-blue-600 text-sm">On Duty</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Captain Alex Rodriguez</div>
                      <div className="text-sm text-muted-foreground">Boeing 777 Type Rating</div>
                    </div>
                    <span className="text-yellow-600 text-sm">Rest Period</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="cabin" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h3 className="font-semibold text-lg">Cabin Crew</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Flight Attendants</h5>
                    <div className="text-sm space-y-1">
                      <div>• Emma Thompson - Senior FA</div>
                      <div>• David Kim - FA</div>
                      <div>• Lisa Wang - FA</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Purser Staff</h5>
                    <div className="text-sm space-y-1">
                      <div>• James Wilson - Chief Purser</div>
                      <div>• Maria Garcia - Purser</div>
                      <div>• Tom Anderson - Purser</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ground" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-lg">Ground Operations</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">Maintenance</h5>
                    <div>12 Technicians</div>
                    <div>3 Supervisors</div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Ground Handling</h5>
                    <div>18 Handlers</div>
                    <div>2 Coordinators</div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Customer Service</h5>
                    <div>8 Agents</div>
                    <div>1 Supervisor</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="schedules" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-lg">Weekly Schedules</h3>
                </div>
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Schedule management interface would be displayed here</p>
                  <p className="text-sm">
                    Including shift assignments, time-off requests, and availability tracking
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="training" className="mt-4 p-6 bg-white border rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-red-600" />
                  <h3 className="font-semibold text-lg">Training & Certifications</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium">Emergency Procedures Training</div>
                    <div className="text-sm text-muted-foreground">
                      Due: March 2024 • 45 staff certified
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium">Security Awareness Training</div>
                    <div className="text-sm text-muted-foreground">
                      Due: February 2024 • 12 staff pending
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium">Customer Service Excellence</div>
                    <div className="text-sm text-muted-foreground">
                      Completed: January 2024 • 38 staff certified
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Layout Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Layout Variations
        </h2>
        <p className="text-muted-foreground mb-6">
          Different ways to structure and organize tab content
        </p>

        <div className="space-y-8">
          {/* Compact Layout */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">COMPACT LAYOUT</h4>
            <div className="max-w-md">
              <Tabs
                tabs={[
                  { label: 'Info', value: 'info' },
                  { label: 'Stats', value: 'stats' },
                ]}
                selectedTab="info"
                onTabChange={() => {}}
              >
                <TabsContent value="info" className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <p>Compact information display for smaller interfaces and mobile views.</p>
                </TabsContent>
                <TabsContent value="stats" className="mt-4 p-3 bg-gray-50 rounded text-sm">
                  <p>Key statistics in a condensed format.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Full Width Layout */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">FULL WIDTH LAYOUT</h4>
            <Tabs
              tabs={[
                { label: 'Fleet Overview', value: 'overview' },
                { label: 'Performance Metrics', value: 'metrics' },
                { label: 'Operational Status', value: 'status' },
              ]}
              selectedTab="overview"
              onTabChange={() => {}}
              className="w-full"
            >
              <TabsContent
                value="overview"
                className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">247</div>
                    <div className="text-muted-foreground">Total Aircraft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">94.2%</div>
                    <div className="text-muted-foreground">Fleet Availability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">1,247</div>
                    <div className="text-muted-foreground">Daily Flights</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="metrics"
                className="mt-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600">$2.4M</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">87.5%</div>
                    <div className="text-sm text-muted-foreground">Load Factor</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600">3.2hrs</div>
                    <div className="text-sm text-muted-foreground">Avg Flight</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-600">98.1%</div>
                    <div className="text-sm text-muted-foreground">On-Time</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent
                value="status"
                className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Active Operations</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Flights in Air:</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ground Operations:</span>
                        <span className="font-medium">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance:</span>
                        <span className="font-medium">7</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-3">System Status</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>All Systems:</span>
                        <span className="text-green-600 font-medium">Operational</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="font-medium">2 min ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Users:</span>
                        <span className="font-medium">1,247</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available tabs component configurations in the Fleet AI design system.',
      },
    },
  },
};
