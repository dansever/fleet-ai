'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/drizzle/types';
import { formatDate } from '@/lib/core/formatters';
import { documents, workflows } from '@/modules/file-manager';
import { Button } from '@/stories/Button/Button';
import { BaseCard, ListItemCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { File, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../../context';
import { getFileTypeConfig } from '../../utils';

const documentsClient = documents.client;

export function DocumentSidebar() {
  const {
    documents,
    selectedContract,
    addDocument,
    loading,
    selectedDocument,
    setSelectedDocument,
  } = useAirportHub();
  const [uploadLoading, setUploadLoading] = useState(false);
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
  return (
    <BaseCard
      className="flex flex-col col-span-1 gap-0 px-2"
      headerClassName="p-2"
      contentClassName="p-0"
      actions={
        <FileUploadPopover
          onSend={handleUploadContractFile}
          trigger={<Button size="sm" intent="add" text="Upload" icon={Upload} />}
        />
      }
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
          {documents.map((document: Document) => {
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
  );
}
