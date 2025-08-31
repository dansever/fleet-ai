import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KeyValuePair } from './KeyValuePair';

const meta: Meta<typeof KeyValuePair> = {
  title: 'Components/KeyValuePair',
  component: KeyValuePair,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible utility component for displaying structured key-value information with support for different data types and edit modes. Perfect for forms, details views, and data display in Fleet AI applications.',
      },
    },
  },
  argTypes: {
    valueType: {
      control: 'select',
      options: ['string', 'number', 'boolean', 'date', 'select', 'email', 'null'],
    },
    editMode: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof KeyValuePair>;

// Comprehensive KeyValuePair Showcase - All variants in one story
export const AllKeyValuePairVariants: Story = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI KeyValuePair Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of structured data display and editing capabilities
        </p>
      </div>

      {/* Value Types - Display Mode */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Value Types - Display Mode
        </h2>
        <p className="text-muted-foreground mb-6">
          Different data types with appropriate formatting and display styles
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">STRING VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Aircraft Model" value="Boeing 737-800" valueType="string" />
              <KeyValuePair label="Registration" value="N12345AB" valueType="string" />
              <KeyValuePair label="Operator" value="Fleet AI Airlines" valueType="string" />
              <KeyValuePair
                label="Home Base"
                value="John F. Kennedy International Airport"
                valueType="string"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">NUMBER VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Passenger Capacity" value={189} valueType="number" />
              <KeyValuePair label="Flight Hours" value={3892.5} valueType="number" />
              <KeyValuePair label="Maximum Range" value={3383} valueType="number" />
              <KeyValuePair label="Service Ceiling" value={41000} valueType="number" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">BOOLEAN VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Wi-Fi Available" value={true} valueType="boolean" />
              <KeyValuePair label="ETOPS Certified" value={true} valueType="boolean" />
              <KeyValuePair label="Cargo Only" value={false} valueType="boolean" />
              <KeyValuePair label="Maintenance Due" value={false} valueType="boolean" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">DATE VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Last Maintenance" value="2024-01-15" valueType="date" />
              <KeyValuePair label="Next Inspection" value="2024-03-20" valueType="date" />
              <KeyValuePair label="Delivery Date" value="2019-06-12" valueType="date" />
              <KeyValuePair label="Last Flight" value="2024-02-01" valueType="date" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SELECT VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Status"
                value="operational"
                valueType="select"
                selectOptions={[
                  { value: 'operational', label: 'Operational' },
                  { value: 'maintenance', label: 'In Maintenance' },
                  { value: 'grounded', label: 'Grounded' },
                ]}
              />
              <KeyValuePair
                label="Priority Level"
                value="high"
                valueType="select"
                selectOptions={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' },
                ]}
              />
              <KeyValuePair
                label="Aircraft Type"
                value="narrow_body"
                valueType="select"
                selectOptions={[
                  { value: 'narrow_body', label: 'Narrow Body' },
                  { value: 'wide_body', label: 'Wide Body' },
                  { value: 'regional', label: 'Regional' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">EMAIL VALUES</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Maintenance Contact"
                value="maintenance@fleetai.com"
                valueType="email"
              />
              <KeyValuePair
                label="Operations Manager"
                value="ops.manager@fleetai.com"
                valueType="email"
              />
              <KeyValuePair label="Safety Officer" value="safety@fleetai.com" valueType="email" />
              <KeyValuePair label="Support Email" value="support@fleetai.com" valueType="email" />
            </div>
          </div>
        </div>
      </section>

      {/* Edit Mode */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Edit Mode
        </h2>
        <p className="text-muted-foreground mb-6">
          Interactive editing capabilities for different data types
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">STRING & TEXT EDITING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Aircraft Notes"
                value="Routine maintenance completed. All systems operational."
                valueType="string"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Pilot Comments"
                value="Smooth flight operations. No issues reported."
                valueType="string"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Contact Email"
                value="captain.johnson@fleetai.com"
                valueType="email"
                editMode={true}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">NUMBER EDITING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Flight Hours"
                value={3892.5}
                valueType="number"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Passenger Count"
                value={156}
                valueType="number"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Fuel Quantity (lbs)"
                value={12450}
                valueType="number"
                editMode={true}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">BOOLEAN EDITING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Wi-Fi Enabled"
                value={true}
                valueType="boolean"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Maintenance Required"
                value={false}
                valueType="boolean"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Emergency Equipment Check"
                value={true}
                valueType="boolean"
                editMode={true}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">DATE EDITING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Next Maintenance"
                value="2024-03-15"
                valueType="date"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Inspection Due"
                value="2024-04-20"
                valueType="date"
                editMode={true}
                onChange={() => {}}
              />
              <KeyValuePair
                label="Certificate Expiry"
                value="2024-12-31"
                valueType="date"
                editMode={true}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">SELECT EDITING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair
                label="Aircraft Status"
                value="operational"
                valueType="select"
                editMode={true}
                onChange={() => {}}
                selectOptions={[
                  { value: 'operational', label: 'Operational' },
                  { value: 'maintenance', label: 'In Maintenance' },
                  { value: 'grounded', label: 'Grounded' },
                  { value: 'retired', label: 'Retired' },
                ]}
              />
              <KeyValuePair
                label="Priority Level"
                value="medium"
                valueType="select"
                editMode={true}
                onChange={() => {}}
                selectOptions={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'critical', label: 'Critical Priority' },
                ]}
              />
            </div>
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
          {/* Aircraft Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Aircraft Information</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Registration" value="N737BA" valueType="string" />
              <KeyValuePair label="Aircraft Type" value="Boeing 737-800" valueType="string" />
              <KeyValuePair label="Manufacturer" value="Boeing" valueType="string" />
              <KeyValuePair label="Year Built" value={2019} valueType="number" />
              <KeyValuePair label="Total Flight Hours" value={4250.75} valueType="number" />
              <KeyValuePair label="Passenger Capacity" value={189} valueType="number" />
              <KeyValuePair label="ETOPS Certified" value={true} valueType="boolean" />
              <KeyValuePair label="Wi-Fi Available" value={true} valueType="boolean" />
              <KeyValuePair label="Last Maintenance" value="2024-01-15" valueType="date" />
              <KeyValuePair label="Next C-Check" value="2024-06-20" valueType="date" />
            </div>
          </div>

          {/* Flight Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Flight Details</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Flight Number" value="FA 1247" valueType="string" />
              <KeyValuePair label="Route" value="JFK → LAX" valueType="string" />
              <KeyValuePair label="Departure Time" value="2024-02-15 08:30" valueType="string" />
              <KeyValuePair label="Arrival Time" value="2024-02-15 11:45" valueType="string" />
              <KeyValuePair label="Flight Duration" value={375} valueType="number" />
              <KeyValuePair label="Distance (nm)" value={2475} valueType="number" />
              <KeyValuePair label="Passengers Boarded" value={156} valueType="number" />
              <KeyValuePair label="Load Factor" value={82.5} valueType="number" />
              <KeyValuePair label="On-Time Departure" value={true} valueType="boolean" />
              <KeyValuePair label="Weather Delay" value={false} valueType="boolean" />
            </div>
          </div>

          {/* Maintenance Record */}
          <div className="space-y-4">
            <h4 className="font-medium">Maintenance Status</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Work Order" value="MX-2024-0156" valueType="string" />
              <KeyValuePair
                label="Status"
                value="completed"
                valueType="select"
                selectOptions={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'deferred', label: 'Deferred' },
                ]}
              />
              <KeyValuePair
                label="Priority"
                value="high"
                valueType="select"
                selectOptions={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
              />
              <KeyValuePair label="Technician" value="Mike Rodriguez" valueType="string" />
              <KeyValuePair label="Estimated Hours" value={8.5} valueType="number" />
              <KeyValuePair label="Actual Hours" value={7.25} valueType="number" />
              <KeyValuePair label="Parts Required" value={true} valueType="boolean" />
              <KeyValuePair label="External Vendor" value={false} valueType="boolean" />
              <KeyValuePair label="Scheduled Date" value="2024-02-20" valueType="date" />
              <KeyValuePair label="Completed Date" value="2024-02-19" valueType="date" />
            </div>
          </div>

          {/* Crew Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Crew Details</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Captain" value="Sarah Johnson" valueType="string" />
              <KeyValuePair label="First Officer" value="Alex Chen" valueType="string" />
              <KeyValuePair label="Senior FA" value="Emma Thompson" valueType="string" />
              <KeyValuePair label="Captain Email" value="s.johnson@fleetai.com" valueType="email" />
              <KeyValuePair label="FO Email" value="a.chen@fleetai.com" valueType="email" />
              <KeyValuePair label="Total Flight Hours" value={12450} valueType="number" />
              <KeyValuePair label="Hours This Month" value={87.5} valueType="number" />
              <KeyValuePair label="Type Rating Valid" value={true} valueType="boolean" />
              <KeyValuePair label="Medical Current" value={true} valueType="boolean" />
              <KeyValuePair label="Next Training" value="2024-04-15" valueType="date" />
              <KeyValuePair label="License Expiry" value="2025-08-30" valueType="date" />
            </div>
          </div>

          {/* Route Performance */}
          <div className="space-y-4">
            <h4 className="font-medium">Route Analytics</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Route Code" value="JFK-LAX-001" valueType="string" />
              <KeyValuePair label="Average Load Factor" value={84.2} valueType="number" />
              <KeyValuePair label="On-Time Performance" value={92.5} valueType="number" />
              <KeyValuePair label="Average Delay (min)" value={12.3} valueType="number" />
              <KeyValuePair label="Monthly Flights" value={124} valueType="number" />
              <KeyValuePair label="Revenue per Flight" value={18750} valueType="number" />
              <KeyValuePair label="Profitable Route" value={true} valueType="boolean" />
              <KeyValuePair label="Seasonal Route" value={false} valueType="boolean" />
              <KeyValuePair label="Last Analysis" value="2024-02-01" valueType="date" />
              <KeyValuePair label="Next Review" value="2024-03-01" valueType="date" />
            </div>
          </div>

          {/* Safety Report */}
          <div className="space-y-4">
            <h4 className="font-medium">Safety & Compliance</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-white">
              <KeyValuePair label="Incident Report" value="SR-2024-0089" valueType="string" />
              <KeyValuePair
                label="Severity Level"
                value="minor"
                valueType="select"
                selectOptions={[
                  { value: 'minor', label: 'Minor' },
                  { value: 'major', label: 'Major' },
                  { value: 'serious', label: 'Serious' },
                  { value: 'accident', label: 'Accident' },
                ]}
              />
              <KeyValuePair label="Reporter" value="Captain Mike Wilson" valueType="string" />
              <KeyValuePair label="Contact Email" value="safety@fleetai.com" valueType="email" />
              <KeyValuePair label="Flight Hours at Event" value={2.5} valueType="number" />
              <KeyValuePair label="Passengers Affected" value={0} valueType="number" />
              <KeyValuePair label="Aircraft Damage" value={false} valueType="boolean" />
              <KeyValuePair
                label="Regulatory Reporting Required"
                value={true}
                valueType="boolean"
              />
              <KeyValuePair label="Incident Date" value="2024-02-10" valueType="date" />
              <KeyValuePair label="Report Due Date" value="2024-02-24" valueType="date" />
            </div>
          </div>
        </div>
      </section>

      {/* Styling Variations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Styling Variations
        </h2>
        <p className="text-muted-foreground mb-6">Custom styling options for different use cases</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">CUSTOM STYLING</h4>
            <div className="border rounded-xl p-4 space-y-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <KeyValuePair
                label="Aircraft Model"
                value="Boeing 737-800"
                valueType="string"
                keyClassName="text-blue-700 font-bold"
                valueClassName="text-indigo-600"
              />
              <KeyValuePair
                label="Status"
                value="Operational"
                valueType="string"
                keyClassName="text-blue-700 font-bold"
                valueClassName="text-green-600 font-semibold"
              />
              <KeyValuePair
                label="Last Updated"
                value="2024-02-15"
                valueType="date"
                keyClassName="text-blue-700 font-bold"
                valueClassName="text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">COMPACT LAYOUT</h4>
            <div className="border rounded-xl p-3 space-y-0 bg-white">
              <KeyValuePair
                label="Reg"
                value="N737BA"
                valueType="string"
                className="py-0.5 text-xs"
                keyClassName="text-xs"
                valueClassName="text-xs"
              />
              <KeyValuePair
                label="Hrs"
                value={4250.75}
                valueType="number"
                className="py-0.5 text-xs"
                keyClassName="text-xs"
                valueClassName="text-xs"
              />
              <KeyValuePair
                label="Status"
                value={true}
                valueType="boolean"
                className="py-0.5 text-xs"
                keyClassName="text-xs"
              />
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
          'Comprehensive showcase of all available KeyValuePair component configurations in the Fleet AI design system.',
      },
    },
  },
};
