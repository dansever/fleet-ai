import { User } from '@/drizzle/types';

type OrgScopedResource = {
  orgId: string;
};

type UserScopedResource = {
  userId: string;
};

/*
  Authorizes access to a resource by checking if the resource's organization id
  matches the requesting user's organization.
*/
export function authorizeResource<T extends OrgScopedResource | UserScopedResource>(
  resource: T | null | undefined,
  user: User,
): boolean {
  if (!resource) return false;

  if ('orgId' in resource && user.orgId) {
    return resource.orgId === user.orgId;
  }

  return false;
}
