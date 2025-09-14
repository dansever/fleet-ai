import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { BaseCard } from '@/stories/Card/Card';
import { AlertTriangle, Bot, Clock, User } from 'lucide-react';

const activities = [
  {
    id: 'act-1',
    type: 'ai-action',
    title: 'Quote analysis completed',
    description: 'AI analyzed 5 quotes for RFQ-001',
    timestamp: '2 mins ago',
    actor: 'Quote Analyzer',
    status: 'completed',
  },
  {
    id: 'act-2',
    type: 'human-approval',
    title: 'Negotiation approved',
    description: 'User approved $18K savings negotiation',
    timestamp: '5 mins ago',
    actor: 'John Doe',
    status: 'approved',
  },
  {
    id: 'act-3',
    type: 'ai-action',
    title: 'Email sent to vendor',
    description: 'Negotiation email sent to AeroTech Solutions',
    timestamp: '8 mins ago',
    actor: 'Negotiation Assistant',
    status: 'completed',
  },
  {
    id: 'act-4',
    type: 'system-alert',
    title: 'High-value quote detected',
    description: 'Quote exceeds auto-approval limit, requires review',
    timestamp: '12 mins ago',
    actor: 'System',
    status: 'pending',
  },
  {
    id: 'act-5',
    type: 'ai-action',
    title: 'Documentation validated',
    description: 'FAA certificates verified for 3 vendors',
    timestamp: '15 mins ago',
    actor: 'Documentation Validator',
    status: 'completed',
  },
];

export function ActivityFeed() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai-action':
        return <Bot className="h-4 w-4 text-blue-600" />;
      case 'human-approval':
        return <User className="h-4 w-4 text-green-600" />;
      case 'system-alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BaseCard className="col-span-4" title="Activity Feed">
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
              </div>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">{activity.actor}</p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </BaseCard>
  );
}
