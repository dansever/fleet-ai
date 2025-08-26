'use client';

import { ServiceContract } from '@/drizzle/types';
import { Button, ButtonProps } from '@/stories/Button/Button';
import { DetailDialog } from '@/stories/Dialog/Dialog';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

export default function ServiceContractDialog({
  serviceContract,
  DialogType = 'view',
  triggerText,
  triggerIcon,
  triggerClassName,
  buttonSize = 'md',
  triggerIntent,
}: {
  serviceContract: ServiceContract;
  DialogType: 'add' | 'edit' | 'view';
  triggerText?: string;
  triggerIcon?: LucideIcon;
  triggerClassName?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  triggerIntent?: 'primary' | 'secondary' | 'add' | 'delete' | 'info';
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    console.log('Saving service contract');
  };
  const handleCancel = () => {
    console.log('Canceling service contract');
  };

  const isEdit = serviceContract !== null;
  const isAdd = serviceContract === null;
  const saveButtonText = isAdd ? 'Create Service Contract' : 'Save Changes';

  return (
    <DetailDialog
      trigger={
        <Button
          intent={triggerIntent as ButtonProps['intent']}
          text={triggerText}
          icon={triggerIcon}
          size={buttonSize}
          className={triggerClassName}
        />
      }
      headerGradient="from-purple-500 to-purple-500"
      title={DialogType === 'add' ? 'Add New Service Contract' : 'Service Contract Details'}
      onSave={handleSave}
      onCancel={handleCancel}
      initialEditing={isEdit || isAdd}
      saveButtonText={saveButtonText}
    >
      DIALOG BODY
    </DetailDialog>
  );
}
