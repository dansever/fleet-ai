import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AlertTriangle, Archive, Copy, Edit, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { ConfirmationPopover, FileUploadPopover } from './Popover';

const meta: Meta = {
  title: 'Components/Popover',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A collection of popover components for Fleet AI applications. Includes confirmation dialogs and file upload functionality with modern design and smooth interactions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Single comprehensive story showing both popover types
export const PopoverShowcase: Story = {
  render: () => {
    const [controlledOpen, setControlledOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);

    return (
      <div className="space-y-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Fleet AI Popover Components</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Interactive confirmation dialogs and file upload popovers with modern design
          </p>
          <p className="text-sm text-muted-foreground">
            Featuring drag & drop support, controlled state, custom alignment, and Fleet AI theming
          </p>
        </div>

        {/* Main Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Confirmation Popovers Section */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-xl font-semibold mb-2">Confirmation Popovers</h2>
              <p className="text-sm text-muted-foreground">
                Contextual confirmation dialogs with different intent levels
              </p>
            </div>

            {/* Basic Examples */}
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">BASIC EXAMPLES</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Danger Action</p>
                    <p className="text-xs text-muted-foreground">Destructive operations</p>
                  </div>
                  <ConfirmationPopover
                    trigger={
                      <Button intent="danger" text="Delete Aircraft" icon={Trash2} size="sm" />
                    }
                    popoverIntent="danger"
                    title="Delete Aircraft N123FA"
                    description="This will permanently remove the aircraft and all associated records. This action cannot be undone."
                    confirmText="Delete Aircraft"
                    onConfirm={() => console.log('Aircraft N123FA deleted')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Warning Action</p>
                    <p className="text-xs text-muted-foreground">Potentially risky operations</p>
                  </div>
                  <ConfirmationPopover
                    trigger={
                      <Button intent="secondary" text="Archive Flight" icon={Archive} size="sm" />
                    }
                    popoverIntent="warning"
                    title="Archive Flight Record"
                    description="The flight will be moved to archived records and hidden from active views. You can restore it later."
                    confirmText="Archive"
                    onConfirm={() => console.log('Flight archived')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Info Action</p>
                    <p className="text-xs text-muted-foreground">Standard confirmations</p>
                  </div>
                  <ConfirmationPopover
                    trigger={<Button intent="primary" text="Save Changes" icon={Save} size="sm" />}
                    popoverIntent="info"
                    title="Save Configuration"
                    description="Your changes will be applied to all active aircraft in the fleet."
                    confirmText="Save"
                    onConfirm={() => console.log('Changes saved')}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Examples */}
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">ADVANCED FEATURES</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div>
                    <p className="font-medium text-sm">Controlled State</p>
                    <p className="text-xs text-muted-foreground">
                      State: {controlledOpen ? 'Open' : 'Closed'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      intent="ghost"
                      text="Open"
                      size="sm"
                      onClick={() => setControlledOpen(true)}
                    />
                    <ConfirmationPopover
                      trigger={<Button intent="danger" text="Controlled Delete" size="sm" />}
                      popoverIntent="danger"
                      title="Controlled Confirmation"
                      description="This popover is controlled by external state for complex workflows."
                      confirmText="Delete"
                      open={controlledOpen}
                      onOpenChange={setControlledOpen}
                      onConfirm={() => {
                        console.log('Controlled delete confirmed');
                        setControlledOpen(false);
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Custom Alignment</p>
                    <p className="text-xs text-muted-foreground">Different popover positions</p>
                  </div>
                  <div className="flex gap-1">
                    <ConfirmationPopover
                      trigger={<Button intent="ghost" text="Start" size="sm" />}
                      popoverIntent="info"
                      title="Start Aligned"
                      description="Popover aligned to the start."
                      confirmText="OK"
                      popoverContentAlign="start"
                      onConfirm={() => console.log('Start aligned')}
                    />
                    <ConfirmationPopover
                      trigger={<Button intent="ghost" text="Center" size="sm" />}
                      popoverIntent="info"
                      title="Center Aligned"
                      description="Popover aligned to the center."
                      confirmText="OK"
                      popoverContentAlign="center"
                      onConfirm={() => console.log('Center aligned')}
                    />
                    <ConfirmationPopover
                      trigger={<Button intent="ghost" text="End" size="sm" />}
                      popoverIntent="info"
                      title="End Aligned"
                      description="Popover aligned to the end."
                      confirmText="OK"
                      popoverContentAlign="end"
                      onConfirm={() => console.log('End aligned')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Popovers Section */}
          <div className="space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-xl font-semibold mb-2">File Upload Popovers</h2>
              <p className="text-sm text-muted-foreground">
                Drag & drop file uploads with validation and custom content
              </p>
            </div>

            {/* Basic Examples */}
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">BASIC EXAMPLES</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Document Upload</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX files</p>
                  </div>
                  <FileUploadPopover
                    triggerText="Upload Documents"
                    triggerIntent="primary"
                    triggerSize="sm"
                    accept=".pdf,.doc,.docx"
                    maxSize={5}
                    onSend={(file) => console.log('Document uploaded:', file.name)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Image Upload</p>
                    <p className="text-xs text-muted-foreground">All image formats</p>
                  </div>
                  <FileUploadPopover
                    triggerText="Add Images"
                    triggerIntent="secondary"
                    triggerSize="sm"
                    accept="image/*"
                    maxSize={10}
                    onSend={(file) => console.log('Image uploaded:', file.name)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Data Import</p>
                    <p className="text-xs text-muted-foreground">CSV, XLSX, JSON files</p>
                  </div>
                  <FileUploadPopover
                    triggerText="Import Data"
                    triggerIntent="primary"
                    triggerSize="sm"
                    accept=".csv,.xlsx,.json"
                    maxSize={25}
                    onSend={(file) => console.log('Data imported:', file.name)}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Examples */}
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">ADVANCED FEATURES</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium text-sm">Custom Content</p>
                    <p className="text-xs text-muted-foreground">
                      State: {uploadOpen ? 'Open' : 'Closed'}
                    </p>
                  </div>
                  <FileUploadPopover
                    triggerText="Advanced Upload"
                    triggerIntent="primary"
                    triggerSize="sm"
                    accept="*/*"
                    maxSize={50}
                    open={uploadOpen}
                    onOpenChange={setUploadOpen}
                    onSend={(file) => {
                      console.log('Advanced upload:', file.name);
                      setUploadOpen(false);
                    }}
                  >
                    {({ close }) => (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium">Additional Options</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            intent="secondary"
                            text="Scan QR"
                            size="sm"
                            onClick={() => {
                              console.log('QR scan initiated');
                              close();
                            }}
                          />
                          <Button
                            intent="ghost"
                            text="Import URL"
                            size="sm"
                            onClick={() => {
                              console.log('URL import initiated');
                              close();
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </FileUploadPopover>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Different Sizes</p>
                    <p className="text-xs text-muted-foreground">
                      Small, medium, and large buttons
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <FileUploadPopover
                      triggerText="SM"
                      triggerIntent="secondary"
                      triggerSize="sm"
                      onSend={(file) => console.log('Small upload:', file.name)}
                    />
                    <FileUploadPopover
                      triggerText="MD"
                      triggerIntent="secondary"
                      triggerSize="md"
                      onSend={(file) => console.log('Medium upload:', file.name)}
                    />
                    <FileUploadPopover
                      triggerText="LG"
                      triggerIntent="secondary"
                      triggerSize="lg"
                      onSend={(file) => console.log('Large upload:', file.name)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Fleet AI Examples */}
        <div className="space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-xl font-semibold mb-2">Fleet AI Application Examples</h2>
            <p className="text-sm text-muted-foreground">
              Real-world usage scenarios in fleet management contexts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aircraft Management Card */}
            <div className="border rounded-xl p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Boeing 737-800 (N123FA)</h4>
                  <p className="text-sm text-muted-foreground">
                    Last flight: FL-1234 • Status: Active
                  </p>
                </div>
                <div className="flex gap-2">
                  <ConfirmationPopover
                    trigger={<Button intent="secondary" icon={Edit} size="sm" />}
                    popoverIntent="info"
                    title="Update Aircraft Configuration"
                    description="Changes will affect future flight assignments and passenger capacity calculations."
                    confirmText="Update"
                    onConfirm={() => console.log('Aircraft updated')}
                  />
                  <ConfirmationPopover
                    trigger={<Button intent="danger" icon={Trash2} size="sm" />}
                    popoverIntent="danger"
                    title="Remove Aircraft from Fleet"
                    description="This will permanently remove N123FA from your fleet. All historical data will be archived."
                    confirmText="Remove"
                    onConfirm={() => console.log('Aircraft removed')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <FileUploadPopover
                  triggerText="Upload Manual"
                  triggerIntent="secondary"
                  triggerSize="sm"
                  accept=".pdf"
                  maxSize={100}
                  onSend={(file) => console.log('Manual uploaded for N123FA:', file.name)}
                />
                <FileUploadPopover
                  triggerText="Add Photos"
                  triggerIntent="ghost"
                  triggerSize="sm"
                  accept="image/*"
                  maxSize={25}
                  onSend={(file) => console.log('Photo uploaded for N123FA:', file.name)}
                />
              </div>
            </div>

            {/* Flight Operations Card */}
            <div className="border rounded-xl p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Flight FL-1234</h4>
                  <p className="text-sm text-muted-foreground">JFK → LAX • Scheduled: 14:30 UTC</p>
                </div>
                <div className="flex gap-2">
                  <ConfirmationPopover
                    trigger={<Button intent="secondary" icon={Copy} size="sm" />}
                    popoverIntent="info"
                    title="Duplicate Flight"
                    description="Create a new flight with the same route and schedule for next week."
                    confirmText="Duplicate"
                    onConfirm={() => console.log('Flight duplicated')}
                  />
                  <ConfirmationPopover
                    trigger={<Button intent="warning" icon={AlertTriangle} size="sm" />}
                    popoverIntent="danger"
                    title="Cancel Flight"
                    description="This will cancel FL-1234 and automatically process passenger refunds."
                    confirmText="Cancel Flight"
                    onConfirm={() => console.log('Flight cancelled')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <FileUploadPopover
                  triggerText="Flight Plan"
                  triggerIntent="secondary"
                  triggerSize="sm"
                  accept=".pdf,.json"
                  maxSize={10}
                  onSend={(file) => console.log('Flight plan uploaded:', file.name)}
                />
                <FileUploadPopover
                  triggerText="Weather Data"
                  triggerIntent="ghost"
                  triggerSize="sm"
                  accept=".json,.xml"
                  maxSize={5}
                  onSend={(file) => console.log('Weather data uploaded:', file.name)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Usage Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Confirmation Popovers</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • Use <code>danger</code> for destructive actions
                </li>
                <li>
                  • Use <code>warning</code> for potentially risky operations
                </li>
                <li>
                  • Use <code>info</code> for standard confirmations
                </li>
                <li>• Provide clear, specific descriptions</li>
                <li>• Use controlled state for complex workflows</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">File Upload Popovers</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • Specify appropriate file types with <code>accept</code>
                </li>
                <li>
                  • Set reasonable <code>maxSize</code> limits
                </li>
                <li>• Support drag & drop for better UX</li>
                <li>• Use custom content for additional options</li>
                <li>• Handle file validation and error states</li>
              </ul>
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
          'Comprehensive showcase of Fleet AI popover components including confirmation dialogs and file upload functionality with real-world examples and usage guidelines.',
      },
    },
  },
};
