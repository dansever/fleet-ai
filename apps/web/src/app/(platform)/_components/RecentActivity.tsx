'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Activity = {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
};

export function RecentActivity() {
  const activities: Activity[] = [
    {
      id: '1',
      user: {
        name: 'Sarah Chen',
        initials: 'SC',
      },
      action: 'created RFQ',
      target: 'PT-78291-A (Hydraulic Pump)',
      timestamp: '12 minutes ago',
    },
    {
      id: '2',
      user: {
        name: 'Michael Rodriguez',
        initials: 'MR',
      },
      action: 'submitted quote for',
      target: 'RFQ-2024-0008',
      timestamp: '45 minutes ago',
    },
    {
      id: '3',
      user: {
        name: 'Jessica Taylor',
        initials: 'JT',
      },
      action: 'approved quote from',
      target: 'SkyParts Ltd.',
      timestamp: '1 hour ago',
    },
    {
      id: '4',
      user: {
        name: 'David Kim',
        initials: 'DK',
      },
      action: 'updated lead time for',
      target: 'Quote #Q-94821',
      timestamp: '2 hours ago',
    },
    {
      id: '5',
      user: {
        name: 'Emily Johnson',
        initials: 'EJ',
      },
      action: 'reopened RFQ',
      target: 'RFQ-2024-0005',
      timestamp: '3 hours ago',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your procurement team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="mt-0.5">
                <AvatarImage
                  src={activity.user.avatar || '/placeholder.svg'}
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span> {activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
