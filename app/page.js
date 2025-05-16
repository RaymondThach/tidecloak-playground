'use client';

import { useState, useEffect } from "react";
import AccordionBox from "./components/accordionBox";
import Button from "./components/button";
import kcData from "/tidecloak.json";
import {useAppContext} from "./context/context";
import IAMService from "../lib/IAMService";
import { usePathname, useRouter } from "next/navigation";
import {
  FaExclamationCircle,
} from "react-icons/fa";
import LoadingPage from "./components/LoadingPage";

/**
 * "/" path containing the Login page, logouts including token expiration is redirected here
 * @returns {JSX.Element} - HTML rendering the "/" path containing login functionality, message on token expiration and TideCloak backend address
 */
export default function Login() {
  // Current path "/"
  const pathname = usePathname();
  // Navigation manager
  const router = useRouter();
  // Expandable extra information
  const [showLoginAccordion, setShowLoginAccordion] = useState(false);
  // Shared context data to check if already authenticated skip this login screen
  const {authenticated} = useAppContext();
  // State for error message when token expires
  const [showError, setShowError] = useState(false);
  // TideCloak address
  const [baseURL, setBaseURL] = useState("Need to setup backend first.");
  // State to show initialiser when the tidecloak.json file has an empty object
  const [isInitializing, setIsInitializing] = useState(false);

  // Check authentication from context
  useEffect(() => {
    // Skip login screen if already logged in
    if (authenticated){
      router.push("/auth/redirect");
    }
    else if (!authenticated && Object.keys(kcData).length === 0) {
      // Show initialiser if tidecloak.json object is empty
      setIsInitializing(true);
    }

    // Get the TideCloak address from the tidecloak.json file if its object is filled by TideCloak
    if (kcData && Object.keys(kcData).length !== 0 && kcData["auth-server-url"]){
      setBaseURL(kcData["auth-server-url"]);
    }
  }, [authenticated])


  // Manage whether the token expired error should be shown using cached session data
  useEffect(() => {
    const tokenExpired = sessionStorage.getItem("tokenExpired");
    if (tokenExpired){
      setShowError(true);
    }
  }, [])


  // When the Login button is clicked, clear cached data and redirect to Tide Enclave
  const handleLogin = async () => {
    // If previously logged in remove this session variable.
    sessionStorage.removeItem("tokenExpired"); 
    IAMService.doLogin();
  };

  // Show the initialiser
  if (isInitializing) {
    return <LoadingPage isInitializing={isInitializing} setIsInitializing={setIsInitializing}/>;
  }
  
  return (
    true
    ?
      <main className="flex-grow w-full pt-6 pb-16">

        <div className="w-full px-8 max-w-screen-md mx-auto flex flex-col items-start gap-8">
          <div className="w-full max-w-3xl">
            {pathname === "/" && (
              <div key="user" className="space-y-4 relative pb-32 md:pb-40">

                {/* Accordion Toggle for Landing Page */}
                <button
                  onClick={() => setShowLoginAccordion(prev => !prev)}
                  className="absolute -top-2 right-0 text-2xl hover:scale-110 transition-transform"
                  aria-label="Toggle explainer"
                >
                  {showLoginAccordion ? "🤯" : "🤔"}
                </button>

                {/* Accordion Content */}
                <AccordionBox title="Why is this login special?" isOpen={showLoginAccordion}>
                  <p>
                    This login page showcases <strong>TideCloak's decentralized IAM model</strong>.
                  </p>
                  <p>
                    Admin powers, even login elevation, are <strong>quorum-controlled</strong> — not granted unilaterally.
                  </p>
                  <p>
                    The system itself has no backdoor. That’s the point.
                  </p>
                </AccordionBox>

                <div className="bg-blue-50 rounded shadow p-6 space-y-4">
                  <h2 className="text-3xl font-bold">Welcome to your demo app</h2>
                  <p>Traditional IAM is only as secure as the admins and systems managing it. TideCloak fundamentally removes this risk, by ensuring no-one holds the keys to the kingdom. Explore to learn how.</p>
                  <h3 className="text-xl font-semibold">BYOiD</h3>
                  <p className="text-base">Login or create an account to see the user experience demo.</p>
                  <Button onClick={handleLogin}>Login</Button>
                  {
                    showError
                    ? 
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <FaExclamationCircle className="mr-1" />
                      <span>Session expired.</span>
                    </div>
                    : null
                  }
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold mb-2">TideCloak Administration</h3>
                  <p className="mb-4">Check out the backend of TideCloak, your fully fledged IAM system.</p>
                  <div className="border border-dashed border-gray-500 p-4">
                    <ul className="list-disc list-inside">
                      <li>
                        Visit: <a href={baseURL} className="text-blue-600">{baseURL}</a>
                      </li>
                      <li>Use Credentials: admin / password</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
  : null
  );
}