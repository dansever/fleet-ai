import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { KeyValuePair } from './KeyValuePair';

const meta: Meta<typeof KeyValuePair> = {
  title: 'Components/Utilities/KeyValuePair',
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

// Overview showing all value types
export const Overview: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">KeyValuePair Component Overview</h1>
        <p className="text-muted-foreground">
          Versatile component for displaying structured data in Fleet AI applications
        </p>
      </div>

      {/* Display Mode */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Display Mode</h2>
        <div className="border rounded-xl p-4 space-y-0 bg-white">
          <KeyValuePair label="Aircraft Model" value="Boeing 737-800" valueType="string" />
          <KeyValuePair label="Passenger Capacity" value={189} valueType="number" />
          <KeyValuePair label="Wi-Fi Available" value={true} valueType="boolean" />
          <KeyValuePair label="Last Maintenance" value="2024-01-15" valueType="date" />
          <KeyValuePair
            label="Status"
            value="active"
            valueType="select"
            selectOptions={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'In Maintenance' },
              { value: 'retired', label: 'Retired' },
            ]}
          />
          <KeyValuePair label="Contact Email" value="pilot@fleetai.com" valueType="email" />
        </div>
      </div>

      {/* Edit Mode */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Mode</h2>
        <div className="border rounded-xl p-4 space-y-0 bg-white">
          <KeyValuePair
            label="Aircraft Model"
            value="Boeing 737-800"
            valueType="string"
            editMode={true}
            onChange={(value) => console.log('Model changed:', value)}
          />
          <KeyValuePair
            label="Passenger Capacity"
            value={189}
            valueType="number"
            editMode={true}
            onChange={(value) => console.log('Capacity changed:', value)}
          />
          <KeyValuePair
            label="Wi-Fi Available"
            value={true}
            valueType="boolean"
            editMode={true}
            onChange={(value) => console.log('WiFi changed:', value)}
          />
          <KeyValuePair
            label="Next Maintenance"
            value="2024-06-15"
            valueType="date"
            editMode={true}
            onChange={(value) => console.log('Date changed:', value)}
          />
          <KeyValuePair
            label="Status"
            value="active"
            valueType="select"
            editMode={true}
            selectOptions={[
              { value: 'active', label: 'Active' },
              { value: 'maintenance', label: 'In Maintenance' },
              { value: 'retired', label: 'Retired' },
            ]}
            onChange={(value) => console.log('Status changed:', value)}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete overview showing all value types in both display and edit modes.',
      },
    },
  },
};

// Value Type Examples
export const ValueTypes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* String Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">STRING VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Flight Number" value="FL-1234" valueType="string" />
            <KeyValuePair label="Airline Code" value="FA" valueType="string" />
            <KeyValuePair label="Aircraft Registration" value="N123FA" valueType="string" />
            <KeyValuePair
              label="Long Description"
              value="This is a long text description that demonstrates how the component handles extended content gracefully with proper wrapping and spacing."
              valueType="string"
            />
          </div>
        </div>

        {/* Number Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">NUMBER VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Altitude (ft)" value={35000} valueType="number" />
            <KeyValuePair label="Speed (knots)" value={450} valueType="number" />
            <KeyValuePair label="Fuel Remaining (%)" value={78.5} valueType="number" />
            <KeyValuePair label="Zero Value" value={0} valueType="number" />
          </div>
        </div>

        {/* Boolean Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">BOOLEAN VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Engine Running" value={true} valueType="boolean" />
            <KeyValuePair label="Landing Gear Down" value={false} valueType="boolean" />
            <KeyValuePair label="Autopilot Engaged" value={true} valueType="boolean" />
            <KeyValuePair label="Emergency Mode" value={false} valueType="boolean" />
          </div>
        </div>

        {/* Date Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">DATE VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Departure Time" value="2024-01-15" valueType="date" />
            <KeyValuePair label="Arrival Time" value="2024-01-15" valueType="date" />
            <KeyValuePair label="Last Maintenance" value="2024-01-10" valueType="date" />
            <KeyValuePair label="Next Inspection" value="2024-02-15" valueType="date" />
          </div>
        </div>

        {/* Select Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">SELECT VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Flight Status"
              value="on_time"
              valueType="select"
              selectOptions={[
                { value: 'on_time', label: 'On Time' },
                { value: 'delayed', label: 'Delayed' },
                { value: 'cancelled', label: 'Cancelled' },
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
              value="commercial"
              valueType="select"
              selectOptions={[
                { value: 'commercial', label: 'Commercial Aircraft' },
                { value: 'cargo', label: 'Cargo Aircraft' },
                { value: 'private', label: 'Private Jet' },
              ]}
            />
          </div>
        </div>

        {/* Email Values */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EMAIL VALUES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Pilot Email" value="captain@fleetai.com" valueType="email" />
            <KeyValuePair label="Ground Control" value="control@airport.com" valueType="email" />
            <KeyValuePair
              label="Maintenance Team"
              value="maintenance@fleetai.com"
              valueType="email"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of all supported value types with realistic Fleet AI data.',
      },
    },
  },
};

// Edit Mode Examples
export const EditModeExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editable String Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EDITABLE TEXT</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Flight Number"
              value="FL-1234"
              valueType="string"
              editMode={true}
              name="flightNumber"
              onChange={(value) => console.log('Flight number:', value)}
            />
            <KeyValuePair
              label="Notes"
              value="Aircraft ready for departure"
              valueType="string"
              editMode={true}
              name="notes"
              onChange={(value) => console.log('Notes:', value)}
            />
          </div>
        </div>

        {/* Editable Number Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EDITABLE NUMBERS</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Passengers"
              value={156}
              valueType="number"
              editMode={true}
              name="passengers"
              onChange={(value) => console.log('Passengers:', value)}
            />
            <KeyValuePair
              label="Fuel (gallons)"
              value={2500}
              valueType="number"
              editMode={true}
              name="fuel"
              onChange={(value) => console.log('Fuel:', value)}
            />
          </div>
        </div>

        {/* Editable Boolean Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EDITABLE TOGGLES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Catering Required"
              value={true}
              valueType="boolean"
              editMode={true}
              name="catering"
              onChange={(value) => console.log('Catering:', value)}
            />
            <KeyValuePair
              label="Ground Power"
              value={false}
              valueType="boolean"
              editMode={true}
              name="groundPower"
              onChange={(value) => console.log('Ground Power:', value)}
            />
          </div>
        </div>

        {/* Editable Date Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EDITABLE DATES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Departure Date"
              value="2024-02-15"
              valueType="date"
              editMode={true}
              name="departureDate"
              onChange={(value) => console.log('Departure:', value)}
            />
            <KeyValuePair
              label="Maintenance Due"
              value="2024-03-01"
              valueType="date"
              editMode={true}
              name="maintenanceDate"
              onChange={(value) => console.log('Maintenance:', value)}
            />
          </div>
        </div>

        {/* Editable Select Fields */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">EDITABLE SELECTS</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair
              label="Status"
              value="scheduled"
              valueType="select"
              editMode={true}
              name="status"
              selectOptions={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'boarding', label: 'Boarding' },
                { value: 'departed', label: 'Departed' },
                { value: 'arrived', label: 'Arrived' },
              ]}
              onChange={(value) => console.log('Status:', value)}
            />
            <KeyValuePair
              label="Gate"
              value="A12"
              valueType="select"
              editMode={true}
              name="gate"
              selectOptions={[
                { value: 'A12', label: 'Gate A12' },
                { value: 'B05', label: 'Gate B05' },
                { value: 'C08', label: 'Gate C08' },
              ]}
              onChange={(value) => console.log('Gate:', value)}
            />
          </div>
        </div>

        {/* Mixed Edit/Display Mode */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">MIXED MODES</h3>
          <div className="border rounded-lg p-3 space-y-0 bg-white">
            <KeyValuePair label="Aircraft ID" value="N123FA" valueType="string" editMode={false} />
            <KeyValuePair
              label="Flight Number"
              value="FL-1234"
              valueType="string"
              editMode={true}
              onChange={(value) => console.log('Flight:', value)}
            />
            <KeyValuePair label="Registration" value="N456FB" valueType="string" editMode={false} />
            <KeyValuePair
              label="Passengers"
              value={189}
              valueType="number"
              editMode={true}
              onChange={(value) => console.log('Passengers:', value)}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of edit mode functionality with proper form controls and change handlers.',
      },
    },
  },
};

// Real-World Fleet AI Examples
export const FleetAIExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Fleet AI Application Examples</h3>
        <p className="text-sm text-muted-foreground">
          Real-world usage in fleet management scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aircraft Details */}
        <div className="space-y-3">
          <h4 className="font-medium">Aircraft Information</h4>
          <div className="border rounded-xl p-4 space-y-0 bg-white">
            <KeyValuePair label="Registration" value="N123FA" valueType="string" />
            <KeyValuePair label="Model" value="Boeing 737-800" valueType="string" />
            <KeyValuePair label="Capacity" value={189} valueType="number" />
            <KeyValuePair label="Year Manufactured" value={2018} valueType="number" />
            <KeyValuePair label="In Service" value={true} valueType="boolean" />
            <KeyValuePair label="Next Maintenance" value="2024-03-15" valueType="date" />
            <KeyValuePair
              label="Status"
              value="active"
              valueType="select"
              selectOptions={[
                { value: 'active', label: 'Active' },
                { value: 'maintenance', label: 'In Maintenance' },
                { value: 'retired', label: 'Retired' },
              ]}
            />
          </div>
        </div>

        {/* Flight Information */}
        <div className="space-y-3">
          <h4 className="font-medium">Flight Details</h4>
          <div className="border rounded-xl p-4 space-y-0 bg-white">
            <KeyValuePair label="Flight Number" value="FL-1234" valueType="string" />
            <KeyValuePair label="Route" value="JFK → LAX" valueType="string" />
            <KeyValuePair label="Departure" value="2024-01-15" valueType="date" />
            <KeyValuePair label="Duration (hours)" value={5.5} valueType="number" />
            <KeyValuePair label="Passengers" value={156} valueType="number" />
            <KeyValuePair label="On Schedule" value={true} valueType="boolean" />
            <KeyValuePair label="Captain Email" value="captain@fleetai.com" valueType="email" />
          </div>
        </div>

        {/* Maintenance Record */}
        <div className="space-y-3">
          <h4 className="font-medium">Maintenance Record</h4>
          <div className="border rounded-xl p-4 space-y-0 bg-white">
            <KeyValuePair label="Work Order" value="MX-2024-001" valueType="string" />
            <KeyValuePair
              label="Type"
              value="routine"
              valueType="select"
              selectOptions={[
                { value: 'routine', label: 'Routine Maintenance' },
                { value: 'emergency', label: 'Emergency Repair' },
                { value: 'inspection', label: 'Safety Inspection' },
              ]}
            />
            <KeyValuePair label="Scheduled Date" value="2024-02-01" valueType="date" />
            <KeyValuePair label="Hours Required" value={8} valueType="number" />
            <KeyValuePair label="Completed" value={false} valueType="boolean" />
            <KeyValuePair label="Technician" value="tech@fleetai.com" valueType="email" />
          </div>
        </div>

        {/* Fuel Management */}
        <div className="space-y-3">
          <h4 className="font-medium">Fuel Management</h4>
          <div className="border rounded-xl p-4 space-y-0 bg-white">
            <KeyValuePair label="Current Level (%)" value={78.5} valueType="number" />
            <KeyValuePair label="Total Capacity (gal)" value={6875} valueType="number" />
            <KeyValuePair label="Last Refuel" value="2024-01-14" valueType="date" />
            <KeyValuePair
              label="Fuel Type"
              value="jet_a1"
              valueType="select"
              selectOptions={[
                { value: 'jet_a1', label: 'Jet A-1' },
                { value: 'avgas', label: 'Avgas 100LL' },
                { value: 'jet_a', label: 'Jet A' },
              ]}
            />
            <KeyValuePair label="Auto Refuel" value={true} valueType="boolean" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Real-world Fleet AI application examples showing practical usage in different contexts.',
      },
    },
  },
};

// Custom Styling Examples
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Custom Styling Options</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Levels with Color Coding */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">PRIORITY LEVELS</h4>
          <div className="space-y-2">
            <KeyValuePair
              label="Critical Alert"
              value="Engine Temperature High"
              valueType="string"
              className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              keyClassName="text-red-800 font-bold"
              valueClassName="text-red-700"
            />
            <KeyValuePair
              label="Warning"
              value="Fuel Level Low"
              valueType="string"
              className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
              keyClassName="text-orange-800 font-bold"
              valueClassName="text-orange-700"
            />
            <KeyValuePair
              label="Normal"
              value="All Systems Operational"
              valueType="string"
              className="bg-green-50 border border-green-200 rounded-lg px-3 py-2"
              keyClassName="text-green-800 font-bold"
              valueClassName="text-green-700"
            />
          </div>
        </div>

        {/* Compact Layout */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">COMPACT LAYOUT</h4>
          <div className="border rounded-lg p-2 space-y-0 bg-gray-50">
            <KeyValuePair
              label="ID"
              value="AC-001"
              valueType="string"
              className="py-0.5 text-xs border-b-0"
              keyClassName="text-gray-500 text-xs"
              valueClassName="text-gray-700 text-xs font-mono"
            />
            <KeyValuePair
              label="Status"
              value={true}
              valueType="boolean"
              className="py-0.5 text-xs border-b-0"
              keyClassName="text-gray-500 text-xs"
            />
            <KeyValuePair
              label="Count"
              value={42}
              valueType="number"
              className="py-0.5 text-xs border-b-0"
              keyClassName="text-gray-500 text-xs"
              valueClassName="text-gray-700 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Card-style Layout */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">CARD LAYOUT</h4>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <KeyValuePair
            label="Flight Status"
            value="On Time"
            valueType="string"
            className="border-b border-blue-200 py-3"
            keyClassName="text-blue-800 font-semibold"
            valueClassName="text-blue-900 font-bold"
          />
          <KeyValuePair
            label="Departure Gate"
            value="A12"
            valueType="string"
            className="border-b border-blue-200 py-3"
            keyClassName="text-blue-800 font-semibold"
            valueClassName="text-blue-900 font-bold"
          />
          <KeyValuePair
            label="Boarding Started"
            value={true}
            valueType="boolean"
            className="py-3 border-b-0"
            keyClassName="text-blue-800 font-semibold"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Examples of custom styling options including color coding, compact layouts, and card-style presentations.',
      },
    },
  },
};

// Interactive Controls
export const Interactive: Story = {
  args: {
    label: 'Interactive Example',
    value: 'Edit me!',
    valueType: 'string',
    editMode: false,
    className: '',
    keyClassName: '',
    valueClassName: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive KeyValuePair with full controls for testing different configurations.',
      },
    },
  },
};
