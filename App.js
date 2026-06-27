import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Account from "./pages/Account";
import InstallBanner from "./components/InstallBanner";
import "./styles/globals.css";

function AppRoutes() {
  const { user } = useAuth();
  if (user === undefined) return <div className="splash"><div className="oracle-glyph-spin">⟐</div></div>;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/simulation/:id?" element={user ? <Simulation /> : <Navigate to="/auth" />} />
      <Route path="/account" element={user ? <Account /> : <Navigate to="/auth" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    // Capture install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show install banner after 3s even without prompt (iOS / already-seen)
    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const dismissed = localStorage.getItem("oracle-install-dismissed");
      if (!isStandalone && !dismissed) setShowInstall(true);
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem("oracle-install-dismissed", "1");
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        {showInstall && (
          <InstallBanner
            onInstall={deferredPrompt ? handleInstall : null}
            onDismiss={handleDismiss}
          />
        )}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
