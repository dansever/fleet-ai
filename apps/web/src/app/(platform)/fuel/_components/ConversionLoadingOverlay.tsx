'use client';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ConversionProgress } from '../utils/bidConversion';

interface ConversionLoadingOverlayProps {
  progress: ConversionProgress;
  isVisible: boolean;
}

export function ConversionLoadingOverlay({ progress, isVisible }: ConversionLoadingOverlayProps) {
  if (!isVisible) return null;

  const percentage = Math.round((progress.completed / progress.total) * 100);
  const hasErrors = progress.errors.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">Converting Bid Values</h3>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Processing bids...</span>
            <span>
              {progress.completed} / {progress.total}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="text-xs text-gray-500 mt-1">{percentage}% complete</div>
        </div>

        {progress.current && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Currently processing: <span className="font-medium">{progress.current}</span>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {progress.errors.length} conversion error{progress.errors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-red-700 max-h-20 overflow-y-auto">
              {progress.errors.slice(0, 3).map((error, index) => (
                <div key={index} className="mb-1">
                  • {error}
                </div>
              ))}
              {progress.errors.length > 3 && (
                <div className="text-red-600">... and {progress.errors.length - 3} more</div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Converting currency and units to tender base values</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          This process may take a moment as we convert values using AI-powered tools. Results will
          be cached to improve performance.
        </div>
      </div>
    </div>
  );
}

export default ConversionLoadingOverlay;
