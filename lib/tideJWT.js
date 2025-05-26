import { jwtVerify, createLocalJWKSet } from "jose";

/**
 * Load and parse the latest TideCloak configuration
 * @param {Request} request  – the incoming Next.js request
 */
async function loadKcData(request) {
  // build an absolute URL against the incoming request’s origin
  const apiUrl = new URL("/api/tidecloakConfig", request.url).toString();
  console.log(apiUrl)
  const res    = await fetch(apiUrl);
  if (!res.ok) {
    console.error("[TideJWT] Failed to fetch config:", res.status);
    return null;
  }
  return res.json();
}

/**
 * Verify a JWT token issued by TideCloak.
 * @param {Request} request  – the incoming Next.js request
 * @param {string} token - The JWT to verify.
 * @param {string} allowedRole - A required realm role (optional).
 * @returns {Object|null} - Decoded payload or null on failure.
 */
export async function verifyTideCloakToken(request, token, allowedRole = "") {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const kcData = await loadKcData(request);
    if (!kcData) {
      throw new Error("Could not load tidecloak configuration");
    }

    const jwkData = kcData.jwk;
    if (!jwkData) {
      console.error(
        "[TideJWT] No JWKs found in tidecloak.json. Ensure client adapter is initialized."
      );
      return null;
    }

    const JWKS = createLocalJWKSet(jwkData);
    const baseUrl = kcData["auth-server-url"].replace(/\/+$/, "");
    const issuer = `${baseUrl}/realms/${kcData.realm}`;

    // Verify signature and issuer
    const { payload } = await jwtVerify(token, JWKS, { issuer });

    // Verify authorized party
    if (payload.azp !== kcData.resource) {
      throw new Error(
        `AZP mismatch: expected '${kcData.resource}', got '${payload.azp}'`
      );
    }

    // Verify realm roles
    if (
      allowedRole &&
      Array.isArray(payload.realm_access?.roles) &&
      !payload.realm_access.roles.includes(allowedRole)
    ) {
      throw new Error(
        `Required role '${allowedRole}' not present in [${payload.realm_access.roles}]`
      );
    }

    return payload;
  } catch (err) {
    console.error("[TideJWT] Token verification failed:", err);
    return null;
  }
}
