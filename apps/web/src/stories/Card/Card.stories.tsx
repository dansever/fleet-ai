import { Button } from '@/components/ui/button';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { KeyValuePair } from '../Utilities/KeyValuePair';
import {
  BaseCard,
  ContentSection,
  FeatureCard,
  GradientPalette,
  ListItemCard,
  MetricCard,
  NotificationCard,
  ProfileCard,
  ProjectCard,
  TagList,
} from './Card';

const meta: Meta = {
  title: 'Components/Cards',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive collection of card components for various use cases in the Fleet AI application.',
      },
    },
  },
};

export default meta;

// Overview story showing all card types
export const Overview: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Card Components Overview</h1>
        <p className="text-muted-foreground">All available card components at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* BaseCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">BASE CARD</h3>
          <BaseCard className="p-6">
            <h4 className="font-semibold mb-2">Base Card</h4>
            <p className="text-sm text-muted-foreground">Minimal foundation for custom layouts</p>
          </BaseCard>
        </div>

        {/* FeatureCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">FEATURE CARD</h3>
          <FeatureCard
            title="AI Processing"
            description="Advanced machine learning capabilities"
            icon={<Zap className="w-5 h-5" />}
            palette={GradientPalette.VioletPinkRose}
          />
        </div>

        {/* ProjectCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">PROJECT CARD</h3>
          <ProjectCard
            title="Fleet Management"
            description="Comprehensive fleet tracking system"
            category="Operations"
            progress={75}
            badgeText="Active"
          />
        </div>

        {/* MetricCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">METRIC CARD</h3>
          <MetricCard
            title="Total Revenue"
            value="$124,500"
            change="+12.5% from last month"
            trend="up"
          />
        </div>

        {/* ProfileCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">PROFILE CARD</h3>
          <ProfileCard
            name="Sarah Johnson"
            role="Fleet Manager"
            bio="Managing operations across 3 regions"
            stats={[
              { label: 'Projects', value: '12' },
              { label: 'Teams', value: '4' },
            ]}
          />
        </div>

        {/* NotificationCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">NOTIFICATION CARD</h3>
          <NotificationCard
            title="System Update"
            message="New features have been deployed"
            type="success"
            timestamp="2 min ago"
          />
        </div>

        {/* ListItemCard */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">LIST ITEM CARD</h3>
          <ListItemCard
            icon={<FileText className="w-5 h-5" />}
            iconBackground="from-blue-100 to-blue-200"
          >
            <div>
              <h4 className="font-medium">Document Item</h4>
              <p className="text-sm text-muted-foreground">Sample list item content</p>
            </div>
          </ListItemCard>
        </div>

        {/* ContentSection */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">CONTENT SECTION</h3>
          <ContentSection header="Section Header">
            <div className="flex flex-col gap-2">
              <KeyValuePair label="Label" value="Value" valueType="string" />
              <KeyValuePair label="Label" value="Value" valueType="string" />
              <KeyValuePair label="Label" value="Value" valueType="string" />
            </div>
          </ContentSection>
        </div>

        {/* TagList */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">TAG LIST</h3>
          <div className="p-4 border rounded-xl">
            <TagList tags={['React', 'TypeScript', 'Tailwind', 'Next.js']} />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete overview of all available card components in the system.',
      },
    },
  },
};

// Individual card stories
export const BaseCardStory: StoryObj = {
  name: 'Base Card',
  render: (args) => (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
      <BaseCard {...args}>
        <div className="p-6">
          <h3 className="font-semibold mb-2">Custom Content</h3>
          <p className="text-muted-foreground">
            This is a flexible base card that can contain any content.
          </p>
        </div>
      </BaseCard>
    </div>
  ),
  args: {
    className: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal base card component that serves as a foundation for custom layouts.',
      },
    },
  },
};

export const FeatureCardStory: StoryObj<typeof FeatureCard> = {
  name: 'Feature Card',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic Feature Card */}
      <FeatureCard
        title="AI Processing"
        description="Advanced machine learning capabilities for fleet optimization"
        icon={<Zap className="w-5 h-5" />}
        palette={GradientPalette.VioletPinkRose}
      />

      {/* With Body Content */}
      <FeatureCard
        title="Real-time Analytics"
        description="Live dashboards and intelligent reporting"
        icon={<TrendingUp className="w-5 h-5" />}
        palette={GradientPalette.SkyIndigoViolet}
        bodyChildren={
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span>Most Popular</span>
          </div>
        }
      />

      <FeatureCard
        title="Team Collaboration"
        description="Seamless collaboration tools"
        icon={<Users className="w-5 h-5" />}
        palette={GradientPalette.CyanBluePurple}
      />

      {/* Custom Gradient Override */}
      <FeatureCard
        title="Custom Styling"
        description="Using custom gradient override"
        icon={<Star className="w-5 h-5" />}
        palette={GradientPalette.VioletPinkRose}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Feature cards showing all gradient palettes, with/without buttons, body content, and custom styling options.',
      },
    },
  },
};

export const ProjectCardStory: StoryObj<typeof ProjectCard> = {
  name: 'Project Card',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* With Image and Progress */}
      <ProjectCard
        title="Fleet Optimization"
        description="AI-driven route optimization across the entire fleet"
        imagePath="/images/ground_handling_catering.jpg"
        category="Operations"
        progress={75}
        badgeText="Active"
        badgeColor="bg-gradient-to-r from-green-500 to-emerald-500"
      />

      {/* Without Image, With Progress */}
      <ProjectCard
        title="Maintenance Scheduler"
        description="Automated scheduling system for aircraft maintenance"
        category="Maintenance"
        progress={45}
        badgeText="In Progress"
        badgeColor="bg-gradient-to-r from-blue-500 to-purple-500"
      />

      {/* With Image, No Progress */}
      <ProjectCard
        title="Ground Services"
        description="Comprehensive ground handling operations management"
        imagePath="/images/ground_handling_power.jpg"
        category="Ground Ops"
        badgeText="New"
        badgeColor="bg-gradient-to-r from-orange-500 to-red-500"
      />

      {/* Minimal - No Image, No Progress */}
      <ProjectCard
        title="Crew Management"
        description="Digital crew scheduling and communication platform"
        category="Human Resources"
      />

      {/* With Custom Children */}
      <ProjectCard
        title="Fuel Management"
        description="Real-time fuel tracking and optimization system"
        imagePath="/images/ground_handling_de_ice.jpg"
        category="Fuel Operations"
        progress={90}
        badgeText="Near Complete"
        badgeColor="bg-gradient-to-r from-cyan-500 to-blue-500"
      >
        <Button variant="outline" size="sm">
          <Star className="w-4 h-4 mr-1" />
          Favorite
        </Button>
      </ProjectCard>

      {/* High Progress */}
      <ProjectCard
        title="Safety Compliance"
        description="Automated safety reporting and compliance tracking"
        category="Safety"
        progress={95}
        badgeText="Almost Done"
        badgeColor="bg-gradient-to-r from-purple-500 to-pink-500"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Project cards showing all configurations: with/without images, progress tracking, badges, and custom children.',
      },
    },
  },
};

export const MetricCardStory: StoryObj<typeof MetricCard> = {
  name: 'Metric Card',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Positive Trend */}
      <MetricCard
        title="Total Revenue"
        value="$2.4M"
        change="+18.2% from last quarter"
        trend="up"
        icon={<ArrowUp className="w-6 h-6 text-green-600" />}
      />

      {/* Negative Trend */}
      <MetricCard
        title="Operating Costs"
        value="$1.8M"
        change="-5.4% from last month"
        trend="down"
        icon={<ArrowDown className="w-6 h-6 text-red-600" />}
      />

      {/* Neutral Trend */}
      <MetricCard
        title="Fleet Utilization"
        value="87.5%"
        change="No change from last week"
        trend="neutral"
        icon={<TrendingUp className="w-6 h-6 text-gray-600" />}
      />

      {/* Without Change */}
      <MetricCard
        title="Active Aircraft"
        value="247"
        icon={<Zap className="w-6 h-6 text-violet-600" />}
      />

      {/* Large Numbers */}
      <MetricCard
        title="Total Flights"
        value="12,847"
        change="+2.1% this month"
        trend="up"
        icon={<Globe className="w-6 h-6 text-blue-600" />}
      />

      {/* Percentage Value */}
      <MetricCard
        title="On-Time Performance"
        value="94.2%"
        change="+1.8% improvement"
        trend="up"
        icon={<Star className="w-6 h-6 text-yellow-600" />}
      />

      {/* Currency Value */}
      <MetricCard
        title="Fuel Savings"
        value="$450K"
        change="+12% this quarter"
        trend="up"
        icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
      />

      {/* Time-based */}
      <MetricCard
        title="Avg Flight Time"
        value="2.3 hrs"
        change="-0.2 hrs optimized"
        trend="down"
        icon={<Users className="w-6 h-6 text-purple-600" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Metric cards showing all trend types (up/down/neutral), with/without change indicators, and various value formats.',
      },
    },
  },
};

export const ProfileCardStory: StoryObj<typeof ProfileCard> = {
  name: 'Profile Card',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Full Profile with Stats */}
      <ProfileCard
        name="Sarah Johnson"
        role="Fleet Manager"
        bio="Managing operations across 3 regions with 12+ years of experience"
        stats={[
          { label: 'Projects', value: '23' },
          { label: 'Aircraft', value: '156' },
          { label: 'Routes', value: '89' },
        ]}
      />

      {/* With Avatar */}
      <ProfileCard
        name="Alex Chen"
        role="Senior Coordinator"
        avatar="/placeholder-avatar.jpg"
        bio="Coordinating fleet operations across North America"
        stats={[
          { label: 'Years', value: '8' },
          { label: 'Teams', value: '4' },
        ]}
      />

      {/* Minimal Profile */}
      <ProfileCard name="Mike Rodriguez" role="Ground Operations Lead" />

      {/* No Stats, With Bio */}
      <ProfileCard
        name="Emma Thompson"
        role="Safety Inspector"
        bio="Ensuring compliance and safety across all fleet operations with attention to detail"
      />

      {/* Different Stats */}
      <ProfileCard
        name="David Kim"
        role="Maintenance Chief"
        stats={[
          { label: 'Inspections', value: '1.2K' },
          { label: 'Certifications', value: '15' },
          { label: 'Years Exp', value: '20' },
        ]}
      />

      {/* Long Name */}
      <ProfileCard
        name="Dr. Jennifer Martinez-Williams"
        role="Aviation Safety Consultant"
        bio="Specialized in aviation safety protocols and regulatory compliance"
        stats={[
          { label: 'Audits', value: '450' },
          { label: 'Reports', value: '89' },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Profile cards showing all configurations: with/without avatars, bios, and various stat combinations.',
      },
    },
  },
};

export const NotificationCardStory: StoryObj<typeof NotificationCard> = {
  name: 'Notification Card',
  render: () => (
    <div className="space-y-4 max-w-2xl">
      {/* Success */}
      <NotificationCard
        title="System Update Complete"
        message="All systems have been successfully updated to version 2.1.0 with new features and improvements."
        type="success"
        timestamp="Just now"
      />

      {/* Warning */}
      <NotificationCard
        title="Maintenance Required"
        message="Aircraft N456CD requires immediate attention before next scheduled flight."
        type="warning"
        timestamp="30 minutes ago"
      />

      {/* Error */}
      <NotificationCard
        title="Connection Lost"
        message="Unable to connect to fleet tracking system. Please check your network connection and try again."
        type="error"
        timestamp="1 hour ago"
      />

      {/* Info */}
      <NotificationCard
        title="New Message"
        message="You have received a new message from the operations team regarding tomorrow's schedule."
        type="info"
        timestamp="2 hours ago"
      />

      {/* Without Timestamp */}
      <NotificationCard
        title="Fuel Price Alert"
        message="Fuel prices have increased by 5% at JFK airport."
        type="warning"
      />

      {/* Long Message */}
      <NotificationCard
        title="Regulatory Update"
        message="New FAA regulations will take effect next month. Please review the updated compliance requirements and ensure all documentation is current. Training sessions will be scheduled for all affected personnel."
        type="info"
        timestamp="Yesterday"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Notification cards showing all types (info/success/warning/error), with/without timestamps, and various message lengths.',
      },
    },
  },
};

export const ListItemCardStory: StoryObj = {
  name: 'List Item Card',
  render: (args) => (
    <div className="space-y-3 max-w-md">
      <ListItemCard
        icon={<Mail className="w-5 h-5" />}
        iconBackground="from-blue-100 to-blue-200"
        isSelected={true}
      >
        <div>
          <h4 className="font-medium">Flight Schedule Update</h4>
          <p className="text-sm text-muted-foreground">Changes to tomorrow's departure times</p>
          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
        </div>
      </ListItemCard>

      <ListItemCard
        icon={<Phone className="w-5 h-5" />}
        iconBackground="from-green-100 to-green-200"
      >
        <div>
          <h4 className="font-medium">Crew Communication</h4>
          <p className="text-sm text-muted-foreground">Important updates from ground crew</p>
          <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
        </div>
      </ListItemCard>

      <ListItemCard
        icon={<MapPin className="w-5 h-5" />}
        iconBackground="from-orange-100 to-orange-200"
      >
        <div>
          <h4 className="font-medium">Route Optimization</h4>
          <p className="text-sm text-muted-foreground">New efficient routes available</p>
          <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
        </div>
      </ListItemCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'List item cards for creating flexible, interactive lists with icons and custom content.',
      },
    },
  },
};

export const ContentSectionStory: StoryObj<typeof ContentSection> = {
  name: 'Content Section',
  render: (args) => <ContentSection {...args} />,
  args: {
    header: 'Fleet Statistics',
    headerGradient: 'from-blue-600 via-violet-600 to-blue-700',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">247</div>
            <div className="text-sm text-muted-foreground">Total Aircraft</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Current fleet performance metrics and operational statistics.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Content sections with gradient headers for organizing related information.',
      },
    },
  },
};

export const TagListStory: StoryObj<typeof TagList> = {
  name: 'Tag List',
  render: (args) => <TagList {...args} />,
  args: {
    tags: ['Boeing 737', 'Airbus A320', 'Maintenance', 'Scheduled', 'Priority', 'International'],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tag lists for displaying categories, labels, or filtering options.',
      },
    },
  },
};

export const NotificationCardVariants: StoryObj = {
  name: 'Notification Card Variants',
  render: () => (
    <div className="space-y-4 max-w-lg">
      <NotificationCard
        title="System Update Complete"
        message="All systems have been successfully updated to version 2.1.0"
        type="success"
        timestamp="Just now"
      />
      <NotificationCard
        title="Maintenance Required"
        message="Aircraft N456CD requires immediate attention before next flight"
        type="warning"
        timestamp="30 minutes ago"
      />
      <NotificationCard
        title="Connection Lost"
        message="Unable to connect to fleet tracking system. Please check your connection."
        type="error"
        timestamp="1 hour ago"
      />
      <NotificationCard
        title="New Message"
        message="You have received a new message from the operations team"
        type="info"
        timestamp="2 hours ago"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different notification types with appropriate styling and messaging.',
      },
    },
  },
};
