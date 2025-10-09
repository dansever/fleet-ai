import { Document } from '@/drizzle/types';
import { File, FileText } from 'lucide-react';

// Helper function to get file type icon and color
export const getFileTypeConfig = (fileType: Document['fileType'] | null) => {
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
