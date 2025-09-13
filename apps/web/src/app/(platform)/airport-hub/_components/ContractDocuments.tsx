'use client';

import { client as documentsClient } from '@/modules/documents/documents';
import { client as processDocumentClient } from '@/modules/documents/orchastration/';
import { api } from '@/services/api-client';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { useOrganization } from '@clerk/nextjs';
import { Download, Eye, RefreshCw, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractDocuments() {
  const { selectedContract, refreshContracts, documents, refreshDocuments, loading } =
    useAirportHub();
  const clerkOrg = useOrganization();
  const [downloadFileLoading, setDownloadFileLoading] = useState(false);
  const [viewDocumentLoading, setViewDocumentLoading] = useState(false);
  const [deleteDocumentLoading, setDeleteDocumentLoading] = useState(false);

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
      toast.success('This document has been uploaded');
      // Refresh documents to update the cache and UI
      refreshDocuments();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  const handleParseDocument = async (file: File) => {
    try {
      if (!selectedContract) {
        toast.error('No contract selected');
        return;
      }
      const res = await api.post('/api/parse', {
        file,
      });
      toast.success('This document has been parsed');
      console.log(res.data);
      // Refresh documents to update the cache and UI
      refreshDocuments();
    } catch (error) {
      toast.error('Failed to parse document');
      console.error(error);
    }
  };

  const handleDownloadDocument = (storagePath: string | null) => {
    console.log('Downloading document:', storagePath);
  };

  const handleViewDocument = (storagePath: string) => {
    console.log('Viewing document:', storagePath);
  };

  const handleDeleteDocument = (id: string, storagePath: string) => {
    return async () => {
      // Cascade logic already implemented in the client
      await documentsClient.deleteDocument(id, storagePath);
      toast.success('This document has been deleted');
      refreshDocuments();
    };
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
            // onSend={handleUploadContractFile}
            onSend={handleParseDocument}
            trigger={
              <Button
                intent="add"
                text="Upload Contract"
                icon={Upload}
                disabled={loading.documents && loading.isRefreshing}
              />
            }
          />
        </div>
      }
    >
      <div>
        {documents.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8 gap-4 flex flex-col items-center">
            <h2>No documents found for this contract</h2>
            <p>Add a document to this contract to get started</p>
          </div>
        )}
        <div className="grid grid-cols-1 grid-cols-3 gap-4">
          {documents.map((document) => {
            const fileSizeMb = document.fileSize && (document.fileSize / 1024).toFixed(1);
            return (
              <BaseCard
                key={document.id}
                className="px-4 py-2 flex flex-col gap-1 bg-gradient-to-br from-slate-100 to-slate-200"
              >
                <div>
                  <div className="text-sm font-semibold">{document.fileName ?? ''}</div>
                  <div className="text-sm text-muted-foreground">{fileSizeMb + ' mb'}</div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    intent="ghost"
                    icon={Download}
                    className="hover:bg-white"
                    onClick={() => handleDownloadDocument(document.storagePath)}
                    disabled={downloadFileLoading}
                  />
                  <Button
                    intent="ghost"
                    icon={Eye}
                    className="hover:bg-white"
                    onClick={() => handleViewDocument(document.storagePath ?? '')}
                    disabled={viewDocumentLoading}
                  />
                  <ConfirmationPopover
                    onConfirm={handleDeleteDocument(document.id, document.storagePath ?? '')}
                    trigger={
                      <Button
                        intent="ghost"
                        icon={Trash}
                        className="hover:bg-white hover:text-red-500"
                        disabled={deleteDocumentLoading}
                      />
                    }
                    popoverIntent="danger"
                    title="Delete Document"
                    description="Are you sure you want to delete this document?"
                  />
                </div>
              </BaseCard>
            );
          })}
        </div>
      </div>
    </MainCard>
  );
}
