'use client'
import { useState, useEffect, useCallback  } from "react";
import { TideCloakProvider, useTideCloak } from "@tidecloak/nextjs";
import LoadingPage from "../components/LoadingPage";
import { LoadingSquareFullPage } from "../components/loadingSquare";
import appService from "../../lib/appService";

export function EncryptionTrigger() {
  const {
    authenticated,
    getValueFromToken,
    getValueFromIdToken,
    token,
    forceRefreshToken,
    doEncrypt,
    getConfig,
  } = useTideCloak();

  const startUserInfoEncryption = useCallback(async () => {
    console.log('[Encryption] 🔐 start');
    try {
      // Pull the *actual* runtime config
      const { realm, baseURL } = getConfig();
      console.log('[Encryption] using realm/baseURL:', realm, baseURL);

      // Get all three IDs from the same source
      const vuid = getValueFromToken('vuid');
      const dob  = getValueFromIdToken('dob');
      const cc   = getValueFromIdToken('cc');
      console.log('[Encryption] tokens:', { vuid, dob, cc });

      // Fetch user
      const [user] = await appService.getUserByVuid(baseURL, realm, token, vuid) || [];
      if (!user) {
        console.warn('[Encryption] no user record found for vuid:', vuid);
        return;
      }
      console.log('[Encryption] fetched user:', user);

      // Build the payload
      const toEncrypt = [];
      if (dob && !/[A-Za-z]/.test(dob)) toEncrypt.push({ data: dob, tags: ['dob'] });
      if (cc  && !/[A-Za-z]/.test(cc))  toEncrypt.push({ data: cc,  tags: ['cc'] });
      console.log('[Encryption] toEncrypt array:', toEncrypt);

      if (toEncrypt.length === 0) {
        console.log('[Encryption] ⚪ nothing to encrypt');
        return;
      }

      // Actually encrypt
      const encrypted = await doEncrypt(toEncrypt);
      console.log('[Encryption] encrypted output:', encrypted);

      if (encrypted[0]) user.attributes.dob = encrypted[0];
      if (encrypted[1]) user.attributes.cc  = encrypted[1];
      await appService.updateUser(baseURL, realm, user, token);
      console.log('[Encryption] user updated');

      await forceRefreshToken();
      console.log('[Encryption] 🔐 done');
    } catch (err) {
      console.error('[Encryption] ❌ error', err);
    }
  }, [
    getConfig,
    getValueFromToken,
    getValueFromIdToken,
    token,
    doEncrypt,
    forceRefreshToken,
  ]);

  useEffect(() => {
    console.log('[EncryptionTrigger] authenticated =', authenticated);
    if (authenticated) {
      void startUserInfoEncryption();
    }
  }, [authenticated, startUserInfoEncryption]);

  return null;
}

export function Provider({ children }) {
    const [isInitializing, setIsInitializing] = useState(null);
    const [overlayLoading, setOverlayLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);


    useEffect(() => {
        if (config !== null) return;

        fetch("/api/tidecloakConfig")
            .then(res => res.json())
            .then(data => {
                setConfig(data)
            })
            .catch(console.error);
    }, [isInitialized, config]);

    useEffect(() => {
        if (isInitializing === false || config === null) return;

        const hasData =
            config !== null &&
            typeof config === "object" &&
            Object.keys(config).length > 0;

        if (hasData) {
            setIsInitializing(false);
            setOverlayLoading(false);
        } else {
            setIsInitializing(true)
        }
    }, [config, isInitializing]);

    if (isInitializing !== null && isInitializing) {
        return (
            <LoadingPage
                isInitializing={isInitializing}
                setIsInitializing={setIsInitializing}
                setOverlayLoading={setOverlayLoading}
                setIsInitialized={setIsInitialized}
                setConfig={setConfig}
            />
        );
    }

    if (overlayLoading) {
        return <LoadingSquareFullPage />;
    }

    return (
        <TideCloakProvider config={config}>
            <EncryptionTrigger />
            {children}
        </TideCloakProvider>
    );
}
