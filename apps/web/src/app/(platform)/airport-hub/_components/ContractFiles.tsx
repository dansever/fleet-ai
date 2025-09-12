import { client as documentsClient } from '@/modules/documents';
import { client as storageClient } from '@/modules/storage';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { useOrganization } from '@clerk/nextjs';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractFiles() {
  const { selectedContract, refreshContracts } = useAirportHub();
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

      // refreshContracts();
    } catch (error) {
      toast.error('Failed to process contract file');
      console.error(error);
    }
  };

  return (
    <MainCard
      headerGradient={
        selectedContract ? 'from-blue-500 via-blue-400 to-blue-600 opacity-80' : undefined
      }
      title="Documents & Files"
      actions={
        <FileUploadPopover
          onSend={handleUploadContractFile}
          trigger={<Button intent="add" text="Upload Contract" icon={Upload} />}
        />
      }
    ></MainCard>
  );
}
