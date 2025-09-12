'use client';

import { MainCard } from '@/stories/Card/Card';
import { KeyValuePair } from '@/stories/KeyValuePair/KeyValuePair';
import { useSettings } from '../ContextProvider';

export default function AccountPage() {
  const { user, org } = useSettings();
  return (
    <div className="grid grid-cols-5 gap-4">
      <MainCard className="col-span-3" title="Personal Settings">
        <div className="flex flex-col gap-2">
          <h3>Details</h3>
          <KeyValuePair
            label="Name"
            value={user.firstName + ' ' + user.lastName}
            valueType="string"
          />
          <KeyValuePair label="Email" value={user.email} valueType="email" />
          <KeyValuePair label="Position" value={user.position} valueType="string" />
          <h3>AI Details</h3>
          <KeyValuePair label="AI Tokens Used" value={user.tokensUsed} valueType="number" />
          <KeyValuePair
            label="Total Quotes Processed"
            value={user.quotesProcessed}
            valueType="number"
          />
          <KeyValuePair
            label="Total RFQs Processed"
            value={user.rfqsProcessed}
            valueType="number"
          />
          <KeyValuePair
            label="Last Seen At"
            value={user.lastSeenAt ? user.lastSeenAt.toISOString() : null}
            valueType="date"
          />
          <KeyValuePair
            label="Created At"
            value={user.createdAt ? user.createdAt.toISOString() : null}
            valueType="date"
          />
          <KeyValuePair
            label="Updated At"
            value={user.updatedAt ? user.updatedAt.toISOString() : null}
            valueType="date"
          />
        </div>
      </MainCard>
      <MainCard className="col-span-2" title="Organizational Settings">
        <div className="flex flex-col gap-2">
          <h3>Details</h3>
          <KeyValuePair label="Organization Name" value={org.name} valueType="string" />
          <h3>AI Usage</h3>
          <KeyValuePair label="AI Tokens Used" value={org.tokensUsed} valueType="number" />
          <KeyValuePair label="Quotes Processed" value={org.quotesProcessed} valueType="number" />
          <KeyValuePair label="RFQs Processed" value={org.rfqsProcessed} valueType="number" />
          <KeyValuePair
            label="Fuel Tenders Processed"
            value={org.fuelTendersProcessed}
            valueType="number"
          />
          <KeyValuePair
            label="Fuel Bids Processed"
            value={org.fuelBidsProcessed}
            valueType="number"
          />
          <KeyValuePair label="Files Uploaded" value={org.filesUploaded} valueType="number" />
        </div>
      </MainCard>
    </div>
  );
}
