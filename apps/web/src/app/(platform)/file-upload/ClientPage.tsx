'use client';

import FileUpload from '@/components/miscellaneous/FileUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useFileProcessing, useFileUpload } from './hooks';

const LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME = 'fleet-ai-contract-extractor';

export default function FileUploadClientPage({ userId, orgId }: { userId: string; orgId: string }) {
  // 1) Extraction only
  const {
    state: extractState,
    processFile: processExtract,
    reset: resetExtract,
  } = useFileProcessing({ userId, orgId, enableStorage: false });

  // 2) Storage upload only (local state, using useFileUpload)
  type UploadOnlyState = {
    status: 'idle' | 'uploading' | 'completed' | 'error';
    progress: number;
    fileName?: string;
    error?: string;
    result?: unknown;
  };
  const [uploadOnlyState, setUploadOnlyState] = useState<UploadOnlyState>({
    status: 'idle',
    progress: 0,
  });
  const { uploadFile } = useFileUpload({
    bucket: 'contracts',
    onUploadStart: (file) =>
      setUploadOnlyState({ status: 'uploading', progress: 0, fileName: file.name }),
    onUploadProgress: (progress) => setUploadOnlyState((prev) => ({ ...prev, progress })),
    onUploadComplete: (_file, result) =>
      setUploadOnlyState((prev) => ({ ...prev, status: 'completed', progress: 100, result })),
    onUploadError: (error) => setUploadOnlyState((prev) => ({ ...prev, status: 'error', error })),
  });

  // 3) Storage upload + Extraction
  const {
    state: bothState,
    processFile: processBoth,
    reset: resetBoth,
  } = useFileProcessing({ userId, orgId, enableStorage: true, storageBucket: 'contracts' });

  const renderExtractionStatus = (state: {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    fileName?: string;
    error?: string;
  }) => {
    switch (state.status) {
      case 'idle':
        return null;

      case 'uploading':
      case 'processing':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {state.status === 'uploading' ? 'Uploading File' : 'Processing Document'}
              </CardTitle>
              <CardDescription>
                {state.status === 'uploading'
                  ? 'Uploading file and preparing for extraction...'
                  : 'Extracting data from your document using AI...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">{state.fileName}</span>
              </div>
            </CardContent>
          </Card>
        );

      case 'completed':
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Extraction Completed
              </CardTitle>
              <CardDescription>Successfully extracted data from {state.fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary">Agent: {LLAMA_CONTRACT_EXTRACTOR_AGENT_NAME}</Badge>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="mt-6 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Extraction Failed
              </CardTitle>
              <CardDescription>An error occurred while processing {state.fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 p-3 rounded-lg">
                <p className="text-sm text-destructive">{state.error}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">File Processing Testbed</h1>
        <p className="text-muted-foreground">
          Use the sections below to test each flow independently.
        </p>
      </div>

      {/* 1) Extraction only */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1) Test: Extraction only</h2>
        {extractState.status === 'uploading' || extractState.status === 'processing' ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4 w-full max-w-md">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {extractState.status === 'uploading'
                    ? 'Upload in progress...'
                    : 'Processing document...'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FileUpload
            onUpload={(file) => processExtract(file)}
            acceptedFileTypes={['image/png', 'image/jpeg', 'application/pdf']}
            maxFileSize={10 * 1024 * 1024}
          />
        )}
        {extractState.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> Extraction Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(extractState.extractionResult?.data, null, 2)}
              </pre>
              <Button variant="outline" size="sm" onClick={resetExtract} className="mt-4">
                Run Again
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* 2) Storage upload only */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2) Test: Storage upload only</h2>
        {uploadOnlyState.status === 'uploading' ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4 w-full max-w-md">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading to storage...</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{uploadOnlyState.progress || 0}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full transition-all duration-500 ease-out"
                    value={uploadOnlyState.progress || 0}
                    max="100"
                  ></progress>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FileUpload
            onUpload={(file) => uploadFile(file)}
            acceptedFileTypes={['image/png', 'image/jpeg', 'application/pdf']}
            maxFileSize={10 * 1024 * 1024}
          />
        )}
        {uploadOnlyState.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> Storage Upload Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(uploadOnlyState.result, null, 2)}
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadOnlyState({ status: 'idle', progress: 0 })}
                className="mt-4"
              >
                Upload Another
              </Button>
            </CardContent>
          </Card>
        )}
        {uploadOnlyState.status === 'error' && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive text-sm">
              {uploadOnlyState.error}
            </CardContent>
          </Card>
        )}
      </section>

      {/* 3) Storage + Extraction */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3) Test: Storage upload + Extraction</h2>
        {bothState.status === 'uploading' || bothState.status === 'processing' ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-4 w-full max-w-md">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {bothState.status === 'uploading'
                    ? 'Uploading to storage...'
                    : 'Processing document...'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{bothState.progress || 0}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full transition-all duration-500 ease-out"
                    value={bothState.progress || 0}
                    max="100"
                  ></progress>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FileUpload
            onUpload={(file) => processBoth(file)}
            acceptedFileTypes={['image/png', 'image/jpeg', 'application/pdf']}
            maxFileSize={10 * 1024 * 1024}
          />
        )}
        {bothState.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bothState.extractionResult && (
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(bothState.extractionResult.data, null, 2)}
                </pre>
              )}
              <Button variant="outline" size="sm" onClick={resetBoth} className="mt-4">
                Run Again
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
