import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Edit, Eye, Plane, Plus, Users, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { BadgeGroup, MainCard } from '../Card/Card';
import { DatePicker, ModernInput, ModernSelect } from '../Form/Form';
import { KeyValuePair } from '../KeyValuePair/KeyValuePair';
import { DetailDialog } from './Dialog';

const meta: Meta<typeof DetailDialog> = {
  title: 'Components/Dialog',
  component: DetailDialog,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive dialog component system for Fleet AI applications. Features gradient headers, smart button management, and flexible content areas for viewing, editing, and creating records.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DetailDialog>;

// Comprehensive Dialog Showcase - All variants in one story
export const AllDialogVariants: Story = {
  render: () => {
    // State for interactive examples
    const [aircraftData, setAircraftData] = useState({
      registration: 'N737BA',
      model: 'Boeing 737-800',
      capacity: 189,
      status: 'operational',
      lastMaintenance: '2024-01-15',
    });

    const [flightData, setFlightData] = useState({
      flightNumber: '',
      origin: '',
      destination: '',
      departureDate: '',
      aircraft: '',
    });

    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Fleet AI Dialog Components
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete showcase of dialog types and configurations for fleet management
          </p>
        </div>

        {/* Dialog Types */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Dialog Types
          </h2>
          <p className="text-muted-foreground mb-6">
            Three main dialog types: View, Edit, and Add with different button behaviors
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* View Dialog */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">VIEW DIALOG</h4>
              <DetailDialog
                DialogType="view"
                trigger={<Button intent="primary" text="View Aircraft Details" icon={Eye} />}
                title="Aircraft Information"
                subtitle="Boeing 737-800 - N737BA"
                headerGradient="from-blue-500 to-indigo-600"
                onSave={async () => {
                  // Simulate save operation
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  console.log('Aircraft updated:', aircraftData);
                }}
              >
                {(isEditing) => (
                  <div className="space-y-6 p-4">
                    <MainCard
                      title="Basic Information"
                      headerGradient="from-violet-500 to-blue-500"
                    >
                      {isEditing ? (
                        <div className="space-y-4">
                          <ModernInput
                            label="Registration"
                            value={aircraftData.registration}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setAircraftData({ ...aircraftData, registration: e.target.value })
                            }
                          />
                          <ModernSelect
                            label="Status"
                            value={aircraftData.status}
                            onValueChange={(value: string) =>
                              setAircraftData({ ...aircraftData, status: value })
                            }
                            options={[
                              { value: 'operational', label: 'Operational' },
                              { value: 'maintenance', label: 'In Maintenance' },
                              { value: 'grounded', label: 'Grounded' },
                            ]}
                          />
                        </div>
                      ) : (
                        <div className="space-y-0">
                          <KeyValuePair
                            label="Registration"
                            value={aircraftData.registration}
                            valueType="string"
                          />
                          <KeyValuePair
                            label="Model"
                            value={aircraftData.model}
                            valueType="string"
                          />
                          <KeyValuePair
                            label="Capacity"
                            value={aircraftData.capacity}
                            valueType="number"
                          />
                          <KeyValuePair
                            label="Status"
                            value={aircraftData.status}
                            valueType="string"
                          />
                          <KeyValuePair
                            label="Last Maintenance"
                            value={aircraftData.lastMaintenance}
                            valueType="date"
                          />
                        </div>
                      )}
                    </MainCard>

                    <MainCard
                      title="Operational Details"
                      headerGradient="from-green-500 to-emerald-600"
                    >
                      <div className="space-y-0">
                        <KeyValuePair
                          label="Total Flight Hours"
                          value={4250.75}
                          valueType="number"
                        />
                        <KeyValuePair label="Cycles Completed" value={3892} valueType="number" />
                        <KeyValuePair label="Next Inspection" value="2024-03-20" valueType="date" />
                        <KeyValuePair
                          label="Home Base"
                          value="JFK International"
                          valueType="string"
                        />
                      </div>
                    </MainCard>
                  </div>
                )}
              </DetailDialog>
              <p className="text-xs text-muted-foreground">
                Opens in view mode with Edit button. After editing, shows Save/Cancel buttons.
              </p>
            </div>

            {/* Edit Dialog */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">EDIT DIALOG</h4>
              <DetailDialog
                DialogType="edit"
                trigger={<Button intent="secondary" text="Edit Flight Plan" icon={Edit} />}
                title="Edit Flight Plan"
                subtitle="Modify flight details and schedule"
                headerGradient="from-orange-500 to-red-600"
                onSave={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  console.log('Flight updated');
                }}
                onCancel={() => {
                  console.log('Edit cancelled');
                }}
              >
                <div className="space-y-6 p-4">
                  <MainCard title="Flight Information" headerGradient="from-blue-500 to-purple-600">
                    <div className="space-y-4">
                      <ModernInput
                        label="Flight Number"
                        placeholder="FA-1247"
                        defaultValue="FA-1247"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <ModernInput label="Origin" placeholder="JFK" defaultValue="JFK" />
                        <ModernInput label="Destination" placeholder="LAX" defaultValue="LAX" />
                      </div>
                      <DatePicker
                        label="Departure Date"
                        value="2024-02-15"
                        fromYear={2024}
                        toYear={2025}
                      />
                    </div>
                  </MainCard>

                  <MainCard title="Aircraft Assignment" headerGradient="from-green-500 to-teal-600">
                    <div className="space-y-4">
                      <ModernSelect
                        label="Assigned Aircraft"
                        defaultValue="n737ba"
                        options={[
                          { value: 'n737ba', label: 'N737BA - Boeing 737-800' },
                          { value: 'n777cd', label: 'N777CD - Boeing 777-300' },
                          { value: 'n320ef', label: 'N320EF - Airbus A320' },
                        ]}
                      />
                      <ModernSelect
                        label="Captain"
                        defaultValue="johnson"
                        options={[
                          { value: 'johnson', label: 'Capt. Sarah Johnson' },
                          { value: 'chen', label: 'Capt. Mike Chen' },
                          { value: 'rodriguez', label: 'Capt. Alex Rodriguez' },
                        ]}
                      />
                    </div>
                  </MainCard>
                </div>
              </DetailDialog>
              <p className="text-xs text-muted-foreground">
                Opens directly in edit mode with Save/Cancel buttons. After saving, transitions to
                view mode.
              </p>
            </div>

            {/* Add Dialog */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">ADD DIALOG</h4>
              <DetailDialog
                DialogType="add"
                trigger={<Button intent="success" text="Add New Aircraft" icon={Plus} />}
                title="Add New Aircraft"
                subtitle="Register a new aircraft in the fleet"
                headerGradient="from-green-500 to-emerald-600"
                onSave={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  console.log('Aircraft created:', flightData);
                }}
                onReset={() => {
                  setFlightData({
                    flightNumber: '',
                    origin: '',
                    destination: '',
                    departureDate: '',
                    aircraft: '',
                  });
                }}
              >
                <div className="space-y-6 p-4">
                  <MainCard title="Aircraft Details" headerGradient="from-purple-500 to-pink-600">
                    <div className="space-y-4">
                      <ModernInput
                        label="Registration Number"
                        placeholder="N12345AB"
                        value={flightData.flightNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFlightData({ ...flightData, flightNumber: e.target.value })
                        }
                      />
                      <ModernSelect
                        label="Aircraft Type"
                        placeholder="Select aircraft type"
                        value={flightData.aircraft}
                        onValueChange={(value: string) =>
                          setFlightData({ ...flightData, aircraft: value })
                        }
                        options={[
                          { value: 'boeing737', label: 'Boeing 737-800' },
                          { value: 'boeing777', label: 'Boeing 777-300' },
                          { value: 'airbusa320', label: 'Airbus A320' },
                          { value: 'airbusa350', label: 'Airbus A350' },
                        ]}
                      />
                      <ModernInput
                        label="Manufacturer Year"
                        type="number"
                        placeholder="2019"
                        min="1990"
                        max="2024"
                      />
                    </div>
                  </MainCard>

                  <MainCard
                    title="Operational Information"
                    headerGradient="from-blue-500 to-cyan-600"
                  >
                    <div className="space-y-4">
                      <ModernInput
                        label="Home Base Airport"
                        placeholder="JFK"
                        value={flightData.origin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFlightData({ ...flightData, origin: e.target.value })
                        }
                      />
                      <DatePicker
                        label="Service Entry Date"
                        value={flightData.departureDate}
                        onChange={(value) => setFlightData({ ...flightData, departureDate: value })}
                        fromYear={2020}
                        toYear={2024}
                      />
                      <ModernInput
                        label="Maximum Seating Capacity"
                        type="number"
                        placeholder="189"
                        min="50"
                        max="850"
                      />
                    </div>
                  </MainCard>
                </div>
              </DetailDialog>
              <p className="text-xs text-muted-foreground">
                Opens in create mode with Create/Reset buttons. After creating, closes the dialog.
              </p>
            </div>
          </div>
        </section>

        {/* Fleet AI Application Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Fleet AI Application Examples
          </h2>
          <p className="text-muted-foreground mb-6">
            Real-world dialog examples for fleet management scenarios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aircraft Maintenance Dialog */}
            <DetailDialog
              DialogType="view"
              trigger={
                <Button intent="warning" text="Maintenance Schedule" icon={Wrench} size="md" />
              }
              title="Aircraft Maintenance"
              subtitle="N737BA Maintenance Schedule & History"
              headerGradient="from-orange-500 to-red-600"
              onSave={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
            >
              {(isEditing) => (
                <div className="space-y-6 p-4">
                  <MainCard
                    title="Current Maintenance Status"
                    headerGradient="from-red-500 to-pink-600"
                  >
                    <div className="space-y-0">
                      <KeyValuePair label="Next A-Check" value="2024-03-15" valueType="date" />
                      <KeyValuePair label="Next C-Check" value="2024-08-20" valueType="date" />
                      <KeyValuePair label="Hours Since Last" value={245.5} valueType="number" />
                      <KeyValuePair label="Cycles Since Last" value={187} valueType="number" />
                      <KeyValuePair label="Maintenance Status" value="Current" valueType="string" />
                    </div>
                  </MainCard>

                  <MainCard title="Upcoming Tasks" headerGradient="from-blue-500 to-indigo-600">
                    <BadgeGroup
                      tags={[
                        'Engine Inspection',
                        'Avionics Update',
                        'Tire Replacement',
                        'Safety Equipment Check',
                      ]}
                    />
                  </MainCard>

                  <MainCard title="Maintenance Team" headerGradient="from-green-500 to-emerald-600">
                    <div className="space-y-0">
                      <KeyValuePair
                        label="Lead Technician"
                        value="Mike Rodriguez"
                        valueType="string"
                      />
                      <KeyValuePair label="Inspector" value="Sarah Chen" valueType="string" />
                      <KeyValuePair label="Estimated Duration" value="8 hours" valueType="string" />
                      <KeyValuePair label="Hangar Assignment" value="Hangar 3" valueType="string" />
                    </div>
                  </MainCard>
                </div>
              )}
            </DetailDialog>

            {/* Flight Operations Dialog */}
            <DetailDialog
              DialogType="view"
              trigger={<Button intent="primary" text="Flight Operations" icon={Plane} size="md" />}
              title="Flight Operations Center"
              subtitle="Real-time flight monitoring and control"
              headerGradient="from-blue-500 to-purple-600"
            >
              <div className="space-y-6 p-4">
                <MainCard title="Active Flights" headerGradient="from-green-500 to-teal-600">
                  <div className="space-y-0">
                    <KeyValuePair label="FA-1247 (JFK→LAX)" value="In Flight" valueType="string" />
                    <KeyValuePair label="FA-2156 (ORD→MIA)" value="Boarding" valueType="string" />
                    <KeyValuePair label="FA-3389 (DEN→SEA)" value="Delayed" valueType="string" />
                    <KeyValuePair label="FA-4492 (ATL→BOS)" value="Scheduled" valueType="string" />
                  </div>
                </MainCard>

                <MainCard title="Fleet Status" headerGradient="from-purple-500 to-pink-600">
                  <div className="space-y-0">
                    <KeyValuePair label="Aircraft Available" value={42} valueType="number" />
                    <KeyValuePair label="In Maintenance" value={3} valueType="number" />
                    <KeyValuePair label="In Flight" value={18} valueType="number" />
                    <KeyValuePair label="Ground Operations" value={21} valueType="number" />
                  </div>
                </MainCard>

                <MainCard title="Performance Metrics" headerGradient="from-orange-500 to-red-600">
                  <div className="space-y-0">
                    <KeyValuePair label="On-Time Performance" value="94.2%" valueType="string" />
                    <KeyValuePair label="Average Load Factor" value="87.5%" valueType="string" />
                    <KeyValuePair label="Daily Revenue" value="$2.4M" valueType="string" />
                    <KeyValuePair label="Fuel Efficiency" value="98.1%" valueType="string" />
                  </div>
                </MainCard>
              </div>
            </DetailDialog>

            {/* Crew Management Dialog */}
            <DetailDialog
              DialogType="edit"
              trigger={<Button intent="secondary" text="Crew Management" icon={Users} size="md" />}
              title="Crew Scheduling"
              subtitle="Manage flight crew assignments and schedules"
              headerGradient="from-indigo-500 to-purple-600"
              onSave={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
            >
              <div className="space-y-6 p-4">
                <MainCard title="Flight Crew Assignment" headerGradient="from-blue-500 to-cyan-600">
                  <div className="space-y-4">
                    <ModernSelect
                      label="Captain"
                      placeholder="Select captain"
                      options={[
                        { value: 'johnson', label: 'Capt. Sarah Johnson - 12,000 hrs' },
                        { value: 'chen', label: 'Capt. Mike Chen - 8,500 hrs' },
                        { value: 'rodriguez', label: 'Capt. Alex Rodriguez - 15,200 hrs' },
                      ]}
                    />
                    <ModernSelect
                      label="First Officer"
                      placeholder="Select first officer"
                      options={[
                        { value: 'thompson', label: 'FO Emma Thompson - 3,200 hrs' },
                        { value: 'wilson', label: 'FO David Wilson - 4,800 hrs' },
                        { value: 'garcia', label: 'FO Maria Garcia - 2,900 hrs' },
                      ]}
                    />
                    <ModernInput label="Senior Flight Attendant" defaultValue="Lisa Brown" />
                  </div>
                </MainCard>

                <MainCard
                  title="Schedule Information"
                  headerGradient="from-green-500 to-emerald-600"
                >
                  <div className="space-y-0">
                    <KeyValuePair label="Duty Start Time" value="06:00" valueType="string" />
                    <KeyValuePair label="Estimated Duty End" value="18:30" valueType="string" />
                    <KeyValuePair label="Total Duty Hours" value="12.5" valueType="string" />
                    <KeyValuePair
                      label="Rest Period Required"
                      value="10 hours"
                      valueType="string"
                    />
                    <KeyValuePair
                      label="Next Available"
                      value="2024-02-16 08:00"
                      valueType="string"
                    />
                  </div>
                </MainCard>

                <MainCard title="Certifications" headerGradient="from-orange-500 to-yellow-600">
                  <BadgeGroup
                    tags={[
                      'Type Rating Current',
                      'Medical Valid',
                      'Recurrent Training Complete',
                      'Emergency Procedures Current',
                    ]}
                  />
                </MainCard>
              </div>
            </DetailDialog>
          </div>
        </section>

        {/* Dialog Styling Variations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Dialog Styling Variations
          </h2>
          <p className="text-muted-foreground mb-6">
            Different header gradients and styling options for various contexts
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <DetailDialog
              DialogType="view"
              trigger={<Button intent="primary" text="Blue Gradient" size="sm" />}
              title="Blue Theme"
              subtitle="Primary blue gradient"
              headerGradient="from-blue-500 to-blue-600"
            >
              <div className="p-4">
                <p className="text-muted-foreground">Standard blue gradient for general use.</p>
              </div>
            </DetailDialog>

            <DetailDialog
              DialogType="view"
              trigger={<Button intent="success" text="Green Gradient" size="sm" />}
              title="Success Theme"
              subtitle="Green success gradient"
              headerGradient="from-green-500 to-emerald-600"
            >
              <div className="p-4">
                <p className="text-muted-foreground">
                  Green gradient for success states and positive actions.
                </p>
              </div>
            </DetailDialog>

            <DetailDialog
              DialogType="view"
              trigger={<Button intent="warning" text="Orange Gradient" size="sm" />}
              title="Warning Theme"
              subtitle="Orange warning gradient"
              headerGradient="from-orange-500 to-red-600"
            >
              <div className="p-4">
                <p className="text-muted-foreground">
                  Orange-red gradient for warnings and maintenance.
                </p>
              </div>
            </DetailDialog>

            <DetailDialog
              DialogType="view"
              trigger={<Button intent="secondary" text="Purple Gradient" size="sm" />}
              title="Purple Theme"
              subtitle="Purple accent gradient"
              headerGradient="from-purple-500 to-pink-600"
            >
              <div className="p-4">
                <p className="text-muted-foreground">
                  Purple gradient for special features and analytics.
                </p>
              </div>
            </DetailDialog>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available Dialog component configurations in the Fleet AI design system.',
      },
    },
  },
};
