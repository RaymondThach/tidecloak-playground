"use client";

import { useAppContext } from "./context/context";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import AccordionBox from "./components/accordionBox";
import Button from "./components/button";
import LoadingPage from "./components/LoadingPage";
import EmailInvitation from "./components/emailInvitation";
import { LoadingSquareFullPage } from "./components/loadingSquare";
import {
  FaExclamationCircle,
  FaChevronDown,
  FaCheckCircle,
} from "react-icons/fa";
import IAMService from "../lib/IAMService";
import appService from "../lib/appService";

function useTideConfig(authenticated) {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    console.log("SASHA!!!")
    if (authenticated) return; // no need to initialize if already logged in

    const tryLoadConfig = async () => {
      try {
        const config = await IAMService.loadConfig();
        const isEmpty = !config || Object.keys(config).length === 0;
        if (isEmpty) {
          setIsInitializing(true);
        }
      } catch (err) {
        console.error("Failed to load config in useTideConfig:", err);
        setIsInitializing(true); // fallback: assume we need to initialize
      }
    };

    tryLoadConfig();
  }, [authenticated]);

  return { isInitializing, setIsInitializing };
}
function useTideLink(baseURL) {
  const [isLinked, setIsLinked] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [showLinkedMsg, setShowLinkedMsg] = useState(false);

  const updateDomain = useCallback(async () => {
    const res = await fetch("/api/updateCustomDomainURL");
    if (!res.ok) throw new Error("Failed to update domain");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkLinkParams() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("linkedTide") === "true") {
        setShowLinkedMsg(true);
        try {
          await updateDomain();
        } catch {}
        params.delete("linkedTide");
        const qs = params.toString();
        window.history.replaceState(
          {},
          "",
          window.location.pathname + (qs ? `?${qs}` : "")
        );
      }
    }

    async function fetchInvite() {
      try {
        const res = await fetch("/api/inviteUser");
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.inviteURL) {
          setInviteLink(data.inviteURL);
          setIsLinked(false);
        } else {
          setIsLinked(true);
        }
      } catch (err) {
        if (!cancelled) console.error("[Login] Invite fetch failed:", err);
        setIsLinked(true);
      }
    }

    if (baseURL) {
      checkLinkParams();
      fetchInvite();
    }

    return () => {
      cancelled = true;
    };
  }, [baseURL, updateDomain]);

  return { isLinked, inviteLink, showLinkedMsg };
}

export default function Login() {

  const {
    authenticated,
    baseURL,
    overlayLoading,
    setReInitialize,
  } = useAppContext();

  console.log("⚡ context:", useAppContext());


  const { isInitializing, setIsInitializing } = useTideConfig(authenticated);
  const { isLinked, inviteLink, showLinkedMsg } = useTideLink(baseURL);

  const [showLoginAccordion, setShowLoginAccordion] = useState(false);
  const [showBackendDetails, setShowBackendDetails] = useState(false);
  const [showError, setShowError] = useState(false);
  const [portIsPublic, setPortIsPublic] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authenticated && baseURL) {
      router.push("/auth/redirect");
    }
  }, [authenticated, baseURL, router]);

  useEffect(() => {
    if (sessionStorage.getItem("tokenExpired")) {
      setShowError(true);
    }

    const config = IAMService._config;
    const url = config?.["auth-server-url"];
    if (url) {
      (async () => {
        try {
          const checkUrl = `${url}/realms/master/.well-known/openid-configuration`;
          const res = await appService.checkPort(checkUrl);
          setPortIsPublic(res.ok);
        } catch {
          setPortIsPublic(false);
        }
      })();
    }
  }, [baseURL]);

  const handleLogin = async () => {
    sessionStorage.removeItem("tokenExpired");
    setPortIsPublic(true);

    try {
      const res = await fetch("/api/inviteUser");
      const data = await res.json();
      if (res.ok && data.inviteURL) {
        router.push(data.inviteURL);
      } else {
        IAMService.doLogin();
      }
    } catch (err) {
      console.error("[Login] handleLogin error:", err);
    }
  };

  // ── EARLY RETURNS ──
  if (isInitializing) {
    return (
      <LoadingPage
        isInitializing={isInitializing}
        setIsInitializing={setIsInitializing}
        setReInitialize={setReInitialize}
      />
    );
  }

  if (!isLinked && !overlayLoading) {
    return <EmailInvitation inviteLink={inviteLink} />;
  }

  if (overlayLoading) {
    return <LoadingSquareFullPage />;
  }

  const adminAddress =
    IAMService._config?.["auth-server-url"] || "Need to setup backend first.";

  return (
    <main className="flex-grow w-full pt-6 pb-16">
      <div className="w-full px-8 max-w-screen-md mx-auto flex flex-col items-start gap-8">
        <div className="w-full max-w-3xl">
          {pathname === "/" && (
            <>
              <button
                onClick={() => setShowLoginAccordion((x) => !x)}
                className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                aria-label="Toggle explainer"
              >
                {showLoginAccordion ? "🤯" : "🤔"}
              </button>

              <AccordionBox
                title="Why is this login special?"
                isOpen={showLoginAccordion}
              >
                <p>
                  This login showcases{" "}
                  <strong>TideCloak's decentralized IAM model</strong>.
                </p>
                <p>
                  Admin powers are <strong>quorum-controlled</strong>, not unilateral.
                </p>
                <p>No backdoors—provable security in action.</p>
              </AccordionBox>

              <div className="bg-blue-50 rounded shadow p-6 space-y-4">
                <img
                  src="/playground-logo_nav.png"
                  alt="Logo"
                  className="h-10 w-auto"
                />
                <h2 className="text-3xl font-bold">
                  Welcome to Play – a demo of provable security in action
                </h2>
                <p>
                  Your admin is breached. IAM vendor compromised. Cloud host
                  exposed.
                  <br />
                  And still—no data leaks, no identities stolen, no access
                  abused.
                </p>
                <h3 className="text-xl font-semibold">Secure “BYOiD” Login</h3>
                <p>
                  Log in like normal—your password is never stored, shared, or
                  exposed.
                </p>
                <Button onClick={handleLogin} className="hover:bg-red-700">
                  Login
                </Button>
                <p className="text-sm italic text-gray-600 mt-3">
                  Identity for your eyes only.
                </p>

                {showError && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationCircle className="mr-1" />
                    <span>Your session has expired. Please login again.</span>
                  </div>
                )}
                {portIsPublic === false && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationCircle className="mr-1" />
                    <span>
                      TideCloak port is private—make it public to connect.
                    </span>
                  </div>
                )}
                {showLinkedMsg && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <FaCheckCircle className="mr-1" />
                    <span>You’ve linked your Tide account! Please login.</span>
                  </div>
                )}
              </div>

              <div className="pl-6 mt-2">
                <button
                  onClick={() => setShowBackendDetails((x) => !x)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-500 text-sm transition"
                >
                  <span>View TideCloak Backend</span>
                  <FaChevronDown
                    className={`transform transition-transform duration-300 ${
                      showBackendDetails ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showBackendDetails && (
                  <AccordionBox title="TideCloak Administration" isOpen>
                    <p className="mb-4">
                      Explore your fully-fledged IAM system’s admin console:
                    </p>
                    <div className="border border-dashed border-gray-500 p-4">
                      <ul className="list-disc list-inside">
                        <li>
                          Visit:{" "}
                          <a href={adminAddress} className="text-blue-600">
                            {adminAddress}
                          </a>
                        </li>
                        <li>Credentials: admin / password</li>
                      </ul>
                    </div>
                  </AccordionBox>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="h-10" />
    </main>
  );
}
