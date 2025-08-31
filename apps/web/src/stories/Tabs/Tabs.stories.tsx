import { TabsContent } from '@/components/ui/tabs';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  BarChart3,
  Calendar,
  FileText,
  MapPin,
  Plane,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { ModernInput, ModernSelect, ModernSwitch, ModernTextarea } from '../Form/Form';
import { KeyValuePair } from '../Utilities/KeyValuePair';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A modern tabs component for organizing content into separate views. Features smooth transitions, keyboard navigation, and consistent styling for Fleet AI applications.',
      },
    },
  },
  argTypes: {
    selectedTab: {
      control: 'select',
      options: ['tab1', 'tab2', 'tab3'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Overview with different tab configurations
export const Overview: Story = {
  render: () => {
    const [selectedTab1, setSelectedTab1] = useState('overview');
    const [selectedTab2, setSelectedTab2] = useState('flights');
    const [selectedTab3, setSelectedTab3] = useState('basic');

    return (
      <div className="space-y-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Tabs Component Overview</h1>
          <p className="text-muted-foreground">
            Flexible tabs for organizing content in Fleet AI applications
          </p>
        </div>

        {/* Basic Tabs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Tabs</h2>
          <Tabs
            tabs={[
              { label: 'Overview', value: 'overview' },
              { label: 'Details', value: 'details' },
              { label: 'Settings', value: 'settings' },
            ]}
            selectedTab={selectedTab1}
            onTabChange={setSelectedTab1}
          >
            <TabsContent value="overview" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">Overview Content</h3>
                <p className="text-muted-foreground">
                  This is the overview tab content. It provides a high-level summary of the
                  information.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">Detailed Information</h3>
                <p className="text-muted-foreground">
                  This tab contains detailed information and specifications.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">Configuration Settings</h3>
                <p className="text-muted-foreground">
                  This tab allows users to modify settings and preferences.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Many Tabs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Multiple Tabs</h2>
          <Tabs
            tabs={[
              { label: 'Flights', value: 'flights' },
              { label: 'Aircraft', value: 'aircraft' },
              { label: 'Pilots', value: 'pilots' },
              { label: 'Routes', value: 'routes' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Reports', value: 'reports' },
            ]}
            selectedTab={selectedTab2}
            onTabChange={setSelectedTab2}
          >
            <TabsContent value="flights" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Flight Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Manage flight schedules, bookings, and real-time status updates.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="aircraft" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Aircraft Fleet</h3>
                </div>
                <p className="text-muted-foreground">
                  View and manage your aircraft fleet, specifications, and availability.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="pilots" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Pilot Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Manage pilot schedules, certifications, and assignments.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="routes" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">Route Planning</h3>
                </div>
                <p className="text-muted-foreground">
                  Optimize flight routes, manage airports, and track performance.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="maintenance" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold">Maintenance Tracking</h3>
                </div>
                <p className="text-muted-foreground">
                  Schedule and track aircraft maintenance, inspections, and repairs.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold">Analytics & Reports</h3>
                </div>
                <p className="text-muted-foreground">
                  Generate detailed reports and analyze fleet performance metrics.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Different Tab Lengths */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Variable Length Tabs</h2>
          <Tabs
            tabs={[
              { label: 'Basic', value: 'basic' },
              { label: 'Advanced Configuration', value: 'advanced' },
              { label: 'API', value: 'api' },
            ]}
            selectedTab={selectedTab3}
            onTabChange={setSelectedTab3}
          >
            <TabsContent value="basic" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">Basic Configuration</h3>
                <p className="text-muted-foreground">
                  Simple settings for getting started quickly.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">Advanced Configuration Options</h3>
                <p className="text-muted-foreground">
                  Detailed configuration options for power users and complex scenarios.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="api" className="mt-6">
              <div className="p-6 border rounded-xl bg-white">
                <h3 className="font-semibold mb-4">API Integration</h3>
                <p className="text-muted-foreground">
                  API endpoints and integration documentation.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Overview of tabs component with different configurations and realistic Fleet AI content.',
      },
    },
  },
};

// Aircraft Management Dashboard
export const AircraftDashboard: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState('details');

    return (
      <div className="max-w-6xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Aircraft N123FA - Boeing 737-800</h2>
          <p className="text-muted-foreground">Comprehensive aircraft management dashboard</p>
        </div>

        <Tabs
          tabs={[
            { label: 'Aircraft Details', value: 'details' },
            { label: 'Flight History', value: 'flights' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Performance', value: 'performance' },
            { label: 'Documents', value: 'documents' },
          ]}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        >
          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Aircraft Specifications
                </h3>
                <div className="space-y-0">
                  <KeyValuePair label="Registration" value="N123FA" valueType="string" />
                  <KeyValuePair label="Model" value="Boeing 737-800" valueType="string" />
                  <KeyValuePair label="Year" value={2018} valueType="number" />
                  <KeyValuePair label="Capacity" value={189} valueType="number" />
                  <KeyValuePair label="Range (nm)" value={3383} valueType="number" />
                  <KeyValuePair label="Max Speed (knots)" value={544} valueType="number" />
                  <KeyValuePair label="Service Ceiling (ft)" value={41000} valueType="number" />
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  Current Status
                </h3>
                <div className="space-y-0">
                  <KeyValuePair label="Status" value="Active" valueType="string" />
                  <KeyValuePair label="Location" value="JFK Airport" valueType="string" />
                  <KeyValuePair label="Flight Hours" value={12450} valueType="number" />
                  <KeyValuePair label="Cycles" value={8750} valueType="number" />
                  <KeyValuePair label="Last Flight" value="2024-01-14" valueType="date" />
                  <KeyValuePair label="Next Maintenance" value="2024-02-15" valueType="date" />
                  <KeyValuePair label="Airworthy" value={true} valueType="boolean" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flights" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Flights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    flight: 'FL-1234',
                    route: 'JFK → LAX',
                    date: '2024-01-14',
                    status: 'Completed',
                  },
                  {
                    flight: 'FL-1235',
                    route: 'LAX → ORD',
                    date: '2024-01-13',
                    status: 'Completed',
                  },
                  {
                    flight: 'FL-1236',
                    route: 'ORD → MIA',
                    date: '2024-01-12',
                    status: 'Completed',
                  },
                  {
                    flight: 'FL-1237',
                    route: 'MIA → JFK',
                    date: '2024-01-11',
                    status: 'Completed',
                  },
                  {
                    flight: 'FL-1238',
                    route: 'JFK → SFO',
                    date: '2024-01-10',
                    status: 'Completed',
                  },
                  {
                    flight: 'FL-1239',
                    route: 'SFO → SEA',
                    date: '2024-01-09',
                    status: 'Completed',
                  },
                ].map((flight, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-0 text-sm">
                      <KeyValuePair label="Flight" value={flight.flight} valueType="string" />
                      <KeyValuePair label="Route" value={flight.route} valueType="string" />
                      <KeyValuePair label="Date" value={flight.date} valueType="date" />
                      <KeyValuePair label="Status" value={flight.status} valueType="string" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="mt-6">
            <div className="space-y-6">
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-red-600" />
                  Upcoming Maintenance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-0">
                    <KeyValuePair label="Type" value="A-Check Inspection" valueType="string" />
                    <KeyValuePair label="Due Date" value="2024-02-15" valueType="date" />
                    <KeyValuePair label="Estimated Hours" value={24} valueType="number" />
                    <KeyValuePair label="Location" value="JFK Hangar 5" valueType="string" />
                    <KeyValuePair label="Technician" value="tech@fleetai.com" valueType="email" />
                  </div>
                  <div className="space-y-0">
                    <KeyValuePair label="Parts Required" value={true} valueType="boolean" />
                    <KeyValuePair label="Ground Time (days)" value={2} valueType="number" />
                    <KeyValuePair label="Cost Estimate" value="$15,000" valueType="string" />
                    <KeyValuePair label="Priority" value="Medium" valueType="string" />
                    <KeyValuePair label="Scheduled" value={true} valueType="boolean" />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-4">Maintenance History</h3>
                <div className="space-y-4">
                  {[
                    { date: '2024-01-01', type: 'Routine Inspection', status: 'Completed' },
                    { date: '2023-12-15', type: 'Engine Service', status: 'Completed' },
                    { date: '2023-11-30', type: 'Tire Replacement', status: 'Completed' },
                  ].map((record, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <KeyValuePair label="Date" value={record.date} valueType="date" />
                        <KeyValuePair label="Type" value={record.type} valueType="string" />
                        <KeyValuePair label="Status" value={record.status} valueType="string" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-0">
                  <KeyValuePair label="Fuel Efficiency" value="3.2 gal/nm" valueType="string" />
                  <KeyValuePair label="On-Time Performance" value="94.5%" valueType="string" />
                  <KeyValuePair label="Load Factor" value="87.2%" valueType="string" />
                  <KeyValuePair label="Dispatch Reliability" value="99.1%" valueType="string" />
                </div>
                <div className="space-y-0">
                  <KeyValuePair label="Monthly Flights" value={45} valueType="number" />
                  <KeyValuePair label="Total Passengers" value={8505} valueType="number" />
                  <KeyValuePair label="Revenue Hours" value={156.5} valueType="number" />
                  <KeyValuePair label="Utilization Rate" value="89.3%" valueType="string" />
                </div>
                <div className="space-y-0">
                  <KeyValuePair label="Maintenance Ratio" value="0.02%" valueType="string" />
                  <KeyValuePair label="Cost per Hour" value="$2,450" valueType="string" />
                  <KeyValuePair label="Revenue per Hour" value="$4,200" valueType="string" />
                  <KeyValuePair label="Profit Margin" value="41.7%" valueType="string" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Aircraft Documentation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Certificates & Licenses</h4>
                  <div className="space-y-0 text-sm">
                    <KeyValuePair
                      label="Airworthiness Certificate"
                      value="Valid"
                      valueType="string"
                    />
                    <KeyValuePair
                      label="Registration Certificate"
                      value="Valid"
                      valueType="string"
                    />
                    <KeyValuePair label="Insurance Certificate" value="Valid" valueType="string" />
                    <KeyValuePair label="Noise Certificate" value="Valid" valueType="string" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Maintenance Records</h4>
                  <div className="space-y-0 text-sm">
                    <KeyValuePair label="Maintenance Manual" value="Current" valueType="string" />
                    <KeyValuePair label="Service Bulletins" value="Up to Date" valueType="string" />
                    <KeyValuePair label="AD Compliance" value="Current" valueType="string" />
                    <KeyValuePair label="Weight & Balance" value="Current" valueType="string" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Real-world aircraft management dashboard showcasing complex tabbed content with forms and data display.',
      },
    },
  },
};

// Settings and Configuration
export const SettingsConfiguration: Story = {
  render: () => {
    const [selectedTab, setSelectedTab] = useState('general');
    const [formData, setFormData] = useState({
      companyName: 'Fleet AI Corporation',
      email: 'admin@fleetai.com',
      timezone: 'UTC',
      notifications: true,
      autoBackup: true,
    });

    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">System Configuration</h2>
          <p className="text-muted-foreground">
            Manage your Fleet AI system settings and preferences
          </p>
        </div>

        <Tabs
          tabs={[
            { label: 'General', value: 'general' },
            { label: 'Notifications', value: 'notifications' },
            { label: 'Security', value: 'security' },
            { label: 'Integrations', value: 'integrations' },
            { label: 'Backup', value: 'backup' },
          ]}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        >
          <TabsContent value="general" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-6">General Settings</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <ModernInput
                      value={formData.companyName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Email</label>
                    <ModernInput
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Timezone</label>
                    <ModernSelect
                      value={formData.timezone}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, timezone: value })
                      }
                      options={[
                        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                        { value: 'EST', label: 'EST (Eastern Standard Time)' },
                        { value: 'PST', label: 'PST (Pacific Standard Time)' },
                        { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <ModernSelect
                      value="en"
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Spanish' },
                        { value: 'fr', label: 'French' },
                        { value: 'de', label: 'German' },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Description</label>
                  <ModernTextarea
                    placeholder="Brief description of your aviation company..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <ModernSwitch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Flight Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified of flight status changes
                    </p>
                  </div>
                  <ModernSwitch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Maintenance Reminders</h4>
                    <p className="text-sm text-muted-foreground">Alerts for upcoming maintenance</p>
                  </div>
                  <ModernSwitch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Emergency Notifications</h4>
                    <p className="text-sm text-muted-foreground">Critical system alerts</p>
                  </div>
                  <ModernSwitch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated weekly summary reports
                    </p>
                  </div>
                  <ModernSwitch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add extra security to your account
                      </p>
                    </div>
                    <ModernSwitch />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <ModernSwitch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">IP Restrictions</h4>
                      <p className="text-sm text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <ModernSwitch />
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-semibold mb-4">Password Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Length</label>
                    <ModernSelect
                      value="8"
                      options={[
                        { value: '6', label: '6 characters' },
                        { value: '8', label: '8 characters' },
                        { value: '10', label: '10 characters' },
                        { value: '12', label: '12 characters' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password Expiry</label>
                    <ModernSelect
                      value="90"
                      options={[
                        { value: '30', label: '30 days' },
                        { value: '60', label: '60 days' },
                        { value: '90', label: '90 days' },
                        { value: 'never', label: 'Never' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-6">Third-Party Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Weather Services</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Aviation Weather Center</span>
                      <ModernSwitch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">AccuWeather API</span>
                      <ModernSwitch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Flight Tracking</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">FlightAware</span>
                      <ModernSwitch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Flightradar24</span>
                      <ModernSwitch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Maintenance Systems</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Boeing MCS</span>
                      <ModernSwitch />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Airbus Skywise</span>
                      <ModernSwitch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Financial Systems</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">QuickBooks</span>
                      <ModernSwitch />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">SAP</span>
                      <ModernSwitch />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="mt-6">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-semibold mb-6">Backup & Recovery</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground">Enable scheduled data backups</p>
                  </div>
                  <ModernSwitch
                    checked={formData.autoBackup}
                    onCheckedChange={(checked: boolean) =>
                      setFormData({ ...formData, autoBackup: checked })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <ModernSelect
                      value="daily"
                      options={[
                        { value: 'hourly', label: 'Every Hour' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retention Period</label>
                    <ModernSelect
                      value="30"
                      options={[
                        { value: '7', label: '7 days' },
                        { value: '30', label: '30 days' },
                        { value: '90', label: '90 days' },
                        { value: '365', label: '1 year' },
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Location</label>
                  <ModernSelect
                    value="cloud"
                    options={[
                      { value: 'cloud', label: 'Cloud Storage (AWS S3)' },
                      { value: 'local', label: 'Local Server' },
                      { value: 'both', label: 'Both Cloud and Local' },
                    ]}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-900">Last Backup</h4>
                      <p className="text-sm text-blue-700">January 15, 2024 at 3:00 AM UTC</p>
                      <p className="text-sm text-blue-700">Size: 2.4 GB | Duration: 45 minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complex settings and configuration interface demonstrating tabs with forms, toggles, and structured content.',
      },
    },
  },
};

// Interactive Controls
export const Interactive: Story = {
  args: {
    tabs: [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
      { label: 'Tab 3', value: 'tab3' },
    ],
    selectedTab: 'tab1',
    onTabChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive tabs with controls for testing different configurations.',
      },
    },
  },
};
