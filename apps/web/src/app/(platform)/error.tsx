'use client';

import { Button } from '@/stories/Button/Button';
import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

// If you created a custom error class, it'll look like this:
// new DBUnavailableError() with message "DB_CONNECTION_FAILED"
type ErrorProps = {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
};

function classifyError(error: Error & { code?: string }) {
  const msg = (error?.message || '').toUpperCase();
  const name = (error?.name || '').toUpperCase();
  const code = (error as any)?.code?.toString().toUpperCase();

  // DB connectivity buckets
  const isDb =
    name.includes('DBUNAVAILABLE') ||
    msg.includes('DB_CONNECTION_FAILED') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ENOTFOUND') ||
    code === 'ECONNREFUSED';

  // Auth buckets
  const isAuth =
    name.includes('AUTH') ||
    msg.includes('UNAUTHORIZED') ||
    msg.includes('FORBIDDEN') ||
    msg.includes('AUTHENTICATION');

  // Rate limit / quota
  const isRate = msg.includes('RATE') || msg.includes('TOO MANY REQUESTS') || msg.includes('429');

  if (isDb) return 'db';
  if (isAuth) return 'auth';
  if (isRate) return 'rate';
  return 'generic';
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Always log the raw error for debugging and observability
    console.error('Captured error:', error);
  }, [error]);

  const kind = useMemo(() => classifyError(error), [error]);

  const ui = useMemo(() => {
    switch (kind) {
      case 'db':
        return {
          title: 'Database Connection Issue',
          subtitle:
            'We cannot reach the database right now. Your data is safe. Please try again in a moment.',
          primary: { label: 'Retry', onClick: () => reset() },
          secondary: { label: 'Status', onClick: () => router.push('/status') },
        };
      case 'auth':
        return {
          title: 'You need to sign in',
          subtitle: 'Your session may have expired or you do not have access to this page.',
          primary: { label: 'Go to Login', onClick: () => router.push('/login') },
          secondary: { label: 'Back', onClick: () => window.history.back() },
        };
      case 'rate':
        return {
          title: 'Slow down a bit',
          subtitle: 'You hit a temporary rate limit. Please wait a few seconds and try again.',
          primary: { label: 'Retry', onClick: () => reset() },
          secondary: { label: 'Home', onClick: () => router.push('/dashboard') },
        };
      default:
        return {
          title: 'Something went wrong',
          subtitle:
            'An unexpected error occurred. Please try again. If it continues, contact support.',
          primary: { label: 'Retry', onClick: () => reset() },
          secondary: { label: 'Home', onClick: () => router.push('/dashboard') },
        };
    }
  }, [kind, reset, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/70 to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 mb-8">
          {/* Optional path or digest for debugging in dev only */}
          {process.env.NODE_ENV === 'development' && (
            <h2 className="text-gray-500 mb-4">{/* {error?.name}: {error?.message} */}</h2>
          )}

          <h1 className="text-4xl md:text-5xl py-4 font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            {ui.title}
          </h1>

          <div className="mb-8">
            <p className="text-slate-600 text-lg leading-relaxed">{ui.subtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={ui.primary.onClick}
              intent="primary"
              text={ui.primary.label}
              icon={Home}
            />
            <Button
              onClick={ui.secondary.onClick}
              intent="secondary"
              text={ui.secondary.label}
              icon={ArrowLeft}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
