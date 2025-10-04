'use client';

import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TabsContent } from '@/components/ui/tabs';
import { formatDate, formatFileSize } from '@/lib/core/formatters';
import { client as parseClient } from '@/modules/ai/parse';
import { client as documentsClient } from '@/modules/documents/documents';
import { client as filesClient } from '@/modules/files';
import { client as storageClient } from '@/modules/storage';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernInput } from '@/stories/Form/Form';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { Tabs } from '@/stories/Tabs/Tabs';
import { ContractTerm, ExtractedContractData } from '@/types/contracts';
import { CheckCircle2, Clock, Copy, Eye, File, FileText, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../context';

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

  // Handle file upload for contract extraction
  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }
    setUploadLoading(true);
    try {
      // Process the new document using unified files module
      const result = await filesClient.uploadAndProcessFile(file, {
        documentType: 'contract',
        parentId: selectedContract.id,
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success('Document has been uploaded');

      // Refresh documents to get the newly created document and update both cache and UI
      await refreshDocuments();

      // Refresh contracts as document processing might have updated contract terms
      // This ensures contract terms are updated in the UI
      refreshContracts();
    } catch (error) {
      toast.error('Failed to process contract file');
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
    const documentToDelete = documents.find((doc) => doc.id === documentId);
    if (!documentToDelete) return;

    try {
      setDeleteDocumentLoading(true);
      // Cascade logic already implemented in the client
      await documentsClient.deleteDocument(documentToDelete.id, documentToDelete.storagePath ?? '');

      // Immediately update local state to reflect deletion
      removeDocument(documentToDelete.id);

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

  const copyMessage = (message: string | number | boolean) => {
    navigator.clipboard.writeText(message.toString());
    toast.info('Copied to clipboard');
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
    <div className="grid lg:grid-cols-4 gap-4">
      <BaseCard
        className="flex flex-col gap-3 lg:col-span-1"
        title="Uploaded Files"
        actions={
          <FileUploadPopover
            onSend={handleUploadContractFile}
            trigger={<Button intent="add" icon={Upload} />}
          />
        }
      >
        {documents.length === 0 ? (
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
                <button
                  key={document.id}
                  onClick={() => setSelectedDocument(document)}
                  className={`
                    flex flex-col gap-2 p-3 rounded-xl border-2 transition-all
                    hover:shadow-md hover:scale-[1.02] cursor-pointer text-left
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:border-gray-200'
                    }
                  `}
                >
                  {/* Header with icon and name */}
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-lg ${fileConfig.bgColor} flex-shrink-0`}>
                      <FileIcon className={`w-4 h-4 ${fileConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.fileName || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs px-2 py-0 ${fileConfig.badgeColor}`}>
                          {document.fileType?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.fileSize || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Processing status */}
                  {document.extractedAt ? (
                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Processed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                      <Clock className="w-3 h-3" />
                      <span>Processing...</span>
                    </div>
                  )}

                  {/* Date info */}
                  <div className="text-xs text-gray-500 border-t pt-2">
                    Updated {formatDate(document.updatedAt)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </BaseCard>
      <BaseCard className="lg:col-span-3" title="File Details">
        <CardContent className="flex flex-col gap-4">
          {documents.length === 0 ? (
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
            <div className="flex flex-col gap-6">
              {/* Document Header */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
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
                        {selectedDocument.fileType?.toUpperCase() || 'FILE'}
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
                    icon={Eye}
                    text="View"
                    onClick={() => handleViewDocument(selectedDocument.storagePath ?? '')}
                    disabled={viewDocumentLoading}
                    isLoading={viewDocumentLoading}
                  />
                  <ConfirmationPopover
                    onConfirm={() => handleDeleteDocument(selectedDocument.id)}
                    trigger={
                      <Button
                        intent="secondary"
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

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    File Size
                  </span>
                  <p className="text-lg font-semibold text-blue-900 mt-1">
                    {selectedDocument.fileSize
                      ? formatFileSize(selectedDocument.fileSize)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    Created
                  </span>
                  <p className="text-lg font-semibold text-purple-900 mt-1">
                    {selectedDocument.createdAt
                      ? formatDate(selectedDocument.createdAt)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                    Updated
                  </span>
                  <p className="text-lg font-semibold text-indigo-900 mt-1">
                    {selectedDocument.updatedAt
                      ? formatDate(selectedDocument.updatedAt)
                      : 'Unknown'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                    {selectedDocument.confidence ? 'AI Confidence' : 'Status'}
                  </span>
                  <p className="text-lg font-semibold text-emerald-900 mt-1">
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
                </TabsContent>

                <TabsContent value="extractedData">
                  <div className="flex flex-col gap-3">
                    <div className="sticky top-0 z-10 bg-white pb-2">
                      <ModernInput
                        placeholder="Search extracted terms and data..."
                        value={searchTerms}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearchTerms(e.target.value)
                        }
                      />
                    </div>
                    {Array.isArray(filteredTerms) && filteredTerms.length > 0 ? (
                      <div className="grid gap-3">
                        {filteredTerms.map((term: ContractTerm, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-row items-center gap-2 mb-2">
                              <div className="font-semibold text-gray-900 flex-1">{term.key}</div>
                              <button
                                onClick={() => copyMessage(term.value?.value)}
                                className="p-2 rounded-lg hover:bg-white transition-colors"
                                title="Copy to clipboard"
                              >
                                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                              </button>
                            </div>
                            <div className="text-sm text-gray-700 bg-white rounded-lg p-3 mb-2">
                              {term.value?.value}
                            </div>

                            {term.source?.snippet && (
                              <div className="text-xs text-gray-600 border-l-3 border-blue-400 pl-3 py-1 bg-blue-50 rounded-r italic">
                                "{term.source.snippet}"
                              </div>
                            )}
                          </div>
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
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    {selectedDocument.content ? (
                      <div className="max-h-[600px] overflow-y-auto">
                        <pre className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                          {selectedDocument.content}
                        </pre>
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </BaseCard>
    </div>
  );
}
