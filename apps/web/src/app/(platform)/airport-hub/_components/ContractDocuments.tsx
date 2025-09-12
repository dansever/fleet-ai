'use client';

import { client as documentsClient } from '@/modules/documents';
import { client as storageClient } from '@/modules/storage';
import { Button } from '@/stories/Button/Button';
import { BaseCard, MainCard } from '@/stories/Card/Card';
import { ConfirmationPopover, FileUploadPopover } from '@/stories/Popover/Popover';
import { useOrganization } from '@clerk/nextjs';
import { Download, Eye, RefreshCw, Trash, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractDocuments() {
  const { selectedContract, refreshContracts, documents, refreshDocuments, loading } =
    useAirportHub();
  const clerkOrg = useOrganization();

  // Handle file upload for contract extraction
  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }
    try {
      // Upload file to storage
      const result = await storageClient.uploadFile(file, 'contracts');
      toast.success('Contract file uploaded to the storage successfully');
      console.log('RESULT', result);

      // Create document in the database
      await documentsClient.createDocument({
        parentId: selectedContract.id,
        parentType: 'contract',
        storageId: result.id,
        storagePath: result.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      toast.success('Document created successfully in the database');

      // Retrieve file blob from storage
      const orgSlug = clerkOrg.organization?.slug ?? '';
      // const blob = await storageClient.retrieveFileBlob(orgSlug, result.path);

      const files = await storageClient.listFilesByBucket(orgSlug, 'contracts');
      console.log('FILES', files);

      // Refresh documents to update the cache and UI
      refreshDocuments();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  const handleDownloadDocument = (storagePath: string) => {
    console.log('TODO: Implement handleDownloadDocument');
  };

  const handleViewDocument = (storagePath: string) => {
    console.log('TODO: Implement handleViewDocument');
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
                className="px-4 py-2 flex flex-col gap-1 border-1 border-primary/20 bg-gradient-to-br from-orange-50 to-orange-100"
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
                    onClick={() => handleDownloadDocument(document.storagePath ?? '')}
                  />
                  <Button
                    intent="ghost"
                    icon={Eye}
                    className="hover:bg-white"
                    onClick={() => handleViewDocument(document.storagePath ?? '')}
                  />
                  <ConfirmationPopover
                    onConfirm={async () => {
                      await documentsClient.deleteDocument(document.id, document.storagePath);
                      refreshDocuments();
                    }}
                    trigger={
                      <Button
                        intent="ghost"
                        icon={Trash}
                        className="hover:bg-white hover:text-red-500"
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
