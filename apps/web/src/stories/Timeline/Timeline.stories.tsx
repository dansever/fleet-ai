import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ModernTimeline } from './Timeline';

const meta: Meta<typeof ModernTimeline> = {
  title: 'Components/Timeline',
  component: ModernTimeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A timeline component for displaying chronological events, processes, and status updates in Fleet AI applications.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModernTimeline>;

// Comprehensive Timeline Showcase - All variants in one story
export const AllTimelineVariants: Story = {
  render: () => (
    <div>
      <ModernTimeline
        items={[
          {
            id: '1',
            title: 'Start Date',
            timestamp: '2021-01-01',
            status: 'current',
          },
          {
            id: '2',
            title: 'End Date',
            timestamp: '2021-01-01',
            status: 'current',
          },
        ]}
      />
      <div>
        <ModernTimeline
          orientation="horizontal"
          items={[
            {
              id: '1',
              title: 'Start Date',
              timestamp: '2021-01-01',
              status: 'current',
            },
            {
              id: '2',
              title: 'End Date',
              timestamp: '2021-01-01',
              status: 'current',
            },
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all available Timeline component configurations in the Fleet AI design system.',
      },
    },
  },
};
