import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AlertTriangle,
  Archive,
  Calendar,
  Clock,
  Download,
  Edit,
  MoreVertical,
  Plane,
  Plus,
  Send,
  Share,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { BadgeGroup } from '../Card/Card';
import { KeyValuePair } from '../KeyValuePair/KeyValuePair';
import { ConfirmationPopover, FileUploadPopover } from './Popover';

const meta: Meta<typeof ConfirmationPopover> = {
  title: 'Components/Popover',
  component: ConfirmationPopover,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A collection of popover components for Fleet AI applications. Includes confirmation popovers for destructive actions and file upload popovers for document management.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmationPopover>;

// Comprehensive Popover Showcase - All variants in one story
export const AllPopoverVariants: Story = {
  render: () => {
    // State for interactive examples
    const [uploadCount, setUploadCount] = useState(0);

    const handleFileUpload = (file: File) => {
      console.log('File uploaded:', file.name);
      setUploadCount((prev) => prev + 1);
    };

    const handleDeleteAction = () => {
      console.log('Delete action confirmed');
    };

    const handleArchiveAction = () => {
      console.log('Archive action confirmed');
    };

    return (
      <div className="space-y-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Fleet AI Popover Components
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete showcase of confirmation and file upload popovers for user interactions
          </p>
        </div>

        {/* Confirmation Popover Types */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Confirmation Popover Types
          </h2>
          <p className="text-muted-foreground mb-6">
            Three intent types for different confirmation scenarios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">DANGER INTENT</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="danger" text="Delete Aircraft" icon={Trash2} />}
                  popoverIntent="danger"
                  title="Delete Aircraft"
                  description="This will permanently remove the aircraft from your fleet. This action cannot be undone."
                  confirmText="Delete"
                  onConfirm={handleDeleteAction}
                />

                <ConfirmationPopover
                  trigger={<Button intent="danger" text="Cancel Flight" icon={X} size="sm" />}
                  popoverIntent="danger"
                  title="Cancel Flight"
                  description="This will cancel the flight and notify all passengers."
                  confirmText="Cancel Flight"
                  onConfirm={() => console.log('Flight cancelled')}
                />

                <ConfirmationPopover
                  trigger={<Button intent="danger" text="Remove Crew" icon={Users} size="sm" />}
                  popoverIntent="danger"
                  title="Remove Crew Member"
                  description="This will remove the crew member from all assigned flights."
                  confirmText="Remove"
                  onConfirm={() => console.log('Crew member removed')}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use for destructive actions like deleting, cancelling, or removing items
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">WARNING INTENT</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="warning" text="Ground Aircraft" icon={AlertTriangle} />}
                  popoverIntent="warning"
                  title="Ground Aircraft"
                  description="This will ground the aircraft and cancel all scheduled flights."
                  confirmText="Ground"
                  onConfirm={() => console.log('Aircraft grounded')}
                />

                <ConfirmationPopover
                  trigger={
                    <Button intent="warning" text="Archive Flight" icon={Archive} size="sm" />
                  }
                  popoverIntent="warning"
                  title="Archive Flight Record"
                  description="This will move the flight to archived records."
                  confirmText="Archive"
                  onConfirm={handleArchiveAction}
                />

                <ConfirmationPopover
                  trigger={
                    <Button intent="warning" text="Reset Data" icon={AlertTriangle} size="sm" />
                  }
                  popoverIntent="warning"
                  title="Reset System Data"
                  description="This will reset all system preferences to defaults."
                  confirmText="Reset"
                  onConfirm={() => console.log('Data reset')}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use for potentially disruptive actions that require caution
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">INFO INTENT</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="primary" text="Send Report" icon={Send} />}
                  popoverIntent="info"
                  title="Send Report"
                  description="This will send the maintenance report to all supervisors."
                  confirmText="Send"
                  onConfirm={() => console.log('Report sent')}
                />

                <ConfirmationPopover
                  trigger={<Button intent="primary" text="Export Data" icon={Download} size="sm" />}
                  popoverIntent="info"
                  title="Export Flight Data"
                  description="This will export all flight data for the selected period."
                  confirmText="Export"
                  onConfirm={() => console.log('Data exported')}
                />

                <ConfirmationPopover
                  trigger={<Button intent="primary" text="Share Schedule" icon={Share} size="sm" />}
                  popoverIntent="info"
                  title="Share Flight Schedule"
                  description="This will share the schedule with selected crew members."
                  confirmText="Share"
                  onConfirm={() => console.log('Schedule shared')}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use for informational confirmations and non-destructive actions
              </p>
            </div>
          </div>
        </section>

        {/* File Upload Popovers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            File Upload Popovers
          </h2>
          <p className="text-muted-foreground mb-6">
            File upload components with drag-and-drop support and file type restrictions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">DOCUMENT UPLOAD</h4>
              <FileUploadPopover
                trigger={<Button intent="primary" text="Upload Documents" icon={Upload} />}
                accept=".pdf,.doc,.docx,.txt"
                maxSize={10}
                onSend={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                For flight plans, maintenance reports, and official documents
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">IMAGE UPLOAD</h4>
              <FileUploadPopover
                trigger={<Button intent="secondary" text="Upload Images" icon={Upload} size="sm" />}
                accept="image/*"
                maxSize={5}
                onSend={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                For aircraft photos, damage reports, and visual documentation
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">ANY FILE TYPE</h4>
              <FileUploadPopover
                trigger={<Button intent="success" text="Upload Any File" icon={Upload} />}
                accept="*/*"
                maxSize={25}
                onSend={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                For any type of file with larger size limit
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">SPREADSHEET UPLOAD</h4>
              <FileUploadPopover
                trigger={<Button intent="primary" text="Import Data" icon={Upload} />}
                accept=".xlsx,.xls,.csv"
                maxSize={15}
                onSend={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                For importing flight schedules, crew data, and analytics
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">COMPRESSED FILES</h4>
              <FileUploadPopover
                trigger={<Button intent="secondary" text="Upload Archive" icon={Upload} />}
                accept=".zip,.rar,.7z"
                maxSize={50}
                onSend={handleFileUpload}
              />
              <p className="text-xs text-muted-foreground">
                For bulk uploads and compressed document collections
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">UPLOAD STATUS</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Files uploaded: {uploadCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload counter updates when files are successfully processed
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
            Real-world popover usage in fleet management scenarios
          </p>

          <div className="space-y-8">
            {/* Aircraft Management Actions */}
            <div className="space-y-4">
              <h4 className="font-medium">Aircraft Management Actions</h4>
              <div className="p-6 bg-white border rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-sm text-muted-foreground">AIRCRAFT N737BA</h5>
                    <div className="space-y-0">
                      <KeyValuePair label="Status" value="Operational" valueType="string" />
                      <KeyValuePair label="Next Maintenance" value="2024-03-15" valueType="date" />
                      <KeyValuePair label="Flight Hours" value={4250.75} valueType="number" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-sm text-muted-foreground">ACTIONS</h5>
                    <div className="flex flex-wrap gap-2">
                      <ConfirmationPopover
                        trigger={
                          <Button intent="warning" text="Ground" icon={AlertTriangle} size="sm" />
                        }
                        popoverIntent="warning"
                        title="Ground Aircraft N737BA"
                        description="This will immediately ground the aircraft and cancel 3 scheduled flights."
                        confirmText="Ground Aircraft"
                        onConfirm={() => console.log('Aircraft N737BA grounded')}
                      />

                      <FileUploadPopover
                        trigger={
                          <Button intent="secondary" text="Upload Docs" icon={Upload} size="sm" />
                        }
                        accept=".pdf,.doc,.docx"
                        maxSize={10}
                        onSend={(file) => console.log('Aircraft document uploaded:', file.name)}
                      />

                      <ConfirmationPopover
                        trigger={<Button intent="danger" text="Retire" icon={Archive} size="sm" />}
                        popoverIntent="danger"
                        title="Retire Aircraft"
                        description="This will permanently retire N737BA from the active fleet."
                        confirmText="Retire"
                        onConfirm={() => console.log('Aircraft retired')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Operations Dashboard */}
            <div className="space-y-4">
              <h4 className="font-medium">Flight Operations Dashboard</h4>
              <div className="p-6 bg-white border rounded-xl">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">18</div>
                      <div className="text-sm text-muted-foreground">Active Flights</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-muted-foreground">Delayed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">1</div>
                      <div className="text-sm text-muted-foreground">Cancelled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">42</div>
                      <div className="text-sm text-muted-foreground">Scheduled</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <FileUploadPopover
                      trigger={<Button intent="primary" text="Import Schedule" icon={Upload} />}
                      accept=".xlsx,.csv"
                      maxSize={5}
                      onSend={(file) => console.log('Schedule imported:', file.name)}
                    />

                    <ConfirmationPopover
                      trigger={<Button intent="primary" text="Export Report" icon={Download} />}
                      popoverIntent="info"
                      title="Export Daily Report"
                      description="This will generate and download today's operations report."
                      confirmText="Export"
                      onConfirm={() => console.log('Report exported')}
                    />

                    <ConfirmationPopover
                      trigger={
                        <Button intent="warning" text="Emergency Protocol" icon={AlertTriangle} />
                      }
                      popoverIntent="warning"
                      title="Activate Emergency Protocol"
                      description="This will activate emergency procedures and alert all relevant personnel."
                      confirmText="Activate"
                      onConfirm={() => console.log('Emergency protocol activated')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Management */}
            <div className="space-y-4">
              <h4 className="font-medium">Maintenance Management</h4>
              <div className="p-6 bg-white border rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-sm text-muted-foreground">
                      PENDING MAINTENANCE
                    </h5>
                    <BadgeGroup
                      tags={[
                        'A-Check Due: N737BA',
                        'Engine Inspection: N777CD',
                        'Tire Replacement: N320EF',
                        'Avionics Update: N787GH',
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-sm text-muted-foreground">
                      MAINTENANCE ACTIONS
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <FileUploadPopover
                        trigger={
                          <Button intent="primary" text="Upload Report" icon={Upload} size="sm" />
                        }
                        accept=".pdf,.doc,.jpg,.png"
                        maxSize={15}
                        onSend={(file) => console.log('Maintenance report uploaded:', file.name)}
                      />

                      <ConfirmationPopover
                        trigger={
                          <Button intent="success" text="Complete Task" icon={Plus} size="sm" />
                        }
                        popoverIntent="info"
                        title="Mark Task Complete"
                        description="This will mark the selected maintenance task as completed."
                        confirmText="Complete"
                        onConfirm={() => console.log('Maintenance task completed')}
                      />

                      <ConfirmationPopover
                        trigger={
                          <Button intent="warning" text="Defer Task" icon={Calendar} size="sm" />
                        }
                        popoverIntent="warning"
                        title="Defer Maintenance"
                        description="This will defer the maintenance task to a later date."
                        confirmText="Defer"
                        onConfirm={() => console.log('Maintenance deferred')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Management */}
            <div className="space-y-4">
              <h4 className="font-medium">Crew Management</h4>
              <div className="p-6 bg-white border rounded-xl">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Captain Sarah Johnson</h5>
                      <div className="text-xs text-muted-foreground">
                        <div>Flight Hours: 12,000</div>
                        <div>Type Rating: B737, B777</div>
                        <div>Status: Available</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">FO Mike Chen</h5>
                      <div className="text-xs text-muted-foreground">
                        <div>Flight Hours: 8,500</div>
                        <div>Type Rating: B737, A320</div>
                        <div>Status: On Duty</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">FA Emma Thompson</h5>
                      <div className="text-xs text-muted-foreground">
                        <div>Experience: 8 years</div>
                        <div>Certifications: Current</div>
                        <div>Status: Rest Period</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FileUploadPopover
                      trigger={
                        <Button intent="secondary" text="Upload Certs" icon={Upload} size="sm" />
                      }
                      accept=".pdf,.jpg,.png"
                      maxSize={5}
                      onSend={(file) => console.log('Certification uploaded:', file.name)}
                    />

                    <ConfirmationPopover
                      trigger={
                        <Button intent="primary" text="Assign Flight" icon={Plane} size="sm" />
                      }
                      popoverIntent="info"
                      title="Assign Crew to Flight"
                      description="This will assign the selected crew to flight FA-1247."
                      confirmText="Assign"
                      onConfirm={() => console.log('Crew assigned to flight')}
                    />

                    <ConfirmationPopover
                      trigger={
                        <Button intent="warning" text="Schedule Training" icon={Users} size="sm" />
                      }
                      popoverIntent="info"
                      title="Schedule Training"
                      description="This will schedule mandatory training for the selected crew member."
                      confirmText="Schedule"
                      onConfirm={() => console.log('Training scheduled')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popover Positioning */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Popover Positioning
          </h2>
          <p className="text-muted-foreground mb-6">
            Different alignment options for popover positioning
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">START ALIGNMENT</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="primary" text="Start Aligned" size="sm" />}
                  popoverIntent="info"
                  title="Start Alignment"
                  description="Popover aligns to the start of the trigger."
                  confirmText="Confirm"
                  popoverContentAlign="start"
                  onConfirm={() => console.log('Start aligned confirmed')}
                />

                <FileUploadPopover
                  trigger={
                    <Button intent="secondary" text="Upload (Start)" icon={Upload} size="sm" />
                  }
                  popoverContentAlign="start"
                  accept="*/*"
                  maxSize={5}
                  onSend={handleFileUpload}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">CENTER ALIGNMENT</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="primary" text="Center Aligned" size="sm" />}
                  popoverIntent="info"
                  title="Center Alignment"
                  description="Popover centers relative to the trigger."
                  confirmText="Confirm"
                  popoverContentAlign="center"
                  onConfirm={() => console.log('Center aligned confirmed')}
                />

                <FileUploadPopover
                  trigger={
                    <Button intent="secondary" text="Upload (Center)" icon={Upload} size="sm" />
                  }
                  popoverContentAlign="center"
                  accept="*/*"
                  maxSize={5}
                  onSend={handleFileUpload}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">END ALIGNMENT (Default)</h4>
              <div className="space-y-3">
                <ConfirmationPopover
                  trigger={<Button intent="primary" text="End Aligned" size="sm" />}
                  popoverIntent="info"
                  title="End Alignment"
                  description="Popover aligns to the end of the trigger."
                  confirmText="Confirm"
                  popoverContentAlign="end"
                  onConfirm={() => console.log('End aligned confirmed')}
                />

                <FileUploadPopover
                  trigger={
                    <Button intent="secondary" text="Upload (End)" icon={Upload} size="sm" />
                  }
                  popoverContentAlign="end"
                  accept="*/*"
                  maxSize={5}
                  onSend={handleFileUpload}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action Menus with Popovers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
            Action Menus with Popovers
          </h2>
          <p className="text-muted-foreground mb-6">
            Complex action menus combining multiple popover types
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Aircraft Actions Menu</h4>
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium">Boeing 737-800 (N737BA)</h5>
                    <p className="text-sm text-muted-foreground">Status: Operational</p>
                  </div>
                  <Button intent="secondary" icon={MoreVertical} size="sm" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button intent="primary" text="Edit" icon={Edit} size="sm" />

                  <FileUploadPopover
                    trigger={<Button intent="secondary" text="Docs" icon={Upload} size="sm" />}
                    accept=".pdf,.doc,.jpg"
                    maxSize={10}
                    onSend={(file) => console.log('Aircraft doc:', file.name)}
                  />

                  <ConfirmationPopover
                    trigger={
                      <Button intent="warning" text="Ground" icon={AlertTriangle} size="sm" />
                    }
                    popoverIntent="warning"
                    title="Ground Aircraft"
                    description="Ground N737BA and cancel scheduled flights?"
                    confirmText="Ground"
                    onConfirm={() => console.log('Aircraft grounded')}
                  />

                  <ConfirmationPopover
                    trigger={<Button intent="danger" text="Delete" icon={Trash2} size="sm" />}
                    popoverIntent="danger"
                    title="Delete Aircraft Record"
                    description="Permanently remove this aircraft from the fleet?"
                    confirmText="Delete"
                    onConfirm={() => console.log('Aircraft deleted')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Flight Actions Menu</h4>
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-medium">Flight FA-1247 (JFK → LAX)</h5>
                    <p className="text-sm text-muted-foreground">Departure: 10:30 AM</p>
                  </div>
                  <Button intent="secondary" icon={MoreVertical} size="sm" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button intent="primary" text="Edit" icon={Edit} size="sm" />

                  <FileUploadPopover
                    trigger={<Button intent="secondary" text="Plan" icon={Upload} size="sm" />}
                    accept=".pdf,.doc"
                    maxSize={5}
                    onSend={(file) => console.log('Flight plan:', file.name)}
                  />

                  <ConfirmationPopover
                    trigger={<Button intent="warning" text="Delay" icon={Clock} size="sm" />}
                    popoverIntent="warning"
                    title="Delay Flight"
                    description="Delay FA-1247 and notify passengers?"
                    confirmText="Delay"
                    onConfirm={() => console.log('Flight delayed')}
                  />

                  <ConfirmationPopover
                    trigger={<Button intent="danger" text="Cancel" icon={X} size="sm" />}
                    popoverIntent="danger"
                    title="Cancel Flight"
                    description="Cancel FA-1247 and process refunds?"
                    confirmText="Cancel"
                    onConfirm={() => console.log('Flight cancelled')}
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
          'Comprehensive showcase of all available Popover component configurations in the Fleet AI design system.',
      },
    },
  },
};
