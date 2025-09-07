'use client';

import {
  Timeline,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline';
import type React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending' | 'overdue';
  icon?: React.ReactNode;
}

export interface ModernTimelineProps {
  items: TimelineItem[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const ModernTimeline = ({
  items,
  className,
  orientation = 'vertical',
}: ModernTimelineProps) => {
  return (
    <Timeline defaultValue={3} orientation={orientation} className={className}>
      {items.map((item) => (
        <TimelineItem key={item.id} step={Number(item.id)}>
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate>{item.timestamp}</TimelineDate>
            <TimelineTitle>{item.title}</TimelineTitle>
            <TimelineIndicator />
          </TimelineHeader>
        </TimelineItem>
      ))}
    </Timeline>
  );
};
