import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Mail, MapPin, Plane, User } from 'lucide-react';
import React, { useState } from 'react';

import {
  DatePicker,
  ModernInput,
  ModernSelect,
  ModernSwitch,
  ModernTextarea,
  PasswordInput,
  SearchInput,
} from './Form';

const meta: Meta<typeof ModernInput> = {
  title: 'Components/Form',
  component: ModernInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive collection of modern form components designed for Fleet AI applications. Each component features consistent styling, accessibility, and user experience optimizations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Overview showing all form components
export const Overview: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Form Components Overview</h1>
        <p className="text-muted-foreground">
          Modern, accessible form components for Fleet AI applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Text Inputs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Text Inputs</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard Input</label>
              <ModernInput placeholder="Enter aircraft model" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Input with Icon</label>
              <ModernInput
                placeholder="Enter pilot name"
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Input</label>
              <ModernInput
                type="email"
                placeholder="pilot@fleetai.com"
                icon={<Mail className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Input</label>
              <SearchInput placeholder="Search flights..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Input</label>
              <PasswordInput placeholder="Enter password" />
            </div>
          </div>
        </div>

        {/* Advanced Inputs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Advanced Inputs</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Textarea</label>
              <ModernTextarea placeholder="Flight notes and observations..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Dropdown</label>
              <ModernSelect
                placeholder="Select aircraft type"
                options={[
                  { value: 'boeing737', label: 'Boeing 737' },
                  { value: 'airbus320', label: 'Airbus A320' },
                  { value: 'boeing777', label: 'Boeing 777' },
                  { value: 'airbus350', label: 'Airbus A350' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Picker</label>
              <DatePicker />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Toggle Switch
                <ModernSwitch />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete overview of all form components with proper labeling and realistic Fleet AI examples.',
      },
    },
  },
};

// Input Variants
export const InputVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">STANDARD INPUTS</h3>
          <div className="space-y-3">
            <ModernInput placeholder="Basic text input" />
            <ModernInput placeholder="Email input" type="email" />
            <ModernInput placeholder="Number input" type="number" />
            <ModernInput placeholder="Disabled input" disabled />
          </div>
        </div>

        {/* Inputs with Icons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">WITH ICONS</h3>
          <div className="space-y-3">
            <ModernInput
              placeholder="Pilot name"
              icon={<User className="w-4 h-4 text-gray-400" />}
            />
            <ModernInput
              placeholder="Email address"
              type="email"
              icon={<Mail className="w-4 h-4 text-gray-400" />}
            />
            <ModernInput
              placeholder="Aircraft registration"
              icon={<Plane className="w-4 h-4 text-gray-400" />}
            />
            <ModernInput
              placeholder="Departure airport"
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>
        </div>

        {/* Search Variants */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">SEARCH INPUTS</h3>
          <div className="space-y-3">
            <SearchInput placeholder="Search flights..." />
            <SearchInput placeholder="Search aircraft..." />
            <SearchInput placeholder="Search pilots..." />
            <SearchInput placeholder="Search routes..." />
          </div>
        </div>

        {/* Password Variants */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">PASSWORD INPUTS</h3>
          <div className="space-y-3">
            <PasswordInput placeholder="Current password" />
            <PasswordInput placeholder="New password" />
            <PasswordInput placeholder="Confirm password" />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Various input field configurations including standard, icon-enhanced, search, and password inputs.',
      },
    },
  },
};

// Advanced Form Controls
export const AdvancedControls: Story = {
  render: () => {
    const [selectedAircraft, setSelectedAircraft] = useState('');
    const [flightDate, setFlightDate] = useState('');
    const [cateringEnabled, setCateringEnabled] = useState(true);
    const [notes, setNotes] = useState('');

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Textarea Examples */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">TEXTAREA FIELDS</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Flight Notes</label>
                <ModernTextarea
                  placeholder="Enter flight observations, weather conditions, or special instructions..."
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Report</label>
                <ModernTextarea
                  placeholder="Describe maintenance issues, repairs completed, or recommendations..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Passenger Feedback</label>
                <ModernTextarea
                  placeholder="Summarize passenger feedback, complaints, or commendations..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Select Examples */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">SELECT DROPDOWNS</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aircraft Type</label>
                <ModernSelect
                  placeholder="Select aircraft model"
                  value={selectedAircraft}
                  onValueChange={setSelectedAircraft}
                  options={[
                    { value: 'boeing737-800', label: 'Boeing 737-800' },
                    { value: 'boeing737-900', label: 'Boeing 737-900' },
                    { value: 'airbus320', label: 'Airbus A320' },
                    { value: 'airbus321', label: 'Airbus A321' },
                    { value: 'boeing777', label: 'Boeing 777' },
                    { value: 'boeing787', label: 'Boeing 787 Dreamliner' },
                    { value: 'airbus350', label: 'Airbus A350' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Flight Status</label>
                <ModernSelect
                  placeholder="Select status"
                  options={[
                    { value: 'scheduled', label: '🟡 Scheduled' },
                    { value: 'boarding', label: '🟠 Boarding' },
                    { value: 'departed', label: '🔵 Departed' },
                    { value: 'arrived', label: '🟢 Arrived' },
                    { value: 'delayed', label: '🟠 Delayed' },
                    { value: 'cancelled', label: '🔴 Cancelled' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority Level</label>
                <ModernSelect
                  placeholder="Select priority"
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'medium', label: 'Medium Priority' },
                    { value: 'high', label: 'High Priority' },
                    { value: 'critical', label: 'Critical Priority' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Date Pickers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">DATE PICKERS</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure Date</label>
                <DatePicker
                  value={flightDate}
                  onChange={setFlightDate}
                  fromYear={2024}
                  toYear={2025}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maintenance Due Date</label>
                <DatePicker fromYear={2024} toYear={2026} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contract Expiry</label>
                <DatePicker fromYear={2024} toYear={2030} />
              </div>
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">TOGGLE SWITCHES</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Catering Required</label>
                  <p className="text-xs text-muted-foreground">
                    Include meal service for passengers
                  </p>
                </div>
                <ModernSwitch checked={cateringEnabled} onCheckedChange={setCateringEnabled} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Wi-Fi Available</label>
                  <p className="text-xs text-muted-foreground">Enable in-flight internet access</p>
                </div>
                <ModernSwitch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Ground Power</label>
                  <p className="text-xs text-muted-foreground">Connect external power source</p>
                </div>
                <ModernSwitch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Auto Notifications</label>
                  <p className="text-xs text-muted-foreground">Send status updates automatically</p>
                </div>
                <ModernSwitch defaultChecked />
              </div>
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
          'Advanced form controls including textareas, selects, date pickers, and toggle switches with proper labeling.',
      },
    },
  },
};

// Form Layout Examples
export const FormLayouts: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      flightNumber: '',
      aircraft: '',
      departure: '',
      arrival: '',
      passengers: '',
      notes: '',
      catering: true,
      priority: '',
    });

    return (
      <div className="space-y-8">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold">Form Layout Examples</h3>
          <p className="text-sm text-muted-foreground">
            Complete form layouts for different Fleet AI use cases
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flight Booking Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Flight Booking Form</h4>
            <div className="border rounded-xl p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Flight Number</label>
                  <ModernInput
                    placeholder="FL-1234"
                    value={formData.flightNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, flightNumber: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Aircraft</label>
                  <ModernSelect
                    placeholder="Select aircraft"
                    value={formData.aircraft}
                    onValueChange={(value: string) => setFormData({ ...formData, aircraft: value })}
                    options={[
                      { value: 'boeing737', label: 'Boeing 737-800' },
                      { value: 'airbus320', label: 'Airbus A320' },
                      { value: 'boeing777', label: 'Boeing 777' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Departure</label>
                  <ModernInput
                    placeholder="JFK"
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    value={formData.departure}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, departure: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Arrival</label>
                  <ModernInput
                    placeholder="LAX"
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    value={formData.arrival}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, arrival: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Passenger Count</label>
                <ModernInput
                  type="number"
                  placeholder="189"
                  icon={<User className="w-4 h-4 text-gray-400" />}
                  value={formData.passengers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, passengers: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Flight Notes</label>
                <ModernTextarea
                  placeholder="Special instructions, weather considerations, etc..."
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Catering Service</label>
                  <p className="text-xs text-muted-foreground">Include meal service</p>
                </div>
                <ModernSwitch
                  checked={formData.catering}
                  onCheckedChange={(checked: boolean) =>
                    setFormData({ ...formData, catering: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Maintenance Request Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Maintenance Request</h4>
            <div className="border rounded-xl p-6 space-y-4 bg-white">
              <div className="space-y-2">
                <label className="text-sm font-medium">Aircraft Registration</label>
                <ModernInput
                  placeholder="N123FA"
                  icon={<Plane className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maintenance Type</label>
                  <ModernSelect
                    placeholder="Select type"
                    options={[
                      { value: 'routine', label: 'Routine Maintenance' },
                      { value: 'repair', label: 'Repair Work' },
                      { value: 'inspection', label: 'Safety Inspection' },
                      { value: 'emergency', label: 'Emergency Repair' },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <ModernSelect
                    placeholder="Select priority"
                    value={formData.priority}
                    onValueChange={(value: string) => setFormData({ ...formData, priority: value })}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'critical', label: 'Critical' },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Date</label>
                <DatePicker />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Description</label>
                <ModernTextarea
                  placeholder="Describe the maintenance issue, symptoms observed, or work required..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technician Email</label>
                <ModernInput
                  type="email"
                  placeholder="tech@fleetai.com"
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Aircraft Grounded</label>
                  <p className="text-xs text-muted-foreground">Cannot operate until fixed</p>
                </div>
                <ModernSwitch />
              </div>
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
          'Complete form layouts demonstrating real-world Fleet AI use cases with proper field grouping and validation.',
      },
    },
  },
};

// States and Validation
export const StatesAndValidation: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input States */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">INPUT STATES</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Normal State</label>
              <ModernInput placeholder="Enter flight number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Focused State</label>
              <ModernInput placeholder="Click to focus" autoFocus />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Disabled State</label>
              <ModernInput placeholder="Cannot edit" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">With Value</label>
              <ModernInput value="FL-1234" />
            </div>
          </div>
        </div>

        {/* Validation Examples */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">VALIDATION EXAMPLES</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600">Required Field *</label>
              <ModernInput
                placeholder="Flight number required"
                className="border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500"
              />
              <p className="text-xs text-red-600">Flight number is required</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-600">Valid Input ✓</label>
              <ModernInput
                value="FL-1234"
                className="border-green-300 focus-visible:border-green-500 focus-visible:ring-green-500"
              />
              <p className="text-xs text-green-600">Valid flight number format</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-orange-600">Warning</label>
              <ModernInput
                value="FL123"
                className="border-orange-300 focus-visible:border-orange-500 focus-visible:ring-orange-500"
              />
              <p className="text-xs text-orange-600">
                Flight number should include hyphen (FL-123)
              </p>
            </div>
          </div>
        </div>

        {/* Select States */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">SELECT STATES</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Select</label>
              <ModernSelect
                placeholder="Choose aircraft"
                options={[
                  { value: 'boeing737', label: 'Boeing 737' },
                  { value: 'airbus320', label: 'Airbus A320' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">With Selection</label>
              <ModernSelect
                value="boeing737"
                options={[
                  { value: 'boeing737', label: 'Boeing 737' },
                  { value: 'airbus320', label: 'Airbus A320' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Long Options</label>
              <ModernSelect
                placeholder="Select detailed option"
                options={[
                  {
                    value: 'boeing737-800',
                    label: 'Boeing 737-800 (189 passengers, 3,383 nm range)',
                  },
                  {
                    value: 'airbus320-200',
                    label: 'Airbus A320-200 (180 passengers, 3,300 nm range)',
                  },
                  {
                    value: 'boeing777-300er',
                    label: 'Boeing 777-300ER (396 passengers, 7,370 nm range)',
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Other Control States */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">OTHER CONTROLS</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Textarea States</label>
              <ModernTextarea placeholder="Normal textarea" />
              <ModernTextarea value="Pre-filled content" />
              <ModernTextarea placeholder="Disabled textarea" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Switch States</label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <ModernSwitch />
                  <span className="text-sm">Off</span>
                </div>
                <div className="flex items-center gap-2">
                  <ModernSwitch defaultChecked />
                  <span className="text-sm">On</span>
                </div>
                <div className="flex items-center gap-2">
                  <ModernSwitch disabled />
                  <span className="text-sm">Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Examples of different form control states including normal, focused, disabled, and validation states.',
      },
    },
  },
};

// Interactive Controls
export const Interactive: Story = {
  args: {
    placeholder: 'Interactive input field',
    type: 'text',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form input with controls for testing different configurations.',
      },
    },
  },
};
