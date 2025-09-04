'use client';

import { LoadingComponent } from '@/components/miscellaneous/Loading';
import { Contact } from '@/drizzle/types';
import { cn } from '@/lib/utils';
import { Button } from '@/stories/Button/Button';
import { MainCard } from '@/stories/Card/Card';
import { Column, DataTable } from '@/stories/DataTable/DataTable';
import { Building2, Mail, Phone, RefreshCw, User, UserPlus } from 'lucide-react';
import { useAirportHub } from '../ContextProvider';

export default function ContactsAndProviders() {
  const { selectedAirport, contacts, loading, errors, refreshContacts, addContact } =
    useAirportHub();

  const contactColumns: Column<Contact>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      accessor: (contact) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {contact.name ? contact.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{contact.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">{contact.role || 'No role specified'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact Information',
      accessor: (contact) => (
        <div className="space-y-1">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                {contact.phone}
              </a>
            </div>
          )}
          {!contact.email && !contact.phone && (
            <span className="text-sm text-gray-500">No contact info</span>
          )}
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      accessor: (contact) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{contact.department || 'Not specified'}</span>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Type',
      sortable: true,
      accessor: (contact) => (
        <div className="flex items-center gap-2">
          {contact.vendorId ? (
            <>
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                Vendor Contact
              </span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-blue-500" />
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                Airport Contact
              </span>
            </>
          )}
        </div>
      ),
    },
  ];

  // Loading state - Only show when loading contacts for initial load or airport selection, not refresh
  if (loading.contacts && !loading.isRefreshing && contacts.length === 0) {
    return <LoadingComponent size="md" />;
  }

  // Error state
  if (errors.contacts) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error Loading Contacts</p>
          <p className="text-sm">{errors.contacts}</p>
        </div>
        <Button intent="secondary" text="Try Again" icon={RefreshCw} onClick={refreshContacts} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <MainCard
        title="Airport Contacts"
        subtitle={`All contacts associated with ${selectedAirport?.name || 'this airport'} including direct airport contacts and vendor contacts.`}
        neutralHeader={true}
        actions={
          <div className="flex gap-2">
            <Button
              intent="ghost"
              icon={RefreshCw}
              className={cn(loading.contacts && loading.isRefreshing && 'animate-spin')}
              disabled={loading.contacts && loading.isRefreshing}
              onClick={refreshContacts}
            />

            <Button
              intent="primary"
              text="Add Contact"
              icon={UserPlus}
              onClick={() => {
                console.log('Add contact clicked');
              }}
            />
          </div>
        }
      >
        <div>
          {/* Empty state when no contacts - Only show when not doing initial loading */}
          {contacts.length === 0 && !(loading.contacts && !loading.isRefreshing) ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h4>
              <p className="text-sm mb-4">
                No contacts have been added for {selectedAirport?.name || 'this airport'} yet.
              </p>
              <Button
                intent="primary"
                text="Add First Contact"
                icon={UserPlus}
                onClick={() => {
                  // TODO: Implement add contact functionality
                  console.log('Add first contact clicked');
                }}
              />
            </div>
          ) : (
            <DataTable
              data={contacts}
              columns={contactColumns}
              searchable={true}
              filterable={false}
              pagination={true}
              pageSize={10}
              onRowClick={(contact) => {
                // TODO: Implement contact details view
                console.log('Contact clicked:', contact);
              }}
              csvFilename={`${selectedAirport?.iata || 'airport'}-contacts`}
              showNormalizedRow={false}
            />
          )}
        </div>
      </MainCard>
    </div>
  );
}
