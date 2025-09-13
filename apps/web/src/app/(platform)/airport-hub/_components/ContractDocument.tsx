'use client';

import { CardContent, CardFooter } from '@/components/ui/card';
import { formatDate, formatFileSize } from '@/lib/core/formatters';
import { client as documentsClient } from '@/modules/documents/documents';
import { client as processDocumentClient } from '@/modules/documents/orchastration/';
import { client as parseClient } from '@/modules/documents/parse';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { useOrganization } from '@clerk/nextjs';
import { ChevronDown, ChevronUp, Download, Eye, RefreshCw, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractDocument() {
  const { selectedContract, refreshContracts, document, refreshDocuments, loading } =
    useAirportHub();
  const clerkOrg = useOrganization();
  const [downloadFileLoading, setDownloadFileLoading] = useState(false);
  const [viewDocumentLoading, setViewDocumentLoading] = useState(false);
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Handle file upload for contract extraction
  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }
    try {
      await processDocumentClient.processDocument(file, {
        parentId: selectedContract.id,
        parentType: 'contract',
      });
      toast.success(document ? 'Document has been replaced' : 'Document has been uploaded');
      // Refresh documents to update the cache and UI
      refreshDocuments();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  const handleDownloadDocument = (storagePath: string | null) => {
    console.log('Downloading document:', storagePath);
  };

  const handleViewDocument = (storagePath: string) => {
    console.log('Viewing document:', storagePath);
  };

  const handleDeleteDocument = async () => {
    if (!document) return;

    try {
      setDeleteDocumentLoading(true);
      // Cascade logic already implemented in the client
      await documentsClient.deleteDocument(document.id, document.storagePath ?? '');
      toast.success('Document has been deleted');
      refreshDocuments();
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

  return (
    <MainCard
      headerGradient={
        selectedContract ? 'from-blue-500 via-blue-400 to-blue-600 opacity-80' : undefined
      }
      title="Documents & Files"
      actions={
        <div className="flex gap-2">
          <Button
            intent="secondaryInverted"
            icon={RefreshCw}
            onClick={refreshDocuments}
            disabled={loading.documents && loading.isRefreshing}
          />
          <FileUploadPopover
            onSend={handleUploadContractFile}
            trigger={
              <Button
                intent="add"
                text={document ? 'Replace Document' : 'Upload Document'}
                icon={Upload}
                disabled={loading.documents && loading.isRefreshing}
              />
            }
          />
        </div>
      }
    >
      <div>
        {!document ? (
          <div className="text-center text-sm text-muted-foreground py-8 gap-4 flex flex-col items-center">
            <h2>No document found for this contract</h2>
            <p>Upload a document to this contract to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Document Overview Card */}
            <MainCard neutralHeader title="Document Information" className="flex flex-col border">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-600">File Name:</span>
                    <p className="text-sm text-slate-900 font-mono bg-white px-2 py-1 rounded border">
                      {document.fileName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">File Type:</span>
                    <p className="text-sm text-slate-900 uppercase font-semibold">
                      {document.fileType || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">File Size:</span>
                    <p className="text-sm text-slate-900">
                      {document.fileSize ? formatFileSize(document.fileSize) : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Created:</span>
                    <p className="text-sm text-slate-900">
                      {document.createdAt ? formatDate(document.createdAt) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Updated:</span>
                    <p className="text-sm text-slate-900">
                      {document.updatedAt ? formatDate(document.updatedAt) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-row gap-2 justify-end">
                <Button
                  intent="ghost"
                  icon={Download}
                  text="Download"
                  onClick={() => handleDownloadDocument(document.storagePath)}
                  disabled={downloadFileLoading}
                  isLoading={downloadFileLoading}
                />
                <Button
                  intent="ghost"
                  icon={Eye}
                  text="View"
                  onClick={() => handleViewDocument(document.storagePath ?? '')}
                  disabled={viewDocumentLoading}
                  isLoading={viewDocumentLoading}
                />
                <ConfirmationPopover
                  onConfirm={handleDeleteDocument}
                  trigger={
                    <Button
                      intent="danger"
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
              </CardFooter>
            </MainCard>

            {/* Content Preview Card */}
            {document.content && (
              <MainCard
                title="Document Content Preview"
                neutralHeader
                className="border"
                actions={
                  <Button
                    intent="secondary"
                    icon={isContentExpanded ? ChevronUp : ChevronDown}
                    text={isContentExpanded ? 'Show Less' : 'Show Full Content'}
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                  />
                }
              >
                <CardContent
                  className={`py-4 rounded-3xl bg-gray-100 ${!isContentExpanded ? 'max-h-96' : 'max-h-none'} overflow-y-auto`}
                >
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {document.content.length > 2000 && !isContentExpanded
                      ? `${document.content.substring(0, 2000)}...\n\n[Content truncated - showing first 2000 characters. Click "Show Full Content" to view all ${document.content.length.toLocaleString()} characters]`
                      : document.content}
                  </pre>
                </CardContent>
                <div
                  className={`bg-slate-50 p-4 rounded-3xl  ${!isContentExpanded ? 'max-h-96' : 'max-h-none'} overflow-y-auto`}
                ></div>
              </MainCard>
            )}
          </div>
        )}
      </div>
    </MainCard>
  );
}
