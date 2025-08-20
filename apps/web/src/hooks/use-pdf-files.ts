import { useEffect, useState } from 'react';

interface PdfFile {
  name: string;
  path: string;
}

export function usePdfFiles() {
  const [availableFiles, setAvailableFiles] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableFiles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/list-pdf-files');
        const data = await res.json();

        if (data.files) {
          setAvailableFiles(data.files);
        } else {
          setError('No files found');
        }
      } catch (err) {
        console.error('Failed to fetch available files:', err);
        setError('Failed to load file list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableFiles();
  }, []);

  return { availableFiles, isLoading, error };
}
