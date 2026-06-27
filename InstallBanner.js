import React from "react";
import { Download, X, Smartphone } from "lucide-react";

export default function InstallBanner({ onInstall, onDismiss }) {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)",
      borderBottom: "1px solid rgba(139,92,246,0.3)",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      boxShadow: "0 4px 30px rgba(139,92,246,0.15)",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 16,
        boxShadow: "0 0 16px rgba(139,92,246,0.4)"
      }}>⟐</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0ecff", lineHeight: 1.3 }}>
          Install Oracle
        </div>
        <div style={{ fontSize: 12, color: "#9d91c4", marginTop: 2 }}>
          {isIOS
            ? 'Tap Share → "Add to Home Screen"'
            : "Add to your home screen for the full experience"}
        </div>
      </div>

      {!isIOS && onInstall && (
        <button
          onClick={onInstall}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 8,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            border: "none", color: "white", fontSize: 13, fontWeight: 600,
            cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
          }}
        >
          <Download size={13} /> Install
        </button>
      )}

      <button
        onClick={onDismiss}
        style={{
          background: "none", border: "none", color: "#5a5180",
          cursor: "pointer", padding: 4, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
