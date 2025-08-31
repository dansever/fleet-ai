import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Mail, MapPin, Plane, User } from 'lucide-react';
import { useState } from 'react';
import {
  DatePicker,
  FileUpload,
  ModernInput,
  ModernSelect,
  ModernSwitch,
  ModernTextarea,
  NumberInput,
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
          'A comprehensive collection of modern form components for Fleet AI applications. Includes inputs, selects, switches, date pickers, and specialized components with consistent styling and validation states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModernInput>;

// Comprehensive Form Components Showcase - All variants in one story
export const AllFormComponentVariants: Story = {
  render: () => {
    // State for interactive examples
    const [textValue, setTextValue] = useState('');
    const [numberValue, setNumberValue] = useState(0);
    const [selectValue, setSelectValue] = useState('');
    const [switchValue, setSwitchValue] = useState(false);
    const [dateValue, setDateValue] = useState('');

    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Fleet AI Form Components
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete showcase of form input components and validation states
          </p>
        </div>

        {/* Basic Input Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Basic Input Components
          </h2>
          <p className="text-muted-foreground mb-6">
            Standard input fields with labels, placeholders, and helper text
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernInput
              label="Aircraft Registration"
              placeholder="Enter registration number"
              helper="Format: N12345AB"
            />

            <ModernInput
              label="Pilot Name"
              placeholder="Enter pilot name"
              icon={<User className="w-4 h-4" />}
            />

            <ModernInput
              label="Flight Number"
              placeholder="FL-2024-001"
              value={textValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextValue(e.target.value)}
            />

            <SearchInput label="Search Aircraft" placeholder="Search by registration or model" />

            <PasswordInput
              label="System Password"
              placeholder="Enter secure password"
              helper="Must be at least 8 characters"
            />

            <ModernInput
              label="Email Address"
              type="email"
              placeholder="pilot@fleetai.com"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* Input States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Input States
          </h2>
          <p className="text-muted-foreground mb-6">
            Different states including normal, error, and disabled states
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernInput
              label="Normal State"
              placeholder="Normal input field"
              helper="This is a normal input field"
            />

            <ModernInput
              label="Error State"
              placeholder="Invalid input"
              error="This field is required"
            />

            <ModernInput
              label="Disabled State"
              placeholder="Disabled input"
              disabled
              helper="This field is disabled"
            />

            <SearchInput
              label="Search with Error"
              placeholder="Search query"
              error="Invalid search criteria"
            />

            <PasswordInput
              label="Password Error"
              placeholder="Enter password"
              error="Password must contain at least one uppercase letter"
            />

            <ModernInput
              label="Success State"
              placeholder="Valid input"
              helper="✓ This input is valid"
              className="border-green-300 focus:border-green-500 focus:ring-green-500/20"
            />
          </div>
        </section>

        {/* Specialized Input Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Specialized Input Components
          </h2>
          <p className="text-muted-foreground mb-6">
            Number inputs, textareas, and other specialized form controls
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberInput
              label="Passenger Count"
              placeholder="Enter number of passengers"
              min={0}
              max={850}
              step={1}
              value={numberValue}
              onChange={setNumberValue}
              helper="Maximum capacity: 850 passengers"
            />

            <NumberInput
              label="Flight Hours"
              placeholder="0.0"
              min={0}
              max={24}
              step={0.5}
              helper="Total flight duration in hours"
            />

            <NumberInput
              label="Altitude (ft)"
              placeholder="Enter altitude"
              min={0}
              max={45000}
              step={1000}
            />

            <div className="md:col-span-2 lg:col-span-3">
              <ModernTextarea
                label="Flight Notes"
                placeholder="Enter detailed flight notes, weather conditions, or special instructions..."
                rows={4}
                helper="Include any relevant information about the flight"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <ModernTextarea
                label="Maintenance Report"
                placeholder="Describe maintenance activities performed..."
                rows={3}
                error="Please provide a detailed maintenance report"
              />
            </div>
          </div>
        </section>

        {/* Select and Switch Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Select and Switch Components
          </h2>
          <p className="text-muted-foreground mb-6">
            Dropdown selects and toggle switches for various options
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModernSelect
              label="Aircraft Type"
              placeholder="Select aircraft type"
              value={selectValue}
              onValueChange={setSelectValue}
              options={[
                { value: 'boeing737', label: 'Boeing 737' },
                { value: 'boeing777', label: 'Boeing 777' },
                { value: 'boeing787', label: 'Boeing 787' },
                { value: 'airbusa320', label: 'Airbus A320' },
                { value: 'airbusa350', label: 'Airbus A350' },
                { value: 'airbusa380', label: 'Airbus A380' },
              ]}
              helper="Select the aircraft model"
            />

            <ModernSelect
              label="Flight Status"
              placeholder="Select status"
              options={[
                { value: 'scheduled', label: '🕒 Scheduled' },
                { value: 'boarding', label: '🚶 Boarding' },
                { value: 'departed', label: '✈️ Departed' },
                { value: 'arrived', label: '🏁 Arrived' },
                { value: 'delayed', label: '⏰ Delayed' },
                { value: 'cancelled', label: '❌ Cancelled' },
              ]}
            />

            <ModernSelect
              label="Priority Level"
              placeholder="Select priority"
              error="Please select a priority level"
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'critical', label: 'Critical Priority' },
              ]}
            />

            <div className="space-y-4">
              <ModernSwitch
                label="Auto-pilot Enabled"
                description="Enable automatic flight control systems"
                checked={switchValue}
                onCheckedChange={setSwitchValue}
              />

              <ModernSwitch
                label="Weather Radar"
                description="Activate weather monitoring and alerts"
                defaultChecked={true}
              />

              <ModernSwitch
                label="Emergency Protocols"
                description="Enable enhanced safety and emergency procedures"
                defaultChecked={false}
              />
            </div>

            <div className="space-y-4">
              <ModernSwitch
                label="Maintenance Mode"
                description="Put aircraft in maintenance mode - disables flight operations"
                defaultChecked={false}
              />

              <ModernSwitch
                label="Crew Notifications"
                description="Send automatic notifications to flight crew"
                defaultChecked={true}
              />

              <ModernSwitch
                label="Real-time Tracking"
                description="Enable GPS tracking and live flight monitoring"
                defaultChecked={true}
              />
            </div>
          </div>
        </section>

        {/* Date and File Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Date and File Components
          </h2>
          <p className="text-muted-foreground mb-6">
            Date pickers and file upload components for document management
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DatePicker
              label="Departure Date"
              value={dateValue}
              onChange={setDateValue}
              helper="Select the scheduled departure date"
            />

            <DatePicker
              label="Maintenance Due"
              fromYear={2024}
              toYear={2026}
              error="Maintenance date cannot be in the past"
            />

            <DatePicker
              label="License Expiry"
              fromYear={2024}
              toYear={2030}
              helper="Pilot license expiration date"
            />

            <div className="md:col-span-2 lg:col-span-3">
              <FileUpload
                label="Flight Documents"
                accept=".pdf,.doc,.docx,.txt"
                multiple={true}
                onFileSelect={(files) => console.log('Files selected:', files)}
                helper="Upload flight plans, maintenance reports, or other relevant documents"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <FileUpload
                label="Aircraft Images"
                accept="image/*"
                multiple={true}
                error="Please upload at least one aircraft image"
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
            Real-world form examples for fleet management scenarios
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Aircraft Registration Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Aircraft Registration Form</h4>
              <div className="p-6 bg-white border rounded-xl space-y-4">
                <ModernInput
                  label="Aircraft Registration Number"
                  placeholder="N12345AB"
                  icon={<Plane className="w-4 h-4" />}
                  helper="FAA registration format required"
                />

                <ModernSelect
                  label="Aircraft Manufacturer"
                  placeholder="Select manufacturer"
                  options={[
                    { value: 'boeing', label: 'Boeing' },
                    { value: 'airbus', label: 'Airbus' },
                    { value: 'embraer', label: 'Embraer' },
                    { value: 'bombardier', label: 'Bombardier' },
                  ]}
                />

                <ModernInput label="Aircraft Model" placeholder="737-800" />

                <NumberInput label="Year Manufactured" min={1990} max={2024} placeholder="2019" />

                <NumberInput label="Maximum Seating Capacity" min={1} max={850} placeholder="189" />

                <DatePicker label="Date Acquired" fromYear={2000} toYear={2024} />

                <ModernSwitch
                  label="Currently Active"
                  description="Aircraft is available for flight operations"
                  defaultChecked={true}
                />
              </div>
            </div>

            {/* Flight Planning Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Flight Planning Form</h4>
              <div className="p-6 bg-white border rounded-xl space-y-4">
                <ModernInput
                  label="Flight Number"
                  placeholder="FA-1247"
                  helper="Format: AA-#### (Airline code + flight number)"
                />

                <div className="grid grid-cols-2 gap-4">
                  <ModernInput
                    label="Departure Airport"
                    placeholder="JFK"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                  <ModernInput
                    label="Arrival Airport"
                    placeholder="LAX"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker label="Departure Date" fromYear={2024} toYear={2025} />
                  <ModernInput label="Departure Time" type="time" placeholder="14:30" />
                </div>

                <ModernSelect
                  label="Assigned Aircraft"
                  placeholder="Select aircraft"
                  options={[
                    { value: 'n737ba', label: 'N737BA - Boeing 737-800' },
                    { value: 'n777cd', label: 'N777CD - Boeing 777-300' },
                    { value: 'n320ef', label: 'N320EF - Airbus A320' },
                  ]}
                />

                <NumberInput
                  label="Estimated Flight Duration (hours)"
                  min={0.5}
                  max={18}
                  step={0.25}
                  placeholder="5.5"
                />

                <ModernTextarea
                  label="Flight Notes"
                  placeholder="Weather conditions, special instructions, cargo details..."
                  rows={3}
                />
              </div>
            </div>

            {/* Crew Assignment Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Crew Assignment Form</h4>
              <div className="p-6 bg-white border rounded-xl space-y-4">
                <ModernSelect
                  label="Captain"
                  placeholder="Select captain"
                  options={[
                    { value: 'johnson', label: 'Capt. Sarah Johnson - B737 Certified' },
                    { value: 'chen', label: 'Capt. Mike Chen - B777 Certified' },
                    { value: 'rodriguez', label: 'Capt. Alex Rodriguez - A320 Certified' },
                  ]}
                />

                <ModernSelect
                  label="First Officer"
                  placeholder="Select first officer"
                  options={[
                    { value: 'thompson', label: 'FO Emma Thompson - B737 Certified' },
                    { value: 'wilson', label: 'FO David Wilson - B777 Certified' },
                    { value: 'garcia', label: 'FO Maria Garcia - A320 Certified' },
                  ]}
                />

                <NumberInput
                  label="Cabin Crew Required"
                  min={2}
                  max={12}
                  placeholder="4"
                  helper="Minimum 2 crew members required"
                />

                <ModernSelect
                  label="Senior Flight Attendant"
                  placeholder="Select senior FA"
                  options={[
                    { value: 'brown', label: 'Lisa Brown - 8 years experience' },
                    { value: 'taylor', label: 'James Taylor - 6 years experience' },
                    { value: 'anderson', label: 'Amy Anderson - 10 years experience' },
                  ]}
                />

                <div className="space-y-3">
                  <ModernSwitch
                    label="International Flight"
                    description="Requires additional documentation and crew certifications"
                  />

                  <ModernSwitch
                    label="Overnight Crew Rest Required"
                    description="Flight duration requires mandatory crew rest period"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Request Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Maintenance Request Form</h4>
              <div className="p-6 bg-white border rounded-xl space-y-4">
                <ModernSelect
                  label="Aircraft"
                  placeholder="Select aircraft"
                  options={[
                    { value: 'n737ba', label: 'N737BA - Boeing 737-800' },
                    { value: 'n777cd', label: 'N777CD - Boeing 777-300' },
                    { value: 'n320ef', label: 'N320EF - Airbus A320' },
                  ]}
                />

                <ModernSelect
                  label="Maintenance Type"
                  placeholder="Select maintenance type"
                  options={[
                    { value: 'routine', label: '🔧 Routine Maintenance' },
                    { value: 'inspection', label: '🔍 Safety Inspection' },
                    { value: 'repair', label: '⚠️ Repair Required' },
                    { value: 'emergency', label: '🚨 Emergency Maintenance' },
                  ]}
                />

                <ModernSelect
                  label="Priority Level"
                  placeholder="Select priority"
                  options={[
                    { value: 'low', label: '🟢 Low Priority' },
                    { value: 'medium', label: '🟡 Medium Priority' },
                    { value: 'high', label: '🟠 High Priority' },
                    { value: 'critical', label: '🔴 Critical Priority' },
                  ]}
                />

                <DatePicker label="Scheduled Date" fromYear={2024} toYear={2025} />

                <NumberInput
                  label="Estimated Hours"
                  min={0.5}
                  max={72}
                  step={0.5}
                  placeholder="8"
                />

                <ModernTextarea
                  label="Issue Description"
                  placeholder="Describe the maintenance issue, symptoms, or requirements in detail..."
                  rows={4}
                />

                <FileUpload
                  label="Supporting Documents"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  multiple={true}
                  helper="Upload photos, reports, or technical documentation"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Layout Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Form Layout Examples
          </h2>
          <p className="text-muted-foreground mb-6">
            Different form layouts and arrangements for various use cases
          </p>

          <div className="space-y-8">
            {/* Inline Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">INLINE FORM LAYOUT</h4>
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="min-w-[200px]">
                    <SearchInput label="Quick Search" placeholder="Search flights..." />
                  </div>
                  <div className="min-w-[150px]">
                    <ModernSelect
                      label="Status"
                      placeholder="Any status"
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'active', label: 'Active' },
                        { value: 'delayed', label: 'Delayed' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                    />
                  </div>
                  <div className="min-w-[140px]">
                    <DatePicker label="Date" fromYear={2024} toYear={2024} />
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">COMPACT FORM LAYOUT</h4>
              <div className="max-w-md p-4 bg-white border rounded-xl space-y-3">
                <ModernInput label="Flight ID" placeholder="FL-001" className="h-9 text-sm" />
                <ModernSelect
                  label="Aircraft"
                  placeholder="Select"
                  className="h-9 text-sm"
                  options={[
                    { value: 'b737', label: 'Boeing 737' },
                    { value: 'a320', label: 'Airbus A320' },
                  ]}
                />
                <div className="pt-2">
                  <ModernSwitch label="Active" description="Flight is operational" />
                </div>
              </div>
            </div>

            {/* Wide Form */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">WIDE FORM LAYOUT</h4>
              <div className="p-6 bg-white border rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ModernInput label="Flight Number" placeholder="FA-1247" />
                  <ModernInput label="Origin" placeholder="JFK" />
                  <ModernInput label="Destination" placeholder="LAX" />
                  <DatePicker label="Date" fromYear={2024} toYear={2024} />
                </div>
                <div className="mt-4">
                  <ModernTextarea
                    label="Additional Notes"
                    placeholder="Enter any additional flight information..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available Form component configurations in the Fleet AI design system.',
      },
    },
  },
};
