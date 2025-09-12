'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/stories/Button/Button';
import { useState } from 'react';
// Temporarily using a simple alert div instead of shadcn/ui Alert component
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { updateExtractors } from '@/modules/admin/admin.client';
import { getBucketFolderCounts } from '@/modules/storage/storage.client';
import { ModernInput } from '@/stories/Form/Form';
import { ConfirmationPopover } from '@/stories/Popover/Popover';
import { Tabs } from '@/stories/Tabs/Tabs';
import {
  AlertCircle,
  CheckCircle,
  Cloud,
  Database,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExtractionAgent {
  name: string;
  status: 'up-to-date' | 'needs-update' | 'updating';
  lastUpdated: string;
  schemaVersion: string;
}

interface StorageBucket {
  name: string;
  created_at: string;
  public: boolean;
  file_size_limit?: number;
}

interface StorageFile {
  name: string;
  created_at: string;
  public: boolean;
  file_size_limit?: number;
}

interface BucketFolderCounts {
  contracts: number;
  invoices: number;
}

export default function AdminClientPage() {
  // LlamaCloud State
  const [agents, setAgents] = useState<ExtractionAgent[]>([
    {
      name: 'fleet-ai-contract-extractor',
      status: 'up-to-date',
      lastUpdated: '2024-01-15T10:30:00Z',
      schemaVersion: '1.2.0',
    },
    {
      name: 'fleet-ai-fuel-bid-extractor',
      status: 'needs-update',
      lastUpdated: '2024-01-10T14:20:00Z',
      schemaVersion: '1.1.0',
    },
    {
      name: 'fleet-ai-rfq-extractor',
      status: 'up-to-date',
      lastUpdated: '2024-01-14T09:15:00Z',
      schemaVersion: '1.3.0',
    },
  ]);

  // Storage State
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [bucketFiles, setBucketFiles] = useState<StorageFile[]>([]);
  const [bucketFolderCounts, setBucketFolderCounts] = useState<Record<string, BucketFolderCounts>>(
    {},
  );
  const [newBucketName, setNewBucketName] = useState('');
  const [isPublicBucket, setIsPublicBucket] = useState(false);
  const [loading, setLoading] = useState({
    agents: false,
    buckets: false,
    createBucket: false,
    folderCounts: false,
  });
  const [alerts, setAlerts] = useState<{ type: 'success' | 'error'; message: string }[]>([]);

  const addAlert = (type: 'success' | 'error', message: string) => {
    setAlerts((prev) => [...prev, { type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.slice(1));
    }, 5000);
  };

  const updateAllExtractors = async () => {
    try {
      await updateExtractors();
      toast.success('All agents updated successfully');
    } catch (error) {
      toast.error('Failed to update all agents');
      console.error('Error updating all agents:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

  // Storage Functions
  const loadBuckets = async () => {
    setLoading((prev) => ({ ...prev, buckets: true }));

    try {
      const response = await fetch('/api/storage/buckets');
      if (response.ok) {
        const data = await response.json();
        setBuckets(data.buckets || []);
        // Load folder counts for all buckets
        await loadAllBucketFolderCounts(data.buckets || []);
      } else {
        addAlert('error', 'Failed to load storage buckets');
      }
    } catch (error) {
      addAlert('error', 'Failed to load storage buckets');
    } finally {
      setLoading((prev) => ({ ...prev, buckets: false }));
    }
  };

  const loadAllBucketFolderCounts = async (bucketsToLoad: StorageBucket[]) => {
    setLoading((prev) => ({ ...prev, folderCounts: true }));

    try {
      const folderCountsPromises = bucketsToLoad.map(async (bucket) => {
        try {
          const counts = await getBucketFolderCounts(bucket.name);
          return { bucketName: bucket.name, counts: counts.data };
        } catch (error) {
          console.error(`Failed to load folder counts for bucket ${bucket.name}:`, error);
          return { bucketName: bucket.name, counts: { contracts: 0, invoices: 0 } };
        }
      });

      const results = await Promise.all(folderCountsPromises);
      const countsMap = results.reduce(
        (acc, { bucketName, counts }) => {
          acc[bucketName] = counts;
          return acc;
        },
        {} as Record<string, BucketFolderCounts>,
      );

      setBucketFolderCounts(countsMap);
    } catch (error) {
      console.error('Failed to load bucket folder counts:', error);
      addAlert('error', 'Failed to load folder counts');
    } finally {
      setLoading((prev) => ({ ...prev, folderCounts: false }));
    }
  };

  const loadBucketFiles = async (bucketName: string) => {
    console.log('Loading bucket files', bucketName);
    try {
      setLoading((prev) => ({ ...prev, bucketFiles: true }));
      const response = await fetch(`/api/storage/buckets/${bucketName}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Bucket files', data);
        setBucketFiles(data.files || []);
      } else {
        addAlert('error', 'Failed to load bucket files');
      }
    } catch (error) {
      addAlert('error', 'Failed to load bucket files');
    } finally {
      setLoading((prev) => ({ ...prev, bucketFiles: false }));
    }
  };

  const createBucket = async () => {
    if (!newBucketName.trim()) {
      addAlert('error', 'Bucket name is required');
      return;
    }

    setLoading((prev) => ({ ...prev, createBucket: true }));

    try {
      const response = await fetch('/api/storage/buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucketName: newBucketName.trim(),
          public: isPublicBucket,
        }),
      });

      if (response.ok) {
        addAlert('success', `Bucket "${newBucketName}" created successfully`);
        setNewBucketName('');
        setIsPublicBucket(false);
        await loadBuckets(); // Refresh the list and load folder counts
      } else {
        const error = await response.json();
        addAlert('error', error.error || 'Failed to create bucket');
      }
    } catch (error) {
      addAlert('error', 'Failed to create bucket');
    } finally {
      setLoading((prev) => ({ ...prev, createBucket: false }));
    }
  };

  const deleteBucket = async (bucketName: string) => {
    if (!confirm(`Are you sure you want to delete bucket "${bucketName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/storage/buckets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName }),
      });

      if (response.ok) {
        addAlert('success', `Bucket "${bucketName}" deleted successfully`);
        await loadBuckets(); // Refresh the list
      } else {
        const error = await response.json();
        addAlert('error', error.error || 'Failed to delete bucket');
      }
    } catch (error) {
      addAlert('error', 'Failed to delete bucket');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage system components and infrastructure</p>
        </div>
      </div>
      <Tabs
        tabs={[
          { label: 'Agents', icon: <Database />, value: 'agents' },
          { label: 'Storage', icon: <Cloud />, value: 'storage' },
        ]}
        defaultTab="agents"
        onTabChange={() => {
          console.log('tab changed');
        }}
      >
        <TabsContent value="agents">
          {/* Alerts */}
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border flex items-center gap-3 ${alert.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
            >
              {alert.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <div className={alert.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {alert.message}
              </div>
            </div>
          ))}

          {/* LlamaCloud Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cloud className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>LlamaCloud Extraction Agents</CardTitle>
                    <CardDescription>
                      Update Pydantic schemas for document extraction agents
                    </CardDescription>
                  </div>
                </div>
                <Button
                  intent="primary"
                  text="Update All"
                  icon={RefreshCw}
                  onClick={() => updateAllExtractors()}
                  iconPosition="right"
                  disabled={loading.agents || !agents.some((a) => a.status === 'needs-update')}
                  className="gap-2"
                  isLoading={loading.agents}
                />
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="storage">
          {/* Storage Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>Storage Management</CardTitle>
                  <CardDescription>Create and manage Supabase storage buckets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Bucket */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium">Create New Bucket</h3>
                <div className="flex flex-row items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bucket-name">Bucket Name</Label>
                    <ModernInput
                      id="bucket-name"
                      placeholder="my-new-bucket"
                      value={newBucketName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewBucketName(e.target.value)
                      }
                      disabled={loading.createBucket}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="public-bucket"
                        checked={isPublicBucket}
                        onCheckedChange={(checked) => setIsPublicBucket(checked as boolean)}
                        disabled={loading.createBucket}
                        className="w-5 h-5"
                      />
                      <Label htmlFor="public-bucket">Public bucket</Label>
                    </div>
                  </div>
                  <Button
                    onClick={() => createBucket()}
                    intent="primary"
                    text="Create Bucket"
                    icon={Plus}
                    disabled={loading.createBucket || !newBucketName.trim()}
                    isLoading={loading.createBucket}
                  />
                </div>
              </div>

              {/* Existing Buckets */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Existing Buckets</h3>
                  <Button
                    intent="secondary"
                    text="Refresh"
                    icon={RefreshCw}
                    onClick={loadBuckets}
                    disabled={loading.buckets}
                    isLoading={loading.buckets}
                  />
                </div>

                {buckets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No storage buckets found</p>
                    <p className="text-sm">Click "Refresh" to load existing buckets</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buckets.map((bucket) => {
                      const folderCounts = bucketFolderCounts[bucket.name];
                      return (
                        <div key={bucket.name} className="border rounded-lg p-4 space-y-3">
                          {/* Bucket Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{bucket.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  Created {new Date(bucket.created_at).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <Badge variant={bucket.public ? 'default' : 'secondary'}>
                                  {bucket.public ? 'Public' : 'Private'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                intent="primary"
                                text="View Files"
                                icon={FileText}
                                onClick={() => loadBucketFiles(bucket.name)}
                              />
                              <ConfirmationPopover
                                trigger={<Button intent="danger" text="Delete" icon={Trash2} />}
                                title="Delete Bucket"
                                popoverIntent="danger"
                                description="Are you sure you want to delete this bucket?"
                                onConfirm={() => deleteBucket(bucket.name)}
                              />
                            </div>
                          </div>

                          {/* Folder Counts */}
                          <div className="flex items-center gap-4 pl-4 border-l-2 border-gray-200">
                            <div className="flex items-center gap-2 text-sm">
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Contracts:</span>
                              <Badge variant="outline">
                                {loading.folderCounts ? '...' : (folderCounts?.contracts ?? 0)}{' '}
                                files
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <FolderOpen className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Invoices:</span>
                              <Badge variant="outline">
                                {loading.folderCounts ? '...' : (folderCounts?.invoices ?? 0)} files
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
