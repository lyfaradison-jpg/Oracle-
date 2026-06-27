import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Shield, Trash2, LogOut, Save } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logOut, updateUserProfile, auth } from "../lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [error, setError] = useState("");

  const isGoogle = user?.providerData?.[0]?.providerId === "google.com";
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSaveName = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUserProfile(user, { displayName: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return;
    setPwMsg("");
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPw);
      setPwMsg("Password updated successfully.");
      setCurrentPw("");
      setNewPw("");
    } catch (e) {
      setPwMsg("Error: " + e.message.replace("Firebase: ", "").replace(/\(auth.*?\)\.?/, "").trim());
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account and all simulations? This cannot be undone.")) return;
    try {
      await deleteUser(user);
      navigate("/");
    } catch (e) {
      setError("Please sign out and sign back in before deleting your account (for security).");
    }
  };

  return (
    <div className="page grid-bg" style={{ minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")} style={{ marginBottom: 32, padding: "8px 14px", fontSize: 13 }}>
          <ArrowLeft size={14} /> Dashboard
        </button>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--oracle), #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: "white",
            boxShadow: "0 0 30px var(--oracle-glow)",
            overflow: "hidden",
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 4 }}>{displayName}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{user?.email}</p>
            {isGoogle && <span className="badge badge-oracle" style={{ marginTop: 6 }}>Google Account</span>}
          </div>
        </div>

        {/* Profile */}
        <Section icon={<User size={16} />} title="Profile">
          <label style={labelStyle}>Display name</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            <button className="btn btn-oracle" onClick={handleSaveName} disabled={saving || !name.trim()}>
              {saving ? "…" : saved ? "✓ Saved" : <><Save size={14} /> Save</>}
            </button>
          </div>
          <label style={{ ...labelStyle, marginTop: 16 }}>Email</label>
          <input className="input" value={user?.email || ""} disabled style={{ opacity: 0.5 }} />
          {error && <ErrorMsg msg={error} />}
        </Section>

        {/* Password */}
        {!isGoogle && (
          <Section icon={<Shield size={16} />} title="Change Password">
            <label style={labelStyle}>Current password</label>
            <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" style={{ marginBottom: 10 }} />
            <label style={labelStyle}>New password</label>
            <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
            {pwMsg && (
              <div style={{
                marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13,
                background: pwMsg.startsWith("Error") ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                border: `1px solid ${pwMsg.startsWith("Error") ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                color: pwMsg.startsWith("Error") ? "#f87171" : "#4ade80",
              }}>{pwMsg}</div>
            )}
            <button className="btn btn-surface" style={{ marginTop: 12 }} onClick={handleChangePassword} disabled={!currentPw || !newPw}>
              Update Password
            </button>
          </Section>
        )}

        {/* Danger zone */}
        <Section icon={<Trash2 size={16} />} title="Danger Zone" danger>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.6 }}>
            Deleting your account is permanent. All your simulations and data will be erased and cannot be recovered.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-danger" onClick={handleDeleteAccount}>
              <Trash2 size={14} /> Delete Account
            </button>
            <button className="btn btn-ghost" onClick={() => logOut().then(() => navigate("/"))}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children, danger }) {
  return (
    <div className="card" style={{
      padding: "24px 28px", marginBottom: 20,
      borderColor: danger ? "rgba(239,68,68,0.15)" : "var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ color: danger ? "#f87171" : "var(--oracle-bright)" }}>{icon}</span>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: danger ? "#f87171" : "var(--text-primary)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div style={{
      marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13,
      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171",
    }}>{msg}</div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-muted)",
  marginBottom: 6, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase",
};
