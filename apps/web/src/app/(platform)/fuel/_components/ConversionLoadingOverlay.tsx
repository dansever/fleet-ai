'use client';

import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { ConversionProgress } from '../utils/bidConversion';

interface ConversionLoadingOverlayProps {
  progress: ConversionProgress;
  isVisible: boolean;
  onDismiss?: () => void;
}

export function ConversionLoadingOverlay({
  progress,
  isVisible,
  onDismiss,
}: ConversionLoadingOverlayProps) {
  if (!isVisible) return null;

  const percentage = Math.round((progress.completed / progress.total) * 100);
  const hasErrors = progress.errors.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-[calc(100vw-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <h3 className="text-sm font-semibold text-gray-900">Converting Bid Values</h3>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Minimize"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1.5">
              <span>Processing...</span>
              <span className="font-medium">
                {progress.completed} / {progress.total}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="text-xs text-gray-500 mt-1">{percentage}% complete</div>
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-red-800">
                  {progress.errors.length} error{progress.errors.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              Converting to tender base currency and units. Results are cached for 1 hour.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConversionLoadingOverlay;
