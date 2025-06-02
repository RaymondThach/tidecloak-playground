// app/components/ClientProviders.jsx
"use client";

import { useAppContext } from "../context/context";
import {LoadingSquareFullPage} from "./loadingSquare";
import Nav from "./nav";
import Footer from "./footer";

export default function ClientProviders({ children }) {
  const { overlayLoading, user, loading } = useAppContext();

  return (
    <>
      {overlayLoading && <LoadingSquareFullPage />}
      <Nav user={user} loading={loading} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
