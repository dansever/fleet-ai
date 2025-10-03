'use client';

import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatFileSize } from '@/lib/core/formatters';
import { client as parseClient } from '@/modules/ai/parse';
import { client as documentsClient } from '@/modules/documents/documents';
import { client as filesClient } from '@/modules/files';
import { client as storageClient } from '@/modules/storage';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ModernInput } from '@/stories/Form/Form';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { ContractTerm, ExtractedContractData } from '@/types/contracts';
import { ChevronDown, ChevronUp, Copy, Eye, File, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';
import { FileCarousel } from './FileCarousel';

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
  const [isContentExpanded, setIsContentExpanded] = useState(false);
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
    <BaseCard
      title="File Details"
      headerClassName="from-blue-100 via-purple-100 to-orange-100"
      actions={
        <FileUploadPopover
          onSend={handleUploadContractFile}
          trigger={<Button intent="add" text="Upload Document" icon={Upload} />}
        />
      }
    >
      <CardContent className="flex flex-col ">
        {/* Document Selection via FileCarousel */}
        {documents.length > 0 && (
          <div>
            <FileCarousel
              files={documents.map((document) => ({
                name: document.fileName ?? '',
                size: document.fileSize ?? 0,
                type: document.fileType ?? '',
                action: () => setSelectedDocument(document),
                isSelected: selectedDocument?.id === document.id,
              }))}
            />
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8 gap-4 flex flex-col items-center">
            <h2>No documents found for this contract</h2>
            <p>Upload documents to this contract to get started</p>
          </div>
        ) : !selectedDocument ? (
          <div className="text-center text-sm text-muted-foreground py-8 gap-4 flex flex-col items-center">
            <h2>Select a document to view its details</h2>
            <p>Choose a document from the dropdown above</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
              {/* Basic Information */}
              <div className="col-span-full flex items-center justify-between gap-2 rounded-xl p-2 bg-slate-100">
                <div className="flex items-center gap-2">
                  <File className="w-6 h-6" />
                  <p className="text-lg text-slate-900 font-mono px-2">
                    {selectedDocument.fileName || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    intent="secondary"
                    icon={Eye}
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

              <div>
                <span className="font-medium text-slate-600">File Type:</span>
                <p>{selectedDocument.fileType || 'Unknown'}</p>
              </div>

              <div>
                <span className="font-medium text-slate-600">File Size:</span>
                <p>
                  {selectedDocument.fileSize
                    ? formatFileSize(selectedDocument.fileSize)
                    : 'Unknown'}
                </p>
              </div>

              <div>
                <span className="font-medium text-slate-600">Created:</span>
                <p>
                  {selectedDocument.createdAt ? formatDate(selectedDocument.createdAt) : 'Unknown'}
                </p>
              </div>
              <div>
                <span className="font-medium text-slate-600">Updated:</span>
                <p>
                  {selectedDocument.updatedAt ? formatDate(selectedDocument.updatedAt) : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Document Content */}
            <Separator />

            <Tabs>
              <TabsList className="flex flex-row gap-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="extractedData">Extracted Data</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <p className="text-base rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-4 whitespace-pre-wrap leading-relaxed">
                  {selectedDocument.summary}
                </p>
              </TabsContent>
              <TabsContent value="extractedData">
                <div className="flex flex-col gap-2">
                  <ModernInput
                    placeholder="Search terms"
                    value={searchTerms}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerms(e.target.value)
                    }
                  />
                  {Array.isArray(filteredTerms) && filteredTerms.length > 0 ? (
                    filteredTerms.map((term: ContractTerm, idx: number) => (
                      <div
                        key={idx}
                        className="border-1 rounded-2xl p-3 bg-muted/40 flex flex-col gap-1"
                      >
                        <div className="flex flex-row items-center gap-1">
                          <div className="font-bold flex-1">{term.key}</div>
                          <Copy
                            className="w-4 h-4 stroke-gray-400 hover:stroke-gray-600 hover:scale-105 transition-all cursor-pointer"
                            onClick={() => copyMessage(term.value?.value)}
                          />
                        </div>
                        <div className="text-sm">{term.value?.value}</div>
                        {term.section && (
                          <div className="text-xs italic">Section: {term.section}</div>
                        )}
                        {term.source?.snippet && (
                          <div className="text-xs text-muted-foreground border-l-2 pl-2 border-primary/40 mt-1">
                            "{term.source.snippet}"
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No contract terms available yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Terms will appear here after document processing.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="content">
                <div className="col-span-full flex justify-end items-center gap-2 p-2">
                  <Button
                    intent="ghost"
                    icon={isContentExpanded ? ChevronUp : ChevronDown}
                    text={isContentExpanded ? 'Show Less' : 'Show Full Content'}
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                  />
                </div>

                <div
                  className={`col-span-full rounded-xl ${!isContentExpanded ? 'max-h-96' : 'max-h-none'} overflow-y-auto`}
                >
                  <pre className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedDocument.content?.length &&
                    selectedDocument.content?.length > 2000 &&
                    !isContentExpanded
                      ? `${selectedDocument.content?.substring(0, 2000)}...\n\n[Content truncated - showing first 2000 characters. Click "Show Full Content" to view all ${selectedDocument.content?.length.toLocaleString()} characters]`
                      : selectedDocument.content}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </BaseCard>
  );
}
