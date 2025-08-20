import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public and auth routes
const isPublicRoute = createRouteMatcher(['/', '/landing-page', '/sign-in(.*)', '/sign-up(.*)']);
const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

// Middleware to protect routes
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;
  const { pathname } = url;

  // Redirect root based on auth
  if (pathname === '/') {
    url.pathname = userId ? '/dashboard' : '/landing-page';
    return NextResponse.redirect(url);
  }

  // Prevent signed-in users from visiting sign-in/up
  if (userId && isAuthPage(req)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    // If not authenticated, this will redirect to sign-in automatically
    await auth.protect();
  }

  // Allow public routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
