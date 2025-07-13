"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { LoadingSquareFullPage } from "../../components/loadingSquare";
import appService from "../../../lib/appService";
import { useTideCloak } from "@tidecloak/nextjs";

/**
 * Manages which path the demo should go down depending on token validity
 * @returns - this redirect path instead of return something it pushes to a different path
 */
export default function RedirectPage() {

  const {authenticated, isInitializing, logout } = useTideCloak();
  const router = useRouter();



  // Handles redirect when middle detects token expiry
  useEffect(() => {
    const doLogOut = async () => {
      logout();
    }
    // Must be placed inside useEffect, because parameters don't exist during build for production
    // Parse the query string with URLSearchParams instead of useSearchParams()
    // useSearchParams() causes build issues in non-pure client components so this /auth/redirect wouldn't prerender.
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "failed") {
      sessionStorage.setItem("tokenExpired", "true");
      doLogOut();
    }
  }, [])

  // Handles redirect when loading context
  useEffect(() => {
    if (!isInitializing) {
      if (authenticated) {
        router.push("/home");
      }
      else {
        router.push("/");
      }
    }
  }, [isInitializing]);

  return <LoadingSquareFullPage />
}
