"use client";

import IAMService from "../../lib/IAMService";
import { usePathname, useRouter } from "next/navigation";
import Button from "../components/button";

/**
 * This navigation tool bar is displayed at the top of each page after Login screen.
 * @returns {JSX.Element} - HTML for button component
 */
export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  // Only navigate if not the selected route
  const handleNavigate = (route) => {
    if (pathname !== route) {
      router.push(route);
    }
  };

  // Colour the button if it's the selected route, and a different colour when hovering
  const getButtonClasses = (route) => {
    if (pathname === route) return "bg-blue-100 text-blue-700";
    return "hover:bg-gray-100";
  };

  return (
    pathname !== "/" && pathname !== "/fail" && (
      <nav className="flex justify-start gap-4 px-8 py-4 border-b border-gray-200">
        <img
            src="/playground-logo_nav.png"
            alt="Playground Logo"
            className="h-10 w-auto"
          />
        <button
          onClick={() => handleNavigate("/user")}
          className={`px-4 py-2 rounded transition ${getButtonClasses("/user")}`}
        >
          User
        </button>

        <button
          onClick={() => handleNavigate("/databaseExposure")}
          className={`px-4 py-2 rounded transition ${getButtonClasses("/databaseExposure")}`}
        >
          Database Exposure
        </button>

        <button
          onClick={() => handleNavigate("/admin")}
          className={`px-4 py-2 rounded transition ${getButtonClasses("/admin")}`}
        >
          Administration
        </button>

        <Button onClick={() => IAMService.doLogout()}>Logout</Button>
      </nav>
    )
  );
}
