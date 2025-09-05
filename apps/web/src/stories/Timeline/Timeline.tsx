'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Clock } from 'lucide-react';
import type React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending' | 'overdue';
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline = ({ items, className }: TimelineProps) => {
  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'current':
        return 'bg-blue-100 border-blue-200';
      case 'overdue':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getLineColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-300';
      case 'current':
        return 'bg-blue-300';
      case 'overdue':
        return 'bg-red-300';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <Card className={cn('rounded-2xl py-0 border-0 shadow-none', className)}>
      <CardContent className="p-0">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index < items.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
              )}

              {/* Status indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center',
                  getStatusColor(item.status),
                )}
              >
                {item.icon || getStatusIcon(item.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.timestamp}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
