"use client";

import { createContext, useContext, useState, useEffect } from "react";
// Instead of tidecloak.json as writing to that configuration file rerenders the whole application.
import settings from "/test-realm.json";
import IAMService from "../../lib/IAMService";

// Create once, share, and  avoid creating on each rerender.
const Context = createContext();

/**
 * Updating baseURL and realm name for all pages and components is done here.
 * @param {JSX.Element} children - all other child components, so that they can access these values
 * @returns {JSX.Element} - HTML, wrapped around everything in layout.js
 */
export const Provider = ({ children }) => {
  const [configLoading, setConfigLoading] = useState(true);
  const [tidecloakConfig, setTidecloakConfig] = useState();
  const [authenticated, setAuthenticated] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const [overlayLoading, setOverlayLoading] = useState(true);
  // const [isInitialized, setIsInitialized] = useState(false);
  const [baseURL, setBaseURL] = useState("");
  const realm = settings.realm;

  useEffect(() => {
    const tryGetConfig = async () => {
      try {
        const adapter = await IAMService.loadConfig();
        setTidecloakConfig(adapter || {}); // fallback to {}
        console.log("SEETTING CONFIG!!! " + adapter)
      } catch (err) {
        console.error("Failed to load config:", err);
        setTidecloakConfig({});
      } finally {
        console.log("SEETTING CONFIG LOADING!!! ")
        setConfigLoading(false);
      }
    };

    tryGetConfig();
  }, []);

  useEffect(() => {
    const initContext = async () => {
      try {
        if (tidecloakConfig?.["auth-server-url"]) {
          setBaseURL(tidecloakConfig["auth-server-url"].replace(/\/$/, ""));
        }

        // 2) Run the SSO check
        IAMService.initIAM((auth) => {
          setAuthenticated(auth);
          setContextLoading(false);
          setOverlayLoading(false);
        });
      } catch (err) {
        console.error("Failed to initialize app context:", err);
        setContextLoading(false);
        setOverlayLoading(false);
      }
    };
    if (tidecloakConfig && Object.keys(tidecloakConfig).length > 0) {
      initContext();
    }
  }, [tidecloakConfig]);

  return (
    <Context.Provider
      value={{
        realm,
        baseURL,
        authenticated,
        contextLoading,
        overlayLoading,
        configLoading,
        setOverlayLoading,
        tidecloakConfig,
        setTidecloakConfig,
      }}
    >
      {children}
    </Context.Provider>
  );
};

// Custom hook to call shared values in components
export const useAppContext = () => useContext(Context);
