import { client as contractClient } from '@/modules/contracts';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { FileUploadPopover } from '@/stories/Popover/Popover';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAirportHub } from '../ContextProvider';

export function ContractFiles() {
  const { selectedContract, refreshContracts } = useAirportHub();

  // Handle file upload for contract extraction
  const handleUploadContractFile = async (file: File) => {
    if (!selectedContract) {
      toast.error('No contract selected');
      return;
    }
    try {
      await contractClient.processContract(file, selectedContract.id);
      toast.success('Contract file processed successfully');
      refreshContracts();
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
