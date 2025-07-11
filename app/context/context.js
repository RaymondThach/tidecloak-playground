'use client'
import { useState, useEffect } from "react";
import { TideCloakProvider } from "@tidecloak/nextjs";
import LoadingPage from "../components/LoadingPage";
import { LoadingSquareFullPage } from "../components/loadingSquare";

export function Provider({ children }) {
    const [isInitializing, setIsInitializing] = useState(null);
    const [overlayLoading, setOverlayLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        console.log(overlayLoading)
    }, [overlayLoading])


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
        }else {
            setIsInitializing(true)
        }
    }, [config, isInitializing]);

    if (setIsInitializing !== null && isInitializing) {
        return (
            <LoadingPage
                isInitializing={isInitializing}
                setIsInitializing={setIsInitializing}
                setOverlayLoading={setOverlayLoading}
                setIsInitialized={setIsInitialized}
            />
        );
    }

    if (overlayLoading) {
        return <LoadingSquareFullPage />;
    }

    return (
        <TideCloakProvider config={config}>
            {children}
        </TideCloakProvider>
    );
}
