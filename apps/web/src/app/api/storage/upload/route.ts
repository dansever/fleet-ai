import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { jsonError } from '@/lib/core/errors';
import { server as orgServer } from '@/modules/core/organizations';
import { Bucket, uploadFile } from '@/services/files';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) return jsonError('Unauthorized', 401);

  const org = await orgServer.getOrgById(orgId);
  if (!org || !org.name) return jsonError('Organization not found', 404);

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const bucket = formData.get('bucket') as Bucket;
  const res = await uploadFile({ file, bucket, orgName: org.name });
  return NextResponse.json(res);
}
