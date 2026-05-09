/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import AdminPage from "./AdminPage";
import DisplayPage from "./DisplayPage";
import LoginPage from "./LoginPage";

export default function App() {
  const [path, setPath] = React.useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(
    localStorage.getItem("dbc_auth") === "true"
  );

  React.useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("dbc_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("dbc_auth");
    setIsAuthenticated(false);
  };

  // Simple routing
  if (path === "/display") {
    return <DisplayPage />;
  }

  // Default to Admin page. Authentication is handled within the page for better UX.
  return (
    <AdminPage 
      onLogout={handleLogout} 
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
    />
  );
}
