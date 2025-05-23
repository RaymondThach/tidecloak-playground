"use client";

import { createContext, useContext, useState, useEffect } from "react";
import IAMService from "../../lib/IAMService";

// Create shared context
const Context = createContext();

/**
 * Loads config and auth status and provides app-wide context.
 */
export const Provider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const [baseURL, setBaseURL] = useState("");
  const [realm, setRealm] = useState("");

  useEffect(() => {
    const initContext = async () => {
      try {
        const [settingsRes, adapterRes] = await Promise.all([
          fetch("/test-realm.json"),
          fetch("/api/tidecloak"),
        ]);

        const settings = await settingsRes.json();
        const adapter = await adapterRes.json();

        if (settings?.realm) setRealm(settings.realm);
        if (adapter && Object.keys(adapter).length > 0 && adapter["auth-server-url"]) {
          setBaseURL(adapter["auth-server-url"].replace(/\/$/, ""));
        }

        // Initialize IAM
        IAMService.initIAM((auth) => {
          setAuthenticated(auth);
          setContextLoading(false);
        });
      } catch (err) {
        console.error("Failed to initialize app context:", err);
        setContextLoading(false);
      }
    };

    initContext();
  }, []);

  return (
    <Context.Provider value={{ realm, baseURL, authenticated, contextLoading }}>
      {children}
    </Context.Provider>
  );
};

// Custom hook to access shared context
export const useAppContext = () => useContext(Context);
