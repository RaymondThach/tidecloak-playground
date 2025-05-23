import TideCloak from "tidecloak-js";

let _tc = null;

/**
 * Fetch and cache the TideCloak client config, instantiate client once.
 */
async function getTideCloakClient() {
  if (_tc) return _tc;
  try {
    const res = await fetch("/api/tidecloak");
    const kcData = await res.json();

    if (!kcData || Object.keys(kcData).length === 0) {
      console.warn("[getTideCloakClient] tidecloak.json is empty.");
      return null;
    }

    _tc = new TideCloak({
      url: kcData["auth-server-url"],
      realm: kcData["realm"],
      clientId: kcData["resource"],
      vendorId: kcData["vendorId"],
      homeOrkUrl: kcData["homeOrkUrl"],
    });

    return _tc;
  } catch (error) {
    console.error("[getTideCloakClient] Failed to load config:", error);
    return null;
  }
}

/**
 * Refresh token if needed, updating cookie on success.
 */
async function updateIAMToken() {
  const tidecloak = await getTideCloakClient();
  if (!tidecloak) return;

  try {
    const refreshed = await tidecloak.updateToken(300);
    const expSeconds = Math.round(tidecloak.tokenParsed.exp + tidecloak.timeSkew - Date.now() / 1000);

    if (refreshed) {
      console.debug(`[updateIAMToken] Token refreshed, valid for ${expSeconds} seconds`);
      document.cookie = `kcToken=${tidecloak.token}; path=/;`;
    } else {
      console.debug(`[updateIAMToken] Token not refreshed, still valid for ${expSeconds} seconds`);
    }
  } catch (err) {
    console.error("[updateIAMToken] Failed to refresh token", err);
    throw err;
  }
}

/**
 * Initialize TideCloak on the client side.
 */
async function initIAM(onReadyCallback) {
  if (typeof window === "undefined") return;

  const tidecloak = await getTideCloakClient();
  if (!tidecloak) return;

  tidecloak.onTokenExpired = updateIAMToken;

  if (!tidecloak.didInitialize) {
    tidecloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        if (authenticated && tidecloak.token) {
          document.cookie = `kcToken=${tidecloak.token}; path=/;`;
        }
        onReadyCallback?.(authenticated);
      })
      .catch((err) => console.error("[initIAM] init error:", err));
  } else {
    onReadyCallback?.(true);
  }
}

/**
 * Redirect user to login.
 */
async function doLogin() {
  const tidecloak = await getTideCloakClient();
  if (tidecloak) {
    tidecloak.login({ redirectUri: `${window.location.origin}/auth/redirect` });
  }
}

/**
 * Encrypt data via TideCloak.
 */
async function doEncrypt(data) {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? tidecloak.encrypt(data) : null;
}

/**
 * Decrypt data via TideCloak.
 */
async function doDecrypt(data) {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? tidecloak.decrypt(data) : null;
}

/**
 * Logout and clear token cookie.
 */
async function doLogout() {
  const tidecloak = await getTideCloakClient();
  document.cookie = "kcToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  tidecloak?.logout({ redirectUri: `${window.location.origin}/auth/redirect` });
}

/**
 * Check if user is logged in.
 */
async function isLoggedIn() {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? !!tidecloak.token : false;
}

/**
 * Get a valid token, refreshing if close to expiry.
 */
async function getToken() {
  const tidecloak = await getTideCloakClient();
  if (!tidecloak) return null;

  const exp = Math.round(tidecloak.tokenParsed.exp + tidecloak.timeSkew - Date.now() / 1000);
  if (exp < 3) {
    try {
      await updateIAMToken();
      console.debug('[getToken] Token refreshed');
    } catch (error) {
      console.error('[getToken] Refresh failed', error);
      tidecloak.logout();
      return null;
    }
  }
  return tidecloak.token;
}

/**
 * Get username from token.
 */
async function getName() {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? tidecloak.tokenParsed?.preferred_username : null;
}

/**
 * Get token expiry in seconds.
 */
async function getTokenExp() {
  const tidecloak = await getTideCloakClient();
  return tidecloak
    ? Math.round(tidecloak.tokenParsed.exp + tidecloak.timeSkew - Date.now() / 1000)
    : null;
}

/**
 * Check for a realm role.
 */
async function hasOneRole(role) {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? tidecloak.hasRealmRole(role) : false;
}

/**
 * Get custom value from token.
 */
async function getValueFromToken(key) {
  const tidecloak = await getTideCloakClient();
  return tidecloak ? tidecloak.tokenParsed[key] : null;
}

/**
 * Force immediate token refresh.
 */
async function updateToken() {
  const tidecloak = await getTideCloakClient();
  if (!tidecloak) return;
  try {
    const refreshed = await tidecloak.updateToken(-1);
    const expSec = Math.round(tidecloak.tokenParsed.exp + tidecloak.timeSkew - Date.now() / 1000);
    if (refreshed) {
      document.cookie = `kcToken=${tidecloak.token}; path=/;`;
      console.debug(`[updateToken] Refreshed, valid for ${expSec} sec`);
    }
  } catch (err) {
    console.error('[updateToken] Error', err);
    throw err;
  }
}

const IAMService = {
  getTideCloakClient,
  initIAM,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  getName,
  hasOneRole,
  getTokenExp,
  doEncrypt,
  doDecrypt,
  getValueFromToken,
  updateIAMToken,
  updateToken
};

export default IAMService;
