// src/utils/enum-mappers.ts
// Utility functions to map between API enums and Prisma enums

import { ServiceSegment as PrismaServiceSegment } from '@prisma/client';
import type { ServiceSegmentLiteral } from '../shared/types/index.js';

// Define the API ServiceSegment type
 type ApiServiceSegment = ServiceSegmentLiteral;

/**
 * Maps from API ServiceSegment format to Prisma enum format
 * API uses mapped values: '4W-TNVS', '2W-TWG', etc.
 * Prisma uses enum names: FOUR_W_TNVS, TWO_W_TWG, etc.
 */
export function apiToPrismaServiceSegment(
  apiValue: ApiServiceSegment
): PrismaServiceSegment {
  const mapping: Record<ApiServiceSegment, PrismaServiceSegment> = {
    '4W-TNVS': PrismaServiceSegment.FOUR_W_TNVS,
    '2W-TWG': PrismaServiceSegment.TWO_W_TWG,
    '2W-SAL': PrismaServiceSegment.TWO_W_SAL,
    '4W-SAL': PrismaServiceSegment.FOUR_W_SAL,
  };

  return mapping[apiValue];
}

/**
 * Maps from Prisma ServiceSegment enum to API format
 * This is typically not needed as Prisma automatically returns mapped values,
 * but included for completeness
 */
export function prismaToApiServiceSegment(
  prismaValue: PrismaServiceSegment
): ApiServiceSegment {
  const mapping: Record<PrismaServiceSegment, ApiServiceSegment> = {
    [PrismaServiceSegment.FOUR_W_TNVS]: '4W-TNVS',
    [PrismaServiceSegment.TWO_W_TWG]: '2W-TWG',
    [PrismaServiceSegment.TWO_W_SAL]: '2W-SAL',
    [PrismaServiceSegment.FOUR_W_SAL]: '4W-SAL',
  };

  return mapping[prismaValue];
}

/**
 * Maps an array of API ServiceSegments to Prisma format
 */
export function apiToPrismaServiceSegmentArray(
  apiValues: ApiServiceSegment[]
): PrismaServiceSegment[] {
  return apiValues.map(apiToPrismaServiceSegment);
}
