'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import { formatDate, formatFileSize } from '@/lib/core/formatters';
import { cn } from '@/lib/utils';
import { client as parseClient } from '@/modules/ai/parse';
import { documents, storage, workflows } from '@/modules/file-manager';
import { Button } from '@/stories/Button/Button';
import { BaseCard, ListItemCard } from '@/stories/Card/Card';
import { ModernInput } from '@/stories/Form/Form';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { StatusBadge } from '@/stories/StatusBadge/StatusBadge';
import { Tabs } from '@/stories/Tabs/Tabs';
import { ContractTerm, ExtractedContractData } from '@/types/contracts';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  Eye,
  File,
  FileText,
  Sparkles,
  Trash,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../context';

const documentsClient = documents.client;
const storageClient = storage.client;

interface Term {
  key: string;
  value: {
    type: string;
    value: string;
  };
  source: {
    page: number;
    span: number[];
    snippet: string;
  };
  section: string;
}

interface DocumentData {
  terms: Term[];
  summary: string;
  confidence: number;
}

interface DocumentViewerProps {
  data: DocumentData;
}

// Helper function to get file type icon and color
const getFileTypeConfig = (fileType: string | null) => {
  const type = fileType?.toLowerCase() || '';

  if (type.includes('pdf')) {
    return {
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      badgeColor: 'bg-red-100 text-red-700',
    };
  }
  if (type.includes('doc')) {
    return {
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-700',
    };
  }
  if (
    type.includes('image') ||
    type.includes('png') ||
    type.includes('jpg') ||
    type.includes('jpeg')
  ) {
    return {
      icon: File,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      badgeColor: 'bg-purple-100 text-purple-700',
    };
  }
  return {
    icon: File,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    badgeColor: 'bg-gray-100 text-gray-700',
  };
};

export function ContractDocument() {
  const {
    selectedContract,
    refreshContracts,
    documents,
    refreshDocuments,
    loading,
    setUploadLoading,
    addDocument,
    removeDocument,
    updateContract,
    selectedDocument,
    setSelectedDocument,
  } = useAirportHub();
  const [downloadFileLoading, setDownloadFileLoading] = useState(false);
  const [viewDocumentLoading, setViewDocumentLoading] = useState(false);
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState('');

  // File upload handler using workflow orchestrator
  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }

    setUploadLoading(true);

    try {
      // Use workflow orchestrator for complete processing with job tracking
      const result = await workflows.client.processDocument(file, {
        contractId: selectedContract.id,
        documentType: 'contract',
        trackProgress: true, // Enable job tracking and status indicator updates
        onProgress: (progress, message) => {
          // Optional: Additional progress handling if needed
          console.log(`Progress: ${progress}% - ${message}`);
        },
      });

      if (result.success && result.documentId) {
        // Fetch and add the newly created document
        const newDocument = await documentsClient.getDocumentById(result.documentId);
        addDocument(newDocument);
        toast.success('Document has been uploaded and processed');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to process file';
      toast.error(msg);
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewDocument = async (storagePath: string | null) => {
    if (!storagePath) return;

    setViewDocumentLoading(true);
    try {
      const signedUrl = await storageClient.getSignedUrl(storagePath, 300); // 5 minutes

      // Prefer opening in a new tab for preview; browsers may still download
      const fileName = storagePath.split('/').pop() || 'download';
      const link = window.document.createElement('a');
      link.href = signedUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = fileName; // hint to download with a name when applicable
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Document view started');
    } catch (error) {
      toast.error('Failed to view document');
      console.error(error);
    } finally {
      setViewDocumentLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (!document) return;

    try {
      setDeleteDocumentLoading(true);
      await documentsClient.deleteDocument(document.id);

      // Immediately update local state to reflect deletion
      removeDocument(document.id);
      toast.success('Document has been deleted');

      // Note: No need to call refreshDocuments() since we've already updated local state
      // The removeDocument function handles both state and cache updates
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    } finally {
      setDeleteDocumentLoading(false);
    }
  };

  const handleParseDocument = async (file: File) => {
    try {
      await parseClient.parseFile(file);
      toast.success('This document has been parsed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to parse document');
    }
  };

  const extractedData = selectedDocument?.extractedData as ExtractedContractData | undefined;
  const filteredTerms = Array.isArray(extractedData?.terms)
    ? extractedData.terms.filter((term: ContractTerm) => {
        const searchLower = searchTerms.toLowerCase();
        const keyMatch = term.key.toLowerCase().includes(searchLower);
        const contentMatch = term.value?.value?.toString().toLowerCase().includes(searchLower);
        return keyMatch || contentMatch;
      })
    : [];

  return (
    <div className="grid grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      <BaseCard
        className="flex flex-col col-span-1 gap-0 px-2"
        headerClassName="px-0 py-2"
        title="Files"
        actions={
          <FileUploadPopover
            onSend={handleUploadContractFile}
            trigger={<Button size="sm" intent="add" text="Upload" icon={Upload} />}
          />
        }
        contentClassName="px-0"
      >
        {loading.documents ? (
          <div className="flex flex-col gap-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No documents yet</p>
            <p className="text-xs mt-1">Upload a document to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((document) => {
              const fileConfig = getFileTypeConfig(document.fileType);
              const FileIcon = fileConfig.icon;
              const isSelected = selectedDocument?.id === document.id;

              return (
                <ListItemCard
                  key={document.id}
                  onClick={() => setSelectedDocument(document)}
                  isSelected={isSelected}
                  title={document.fileName || 'Untitled'}
                  className="rounded-sm"
                >
                  <div className="flex flex-col items-start gap-1 py-1">
                    <div className="flex items-center gap-1">
                      <FileIcon className={`flex-shrink-0 w-4 h-4 ${fileConfig.color}`} />
                      <Badge className={`text-xs px-2 py-0 ${fileConfig.badgeColor}`}>
                        {document.fileType || 'FILE'}
                      </Badge>
                    </div>
                  </div>

                  {/* Date info */}
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Updated {formatDate(document.updatedAt)}
                  </div>
                </ListItemCard>
              );
            })}
          </div>
        )}
      </BaseCard>
      <BaseCard
        cardType="inner"
        className="col-start-2 col-span-full"
        header={
          selectedDocument ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {(() => {
                  const fileConfig = getFileTypeConfig(selectedDocument.fileType);
                  const FileIcon = fileConfig.icon;
                  return (
                    <div className={`p-3 rounded-xl ${fileConfig.bgColor}`}>
                      <FileIcon className={`w-6 h-6 ${fileConfig.color}`} />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-slate-900 truncate">
                    {selectedDocument.fileName || 'Untitled Document'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getFileTypeConfig(selectedDocument.fileType).badgeColor}>
                      {selectedDocument.fileType || 'FILE'}
                    </Badge>
                    {selectedDocument.extractedAt ? (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Processed
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Processing
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  intent="secondary"
                  icon={Download}
                  text="Download"
                  size="sm"
                  onClick={() => handleViewDocument(selectedDocument.storagePath ?? '')}
                  disabled={viewDocumentLoading}
                  isLoading={viewDocumentLoading}
                />
                <ConfirmationPopover
                  onConfirm={() => handleDeleteDocument(selectedDocument.id)}
                  trigger={
                    <Button
                      intent="secondary"
                      size="sm"
                      icon={Trash}
                      text="Delete"
                      disabled={deleteDocumentLoading}
                      isLoading={deleteDocumentLoading}
                    />
                  }
                  popoverIntent="danger"
                  title="Delete Document"
                  description="Are you sure you want to delete this document? This action cannot be undone."
                />
              </div>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {loading.documents ? (
            <div className="flex flex-col gap-6 p-4">
              {/* Header Skeleton */}
              <div className="p-4 rounded-xl border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
              {/* Metadata Grid Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-6 w-4/5" />
                  </div>
                ))}
              </div>
              {/* Content Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 gap-4 flex flex-col items-center">
              <FileText className="w-16 h-16 text-gray-300" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">No documents found</h2>
                <p className="text-sm mt-1">Upload documents to this contract to get started</p>
              </div>
            </div>
          ) : !selectedDocument ? (
            <div className="text-center text-muted-foreground py-16 gap-4 flex flex-col items-center">
              <Eye className="w-16 h-16 text-gray-300" />
              <div>
                <h2 className="text-lg font-semibold text-gray-700">Select a document to view</h2>
                <p className="text-sm mt-1">
                  Choose a document from the sidebar to see its details
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    File Size
                  </span>
                  <p className="font-semibold text-blue-700">
                    {selectedDocument.fileSize
                      ? formatFileSize(selectedDocument.fileSize)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100">
                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    Created
                  </span>
                  <p className="font-semibold text-purple-700">
                    {selectedDocument.createdAt
                      ? formatDate(selectedDocument.createdAt)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                    Updated
                  </span>
                  <p className="font-semibold text-indigo-700">
                    {selectedDocument.updatedAt
                      ? formatDate(selectedDocument.updatedAt)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    {selectedDocument.confidence ? 'AI Confidence' : 'Status'}
                  </span>
                  <p className="font-semibold text-emerald-700">
                    {selectedDocument.confidence
                      ? `${(parseFloat(selectedDocument.confidence.toString()) * 100).toFixed(0)}%`
                      : selectedDocument.extractedAt
                        ? 'Ready'
                        : 'Processing'}
                  </p>
                </div>
              </div>

              {/* Document Content */}
              <Separator />

              <Tabs
                tabs={[
                  { label: 'Summary', value: 'summary', icon: <FileText /> },
                  { label: 'Extracted Data', value: 'extractedData', icon: <FileText /> },
                  { label: 'Content', value: 'content', icon: <FileText /> },
                ]}
                defaultTab="summary"
                onTabChange={() => {}}
              >
                <TabsContent value="summary">
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 p-6">
                      {selectedDocument.summary ? (
                        <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {selectedDocument.summary}
                        </p>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium">No summary available</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Summary will be generated after document processing completes
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="extractedData">
                  <div className="flex flex-col gap-4">
                    {/* AI Insights Section */}
                    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">AI Insights</h4>
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          Smart Analysis
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {/* Example AI Insights - These will be generated by AI agents later */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                          <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
                            <Clock className="w-4 h-4 text-amber-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-amber-900">
                              Contract Expiration
                            </p>
                            <p className="text-xs text-amber-800 mt-1">
                              This contract expires in 45 days. Consider initiating renewal
                              discussions.
                            </p>
                          </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-green-900">Potential Savings</p>
                            <p className="text-xs text-green-800 mt-1">
                              Market analysis suggests 12% cost reduction opportunity on similar
                              services.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="sticky top-0 z-10 bg-white pb-2">
                      <ModernInput
                        placeholder="Search extracted terms and data..."
                        value={searchTerms}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerms(e.target.value)
                        }
                      />
                    </div>

                    {/* Extracted Terms Table */}
                    {Array.isArray(filteredTerms) && filteredTerms.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                        {filteredTerms.map((term, index) => (
                          <TermCard key={index} term={term as Term} />
                        ))}
                      </div>
                    ) : extractedData?.terms ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-sm font-medium">No matching terms found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No extracted data available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Data will appear here after document processing completes
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="content">
                  <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      {selectedDocument.content ? (
                        <div className="max-h-[600px] overflow-y-auto">
                          <p className="font-serif p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {selectedDocument.content}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium">No content extracted</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Text content will be extracted during processing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </BaseCard>
    </div>
  );
}

function TermCard({ term }: { term: Term }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(term.value.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Copied to clipboard');
  };

  return (
    <BaseCard
      cardType="inner"
      className="gap-0"
      headerClassName="px-4 py-2"
      contentClassName="px-4"
      title={term.key}
      subtitle={<StatusBadge status="default" text={term.section} />}
      actions={<Button intent="ghost" onClick={handleCopy} icon={Copy} />}
    >
      <div className="space-y-2">
        <div className="text-sm leading-relaxed text-foreground/90">{term.value.value}</div>
        <Separator />
        {/* Source Quote Section */}
        <div className="border-border/50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Source Quote</span>
              <Badge variant="outline" className="text-xs">
                Page {term.source.page}
              </Badge>
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <div
            className={cn(
              'grid transition-all duration-200 ease-in-out',
              isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed font-serif">
                  "{term.source.snippet}"
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>
                    Span: {term.source.span[0]}-{term.source.span[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>{' '}
      </div>
    </BaseCard>
  );
}
