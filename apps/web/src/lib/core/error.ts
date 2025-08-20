import { NextResponse } from 'next/server';

/*
  Returns a JSON response with an error message and status code.
  When to use
  - When you need to return an error response to the client.
*/
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
