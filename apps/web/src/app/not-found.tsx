'use client';

import { Button } from '@/stories/Button/Button';
import { ArrowLeft, Home } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function NotFound() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/70 to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Main 404 Card */}
        <div className="bg-white backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 mb-8">
          {/* 404 Number with Gradient */}
          <h2 className="text-gray-500 mb-4">{path}</h2>
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            404
          </h1>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Page Not Found</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Oops! The page you're looking for seems to have taken flight. It might have been
              moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.history.back()}
              intent="secondary"
              icon={ArrowLeft}
              text="Go Back"
            />
            <Button
              onClick={() => router.push('/dashboard')}
              intent="primary"
              text="Home"
              icon={Home}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
