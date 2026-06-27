import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, Chrome, Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  updateUserProfile,
} from "../lib/firebase";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
  }, [mode]);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (e) {
      setError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const cred = await signUpWithEmail(email, password);
        if (name.trim()) await updateUserProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmail(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message.replace("Firebase: ", "").replace(/\(auth.*?\)\.?/, "").trim();
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page grid-bg noise" style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      {/* Back button */}
      <button className="btn btn-ghost" onClick={() => navigate("/")} style={{
        position: "fixed", top: 20, left: 20, padding: "8px 14px", fontSize: 13,
      }}>
        <ArrowLeft size={14} /> Home
      </button>

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12, filter: "drop-shadow(0 0 20px #8b5cf6)" }}>⟐</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 6 }}>Oracle</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {mode === "login" ? "Welcome back. Your future awaits." : "Begin your life simulation journey."}
          </p>
        </div>

        <div className="card" style={{ padding: "32px 28px" }}>
          {/* Mode toggle */}
          <div style={{
            display: "flex", background: "var(--void-2)", borderRadius: 10,
            padding: 4, marginBottom: 28, border: "1px solid var(--border)",
          }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                background: mode === m ? "var(--surface-2)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button className="btn btn-surface" style={{ width: "100%", justifyContent: "center", marginBottom: 20 }} onClick={handleGoogle} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          {/* Email form */}
          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "signup" && (
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input className="input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
                  style={{ paddingLeft: 40 }} />
              </div>
            )}
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input className="input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                required style={{ paddingLeft: 40 }} />
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input className="input" type={showPw ? "text" : "password"} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
                style={{ paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                padding: 2, display: "flex",
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, fontSize: 13,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171",
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-oracle" style={{ justifyContent: "center", marginTop: 4 }} disabled={loading || !email || !password}>
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
          By continuing you agree to Oracle's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
