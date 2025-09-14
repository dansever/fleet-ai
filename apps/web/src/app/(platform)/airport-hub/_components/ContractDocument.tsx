'use client';

import { Separator } from '@/components/ui/separator';
import { formatDate, formatFileSize } from '@/lib/core/formatters';
import { client as documentsClient } from '@/modules/documents/documents';
import { client as processDocumentClient } from '@/modules/documents/orchastration/';
import { client as parseClient } from '@/modules/documents/parse';
import { Button } from '@/stories/Button/Button';
import { BaseCard } from '@/stories/Card/Card';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { ChevronDown, ChevronUp, Download, Eye, File, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractDocument() {
  const {
    selectedContract,
    refreshContracts,
    document,
    refreshDocuments,
    loading,
    setUploadLoading,
  } = useAirportHub();
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

    setUploadLoading(true);
    try {
      await processDocumentClient.processDocument(file, {
        parentId: selectedContract.id,
        parentType: 'contract',
      });
      toast.success(document ? 'Document has been replaced' : 'Document has been uploaded');
      // Refresh documents to update the cache and UI
      refreshDocuments();
      refreshContracts();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    } finally {
      setUploadLoading(false);
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
    <BaseCard
      headerClassName={
        selectedContract
          ? 'text-white from-blue-500 via-blue-400 to-blue-600 opacity-80'
          : undefined
      }
      title="File Details"
      actions={
        <div className="flex gap-2">
          <FileUploadPopover
            onSend={handleUploadContractFile}
            trigger={
              <Button
                intent="secondaryInverted"
                text={document ? 'Replace' : 'Upload'}
                icon={Upload}
              />
            }
          />
          <Button
            intent="secondaryInverted"
            icon={Download}
            onClick={() => handleDownloadDocument(document?.storagePath ?? '')}
            disabled={downloadFileLoading}
            isLoading={downloadFileLoading}
          />
          <Button
            intent="secondaryInverted"
            icon={Eye}
            onClick={() => handleViewDocument(document?.storagePath ?? '')}
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
        </div>
      }
      body={
        <div>
          {!document ? (
            <div className="text-center text-sm text-muted-foreground py-8 gap-4 flex flex-col items-center">
              <h2>No document found for this contract</h2>
              <p>Upload a document to this contract to get started</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-4">
                {/* Basic Information */}
                <div className="col-span-full flex items-center gap-2 rounded-xl p-2 bg-slate-100">
                  <File className="w-6 h-6" />
                  <p className="text-lg text-slate-900 font-mono px-2">
                    {document.fileName || 'Unknown'}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-slate-600">File Type:</span>
                  <p>{document.fileType || 'Unknown'}</p>
                </div>

                <div>
                  <span className="font-medium text-slate-600">File Size:</span>
                  <p>{document.fileSize ? formatFileSize(document.fileSize) : 'Unknown'}</p>
                </div>

                <div>
                  <span className="font-medium text-slate-600">Created:</span>
                  <p>{document.createdAt ? formatDate(document.createdAt) : 'Unknown'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Updated:</span>
                  <p>{document.updatedAt ? formatDate(document.updatedAt) : 'Unknown'}</p>
                </div>
              </div>

              {/* Document Content */}
              <Separator />
              <div className="col-span-full flex justify-between items-center gap-2 p-2">
                <h3 className="font-medium text-slate-600">Document Content</h3>
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
                  {document.content?.length && document.content?.length > 2000 && !isContentExpanded
                    ? `${document.content?.substring(0, 2000)}...\n\n[Content truncated - showing first 2000 characters. Click "Show Full Content" to view all ${document.content?.length.toLocaleString()} characters]`
                    : document.content}
                </pre>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
