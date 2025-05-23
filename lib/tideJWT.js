import { jwtVerify, createLocalJWKSet } from "jose";

/**
 * Load and parse the latest TideCloak configuration via API (Edge Runtime compatible).
 */
async function loadKcData() {
  try {
    const res = await fetch("/api/tidecloak");
    if (!res.ok) {
      console.error("[TideJWT] Failed to fetch config, status:", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("[TideJWT] Error fetching config:", err);
    return null;
  }
}

/**
 * Verify a JWT token issued by TideCloak.
 * @param {string} token - The JWT to verify.
 * @param {string} allowedRole - A required realm role (optional).
 * @returns {Object|null} - Decoded payload or null on failure.
 */
export async function verifyTideCloakToken(token, allowedRole = "") {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    const kcData = await loadKcData();
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
