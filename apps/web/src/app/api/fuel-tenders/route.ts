import {
  createFuelTender,
  deleteFuelTender,
  getFuelTenderById,
  getFuelTendersByAirportId,
  getFuelTendersByOrgId,
  updateFuelTender,
} from '@/db/fuel/fuel-tenders/db-actions';
import type { NewFuelTender, UpdateFuelTender } from '@/drizzle/types';
import { authorizeResource } from '@/lib/authorization/authorize-resource';
import { authorizeUser } from '@/lib/authorization/authorize-user';
import { jsonError } from '@/lib/core/errors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/fuel-tenders
 * Query parameters:
 * - id: string (get specific fuel tender)
 * - airportId: string (get fuel tenders by airport)
 * - orgId: string (get fuel tenders by organization - defaults to current user's org)
 */
export async function GET(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const airportId = searchParams.get('airportId');
    const requestedOrgId = searchParams.get('orgId') || orgId;

    // User can only access fuel tenders from their own organization
    if (requestedOrgId !== orgId) return jsonError('Unauthorized', 401);

    // Get specific fuel tender by ID
    if (id) {
      const fuelTender = await getFuelTenderById(id);
      if (!fuelTender) return jsonError('Fuel tender not found', 404);

      // Authorize access to fuel tender
      if (!authorizeResource(fuelTender, dbUser)) {
        return jsonError('Unauthorized', 401);
      }

      return NextResponse.json(fuelTender);
    }

    // Get fuel tenders by airport
    if (airportId) {
      const fuelTenders = await getFuelTendersByAirportId(airportId);

      // Filter to only include tenders from user's organization
      const authorizedTenders = fuelTenders.filter((tender) => authorizeResource(tender, dbUser));

      return NextResponse.json(authorizedTenders);
    }

    // Default: Get all fuel tenders for organization
    const fuelTenders = await getFuelTendersByOrgId(orgId);
    return NextResponse.json(fuelTenders);
  } catch (error) {
    console.error('Error fetching fuel tenders:', error);
    return jsonError('Failed to fetch fuel tenders', 500);
  }
}

/**
 * POST /api/fuel-tenders
 * Create a new fuel tender
 */
export async function POST(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Parse request body
    const body = await request.json();
    const fuelTenderData: NewFuelTender = {
      ...body,
      orgId, // Ensure fuel tender belongs to user's organization
    };

    // Validate required fields
    if (!fuelTenderData.title || !fuelTenderData.airportId) {
      return jsonError('Missing required fields: title, airportId', 400);
    }

    // Create fuel tender
    const fuelTender = await createFuelTender(fuelTenderData);
    return NextResponse.json(fuelTender, { status: 201 });
  } catch (error) {
    console.error('Error creating fuel tender:', error);
    return jsonError('Failed to create fuel tender', 500);
  }
}

/**
 * PUT /api/fuel-tenders
 * Update an existing fuel tender
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/fuel-tenders');

    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get fuel tender ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Fuel tender ID is required', 400);

    // Check if fuel tender exists and user has access
    const existingFuelTender = await getFuelTenderById(id);
    if (!existingFuelTender) return jsonError('Fuel tender not found', 404);

    if (!authorizeResource(existingFuelTender, dbUser)) {
      return jsonError('Unauthorized', 401);
    }

    // Parse request body and handle date conversion
    const body = await request.json();

    // Create update data from body, excluding system fields
    const updateData: UpdateFuelTender = {
      title: body.title,
      description: body.description,
      fuelType: body.fuelType,
      baseCurrency: body.baseCurrency,
      baseUom: body.baseUom,
      biddingStarts: body.biddingStarts,
      biddingEnds: body.biddingEnds,
      deliveryStarts: body.deliveryStarts,
      deliveryEnds: body.deliveryEnds,
      status: body.status,
      // Don't include orgId, id, createdAt, updatedAt - these are managed by the system
    };

    // Update fuel tender
    const updatedFuelTender = await updateFuelTender(id, updateData);
    return NextResponse.json(updatedFuelTender);
  } catch (error) {
    console.error('Error updating fuel tender:', error);
    return jsonError('Failed to update fuel tender', 500);
  }
}

/**
 * DELETE /api/fuel-tenders
 * Delete a fuel tender
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authorize user
    const { dbUser, error } = await authorizeUser();
    if (error || !dbUser) return jsonError('Unauthorized', 401);

    const orgId = dbUser.orgId;
    if (!orgId) return jsonError('User has no organization', 403);

    // Get fuel tender ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return jsonError('Fuel tender ID is required', 400);

    // Check if fuel tender exists and user has access
    const existingFuelTender = await getFuelTenderById(id);
    if (!existingFuelTender) return jsonError('Fuel tender not found', 404);

    if (!authorizeResource(existingFuelTender, dbUser)) {
      return jsonError('Unauthorized', 401);
    }

    // Delete fuel tender
    await deleteFuelTender(id);
    return NextResponse.json({ message: 'Fuel tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting fuel tender:', error);
    return jsonError('Failed to delete fuel tender', 500);
  }
}
