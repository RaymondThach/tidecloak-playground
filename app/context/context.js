"use client"

import { createContext, useContext, useState, useEffect } from "react";
// Instead of tidecloak.json as writing to that configuration file rerenders the whole application.
import settings from "/tidecloak-demo-realm.json";
import { TideCloakProvider } from "@tidecloak/nextjs";
import LoadingPage from "../components/LoadingPage";
import { LoadingSquareFullPage } from "../components/loadingSquare";

// Create once, share, and  avoid creating on each rerender. 
const Context = createContext();

/**
 * Updating baseURL and realm name for all pages and components is done here.
 * @param {JSX.Element} children - all other child components, so that they can access these values 
 * @returns {JSX.Element} - HTML, wrapped around everything in layout.js
 */
export const Provider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState(null)
  useEffect(()=>{
    console.log(config)
  },[config])


    useEffect(() => {
    const doStuff = async () => {
        const res = await fetch('/api/tidecloakConfig');
        const data = await res.json();
        setConfig(data);
    }
    if (!config || Object.keys(config).length === 0 ) {
      doStuff();
    }
  }, [isInitialized]);



  if ( config && Object.keys(config).length > 0){
    return (
      <TideCloakProvider config={config}
                value={{
            setIsInitialized
          }}
      >
        {children}
      </TideCloakProvider>
    )
  }

  if (!config || Object.keys(config).length === 0) {

    return (
      <Context.Provider
        value={{
          setIsInitialized
        }}
      >
      <LoadingPage
        setKcData={setConfig}
        setIsInitialized={setIsInitialized}
      />
      </Context.Provider>
    );
  }
  return <overlayLoading/>

};

// Custom hook to call shared values in components
export const useAppContext = () => useContext(Context);
