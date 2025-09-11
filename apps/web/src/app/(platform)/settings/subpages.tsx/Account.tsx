'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MainCard, MetricCard } from '@/stories/Card/Card';
import { useOrganization, useUser } from '@clerk/nextjs';
import { Package, Users } from 'lucide-react';
import Image from 'next/image';
import { useSettings } from '../ContextProvider';

export default function ProfilePage() {
  const { user: dbUser, org: dbOrg } = useSettings();
  const { user: clerkUser } = useUser();
  const { organization: clerkOrg } = useOrganization();

  return (
    <div className="min-h-screen flex flex-col bg-background min-w-3xl">
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[250px_1fr]">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={clerkUser?.imageUrl ?? ''}
                  alt={dbUser.firstName + dbUser.lastName}
                />
                <AvatarFallback>{dbUser?.firstName?.[0] + dbUser?.lastName?.[0]}</AvatarFallback>
              </Avatar>

              <h1 className="mt-4 tracking-tight">
                {dbUser.firstName} {dbUser.lastName}
              </h1>
              <p>{dbUser.email}</p>
              <p>{dbUser.position}</p>
            </div>
            <Separator />
            <div className="flex flex-col items-center md:items-start">
              <div
                className="items-left justify-start"
                style={{ position: 'relative', width: '100%', height: '40px' }}
              >
                <Image
                  src={clerkOrg?.imageUrl ?? ''}
                  alt="Organization logo"
                  fill
                  sizes="200px"
                  className="object-contain object-left"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <MainCard
            className="bg-transparent"
            headerGradient="from-orange-500 to-violet-500 opacity-80"
            title="Account Settings"
          >
            <CardContent className="grid grid-cols-3 gap-4 px-0">
              <MetricCard title="Tokens Used" value={dbUser.tokensUsed ?? 0} icon={<Package />} />
              <MetricCard
                title="Quotes Processed"
                value={dbUser.quotesProcessed ?? 0}
                icon={<Users />}
              />
              <MetricCard
                title="RFQs Processed"
                value={dbUser.rfqsProcessed ?? 0}
                icon={<Users />}
              />
              <MetricCard
                title="Fuel Tenders Processed"
                value={dbUser.fuelTendersProcessed ?? 0}
                icon={<Users />}
              />
              <MetricCard
                title="Fuel Bids Processed"
                value={dbUser.fuelBidsProcessed ?? 0}
                icon={<Users />}
              />
              <MetricCard
                title="Files Uploaded"
                value={dbUser.filesUploaded ?? 0}
                icon={<Users />}
              />
            </CardContent>
          </MainCard>
        </div>
      </main>
    </div>
  );
}
