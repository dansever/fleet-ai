import { NextResponse } from 'next/server';

/*
  Returns a JSON response with an error message and status code.
  When to use
  - When you need to return an error response to the client.
*/
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Error thrown when the database is unavailable.
 * Used to indicate that the database is unavailable.
 */
export class DBUnavailableError extends Error {
  constructor(public cause?: unknown) {
    super('DB_CONNECTION_FAILED');
    this.name = 'DBUnavailableError';
  }
}

/**
 * Convert any unknown value to an Error object.
 * @param e - The unknown value to convert.
 * @returns An Error object.
 */
export function asError(e: unknown): Error {
  if (e instanceof Error) return e;
  return new Error(typeof e === 'string' ? e : JSON.stringify(e));
}
