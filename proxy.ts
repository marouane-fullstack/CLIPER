import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // 🔥 IMPORTANT: allow Clerk webhooks to pass through
  if (pathname === "/api/webhooks/clerk") {
    return NextResponse.next();
  }

  const { userId } = await auth();
  const url = req.nextUrl;

  // Protect dashboard
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: "/sign-in",
    });
  }

  // Prevent logged-in users from auth pages
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js|json|png|jpg|jpeg|gif|svg|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};