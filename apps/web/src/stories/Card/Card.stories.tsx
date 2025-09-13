import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowDown, Mail, MapPin, Phone, Star, TrendingUp, Zap } from 'lucide-react';
import { BadgeGroup, ListItemCard, MainCard, MetricCard, ProfileCard, ProjectCard } from './Card';

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

// Comprehensive Card Showcase - All variants in one story
export const AllCardVariants: StoryObj = {
  render: () => (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
          Fleet AI Card Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete showcase of all available card variants
        </p>
      </div>

      {/* Feature Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Feature Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Showcase features with gradient backgrounds and icons
        </p>
      </section>

      {/* Project Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Project Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Display projects with images, progress tracking, and badges
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            title="Fleet Optimization"
            subtitle="AI-driven route optimization across the entire fleet"
            imagePath="/images/ground_handling_catering.jpg"
            progress={75}
            badgeText="Active"
            badgeColor="bg-gradient-to-r from-green-500 to-emerald-500"
          >
            <div className="text-sm text-muted-foreground">Operations</div>
          </ProjectCard>
          <ProjectCard
            title="Maintenance Scheduler"
            subtitle="Automated scheduling system for aircraft maintenance"
            progress={45}
            badgeText="In Progress"
            badgeColor="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <div className="text-sm text-muted-foreground">Maintenance</div>
          </ProjectCard>
          <ProjectCard
            title="Ground Services"
            subtitle="Comprehensive ground handling operations"
            imagePath="/images/ground_handling_power.jpg"
            badgeText="New"
            badgeColor="bg-gradient-to-r from-orange-500 to-red-500"
          >
            <div className="text-sm text-muted-foreground">Ground Ops</div>
          </ProjectCard>
          <ProjectCard title="Crew Management" subtitle="Digital crew scheduling and communication">
            <div className="text-sm text-muted-foreground">Human Resources</div>
          </ProjectCard>
          <ProjectCard
            title="Safety Compliance"
            subtitle="Automated safety reporting and tracking"
            progress={95}
            badgeText="Near Complete"
            badgeColor="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <div className="text-sm text-muted-foreground">Safety</div>
          </ProjectCard>
        </div>
      </section>

      {/* Metric Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Metric Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Display key performance indicators with trend analysis
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Operating Costs"
            value="$1.8M"
            change="-5.4% from last month"
            trend="down"
            icon={<ArrowDown className="w-6 h-6 text-red-600" />}
          />
          <MetricCard
            title="Fleet Utilization"
            value="87.5%"
            change="No change from last week"
            trend="neutral"
            icon={<TrendingUp className="w-6 h-6 text-gray-600" />}
          />
          <MetricCard
            title="Active Aircraft"
            value="247"
            icon={<Zap className="w-6 h-6 text-violet-600" />}
          />
          <MetricCard
            title="On-Time Performance"
            value="94.2%"
            change="+1.8% improvement"
            trend="up"
            icon={<Star className="w-6 h-6 text-yellow-600" />}
          />
        </div>
      </section>

      {/* Profile Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Profile Cards
        </h2>
        <p className="text-muted-foreground mb-6">Display team members and user profiles</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfileCard
            title="Sarah Johnson"
            subtitle="Fleet Manager"
            bio="Managing operations across 3 regions with 12+ years of experience"
            stats={[
              { label: 'Projects', value: '23' },
              { label: 'Aircraft', value: '156' },
              { label: 'Routes', value: '89' },
            ]}
          />
          <ProfileCard
            title="Alex Chen"
            subtitle="Senior Coordinator"
            bio="Coordinating fleet operations across North America"
            stats={[
              { label: 'Years', value: '8' },
              { label: 'Teams', value: '4' },
            ]}
          />
          <ProfileCard
            title="Emma Thompson"
            subtitle="Safety Inspector"
            bio="Ensuring compliance and safety across all fleet operations"
          />
        </div>
      </section>

      {/* List Item Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          List Item Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Interactive list items with icons and flexible content
        </p>
        <div className="space-y-3 max-w-md">
          <ListItemCard
            icon={<Mail className="w-5 h-5" />}
            iconBackgroundClassName="from-blue-100 to-blue-200"
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
            iconBackgroundClassName="from-green-100 to-green-200"
          >
            <div>
              <h4 className="font-medium">Crew Communication</h4>
              <p className="text-sm text-muted-foreground">Important updates from ground crew</p>
              <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
            </div>
          </ListItemCard>
          <ListItemCard
            icon={<MapPin className="w-5 h-5" />}
            iconBackgroundClassName="from-orange-100 to-orange-200"
          >
            <div>
              <h4 className="font-medium">Route Optimization</h4>
              <p className="text-sm text-muted-foreground">New efficient routes available</p>
              <p className="text-xs text-muted-foreground mt-1">6 hours ago</p>
            </div>
          </ListItemCard>
        </div>
      </section>

      {/* Main Card Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Main Cards
        </h2>
        <p className="text-muted-foreground mb-6">
          Primary content containers with headers and actions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <MainCard
            title="Fleet Statistics"
            subtitle="Current performance metrics"
            headerGradient="from-blue-600 via-violet-600 to-blue-700"
          >
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
          </MainCard>
          <MainCard title="System Overview" subtitle="Neutral header styling" neutralHeader={true}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">System Status</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Update</span>
                <span className="text-sm font-medium">2 minutes ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
            </div>
          </MainCard>
        </div>
      </section>

      {/* Badge Group Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-violet-200 pb-2">
          Badge Groups
        </h2>
        <p className="text-muted-foreground mb-6">Display collections of tags and labels</p>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Aircraft Types</h4>
            <BadgeGroup tags={['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380']} />
          </div>
          <div>
            <h4 className="font-medium mb-2">Service Categories</h4>
            <BadgeGroup
              tags={['Maintenance', 'Ground Handling', 'Fuel Services', 'Catering', 'De-icing']}
            />
          </div>
          <div>
            <h4 className="font-medium mb-2">Technologies</h4>
            <BadgeGroup tags={['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Storybook']} />
          </div>
        </div>
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available card components in the Fleet AI design system.',
      },
    },
  },
};
