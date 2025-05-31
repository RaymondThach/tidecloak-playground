"use client";

import { createContext, useContext, useState, useEffect } from "react";
import settings from "../../test-realm.json";
import IAMService from "../../lib/IAMService";

const Context = createContext();

/**
 * Provides authentication context for the app.
 * Wrap this around your layout or root component.
 */
export const Provider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [overlayLoading, setOverlayLoading] = useState(true);
  const [reInitialize, setReInitialize] = useState(0);
  const [baseURL, setBaseURL] = useState("");

  const realm = settings.realm;

  useEffect(() => {
    console.log("🔁 Running IAMService.initIAM...");
    IAMService.initIAM((auth) => {
      console.log("✅ IAMService callback hit");
      setBaseURL(IAMService.getBaseUrl());
      setAuthenticated(auth);
      setContextLoading(false);
      setOverlayLoading(false);
    });
  }, [reInitialize]);


  return (
    <Context.Provider
      value={{
        realm,
        baseURL,
        authenticated,
        contextLoading,
        overlayLoading,
        setOverlayLoading,
        setReInitialize,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useAppContext = () => useContext(Context);
