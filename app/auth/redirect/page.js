"use client";

import { useEffect } from "react";

import { useAppContext } from "../../context/context";

import { useRouter } from "next/navigation";

import { LoadingSquareFullPage } from "../../components/loadingSquare";
import appService from "../../../lib/appService";
import { useTideCloak } from "@tidecloak/nextjs";

/**
 * Manages which path the demo should go down depending on token validity
 * @returns - this redirect path instead of return something it pushes to a different path
 */
export default function RedirectPage() {



  const { baseURL, realm, authenticated, isInitializing, token, getValueFromIdToken, getValueFromToken, doEncrypt, doDecrypt, refreshToken, logout } = useTideCloak();

  const router = useRouter();
  
  const startUserInfoEncryption = async () => {
  const token = token;
  const loggedVuid = getValueFromToken("vuid");
  const user = await appService.getUserByVuid(baseURL, realm, token, loggedVuid);
  const tokenDoB = getValueFromIdToken("dob");
  const tokenCC = getValueFromIdToken("cc");

  let arrayToEncrypt = [];

  if (tokenDoB) {
    if (/[a-zA-Z]/.test(tokenDoB) === false) {
      arrayToEncrypt.push({
        "data": tokenDoB,
        "tags": ["dob"]
      })
    }
  }

  // Credit Card
  if (tokenCC) {
    if (/[a-zA-Z]/.test(tokenCC) === false) {
      arrayToEncrypt.push({
        "data": tokenCC,
        "tags": ["cc"]
      })
    }
  }

  if (arrayToEncrypt.length > 0) {
    // Encrypt the data for the first time
    const encryptedData = await doEncrypt(arrayToEncrypt);
    // Save the updated user object to TideCloak;
    user[0].attributes.dob = encryptedData[0];
    user[0].attributes.cc = encryptedData[1];
    const response = await appService.updateUser(baseURL, realm, user[0], token);
    await refreshToken();
  }

}

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
        startUserInfoEncryption().catch(err =>
          console.error("Error encrypting user info:", err)
        );
        router.push("/home");
      }
      else {
        router.push("/");
      }
    }
  }, [isInitializing]);

  return <LoadingSquareFullPage />
}
