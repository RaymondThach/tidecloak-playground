// an example nextJS middleware router that does server-side validation on all traffic to secure pages
import { NextResponse } from "next/server";
import { createTideCloakMiddleware } from "@tidecloak/nextjs/server";


// module‐scope cache
let tcConfig;
let initPromise;

/**
 * Fetch your JSON a single time and stash it in 'tcConfig'.
 * On the very first call it does the fetch; after that it just
 * returns the same promise (already resolved).
 */
function initConfig(requestUrl) {
  if (!initPromise) {
    initPromise = fetch(new URL("/api/tidecloakConfig", requestUrl))
      .then(res => (res.ok ? res.json() : {}))
      .then(json => { tcConfig = json; })
      .catch(() => { tcConfig = {}; });
  }
  return initPromise;
}

export async function middleware(req) {
  // ensure tcConfig is loaded (only on first request)
  await initConfig(req.url);

  // build a TideCloak handler with that cached tcConfig
  const handler = createTideCloakMiddleware({
    config: tcConfig,
    protectedRoutes: {
      "/user": ["offline_access"],
      "/admin": ["offline_access"],
      "/databaseExposure": ["offline_access"]
    },
    onFailure: (ctx, req) => {
      console.debug("Token verification failed");
      return NextResponse.json(
        { error: 'Access forbidden: invalid token' },
        { status: 403 }
      )
    },
    onSuccess: (ctx, req) => {
      return NextResponse.next();
    },
    onError: (ctx, req) => {
      console.error("[Middleware] ", err);
      return NextResponse.redirect(new URL("/auth/redirect", req.url));
    }
  });

  // 3) invoke it
  return handler(req);
}

export const config = {
  matcher: [
    "/home/:path*",
    "/user/:path*",
    "/admin/:path*",
    "/databaseExposure/:path*",
  ],
};