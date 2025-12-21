// src/lib/crypto/types.ts

import type { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';

/**
 * Blinded token sent from client to server for signing.
 */
export interface BlindedTokenRequest {
  profId: string;
  blindedMessage: string;
}

/**
 * Signed blinded token returned from server.
 */
export interface BlindedTokenResponse {
  profId: string;
  blindedSignature: string;
}

/**
 * Token claim request - array of blinded tokens for all professors.
 */
export interface ClaimBatchRequest {
  cycleId: string;
  blindedTokens: BlindedTokenRequest[];
}

/**
 * Token claim response.
 */
export interface ClaimBatchResponse {
  cycleId: string;
  blindedSignatures: BlindedTokenResponse[];
  publicKeyN: string;
  publicKeyE: string;
}

/**
 * Anonymous review submission payload.
 */
export interface AnonymousReviewSubmission {
  tokenUuid: string;
  signature: string;
  profId: string;
  cycleId: string;
  encryptedBlob: string; // AES-256-GCM encrypted review JSON
  encryptedKey: string; // RSA-OAEP encrypted AES key
}

/**
 * Decrypted review content (after shuffle decrypts it).
 */
export interface ReviewContent {
  text: string;
  rating: number; // Keep for backwards compatibility
  courseCode: string;
  semester: string;
  timestamp: number;
  // Full review data for stats processing
  ratings: ProfessorRating | CourseRating;
  statistics: ProfessorPercentages | CoursePercentages;
  grade?: string;
  type: 'professor' | 'course';
}
