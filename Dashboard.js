import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Search, LogOut, User, Zap, Clock } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { logOut, getUserSimulations, deleteSimulation } from "../lib/firebase";

const DAILY_ORACLES = [
  "The most dangerous illusion is that tomorrow is guaranteed. The only path you can change is the one you walk today.",
  "Compound interest applies to habits too. The person you are in 10 years is being built in the next 10 minutes.",
  "Most futures aren't created — they're defaulted into. The question is whether you're choosing yours.",
  "Your relationships are either growing or decaying. Neutral doesn't exist in the biological world.",
  "The biggest risk in life isn't failure. It's succeeding at the wrong thing.",
  "Every identity shift begins with a single repeated action. You don't become who you want to be. You act as who you're becoming.",
  "The version of you 20 years from now is watching every decision you make today.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const dailyOracle = DAILY_ORACLES[new Date().getDay() % DAILY_ORACLES.length];

  useEffect(() => {
    if (!user) return;
    getUserSimulations(user.uid)
      .then(setSimulations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this simulation? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteSimulation(id);
      setSimulations(s => s.filter(x => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = simulations.filter(s =>
    (s.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.preview || "").toLowerCase().includes(search.toLowerCase())
  );

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Explorer";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="page" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: 240,
        background: "var(--void-2)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "20px 0", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, color: "var(--oracle)", filter: "drop-shadow(0 0 8px var(--oracle))" }}>⟐</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Oracle</span>
            <span className="badge badge-oracle" style={{ fontSize: 10, padding: "2px 6px" }}>v2</span>
          </div>
        </div>

        {/* New simulation */}
        <div style={{ padding: "8px 12px" }}>
          <button className="btn btn-oracle" style={{ width: "100%", justifyContent: "center", fontSize: 14 }}
            onClick={() => navigate("/simulation")}>
            <Plus size={16} /> New Simulation
          </button>
        </div>

        {/* Simulations list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", padding: "8px 8px 6px", textTransform: "uppercase" }}>
            Recent
          </div>
          {loading ? (
            <div style={{ padding: "20px 8px", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
          ) : simulations.slice(0, 12).map(s => (
            <div key={s.id} onClick={() => navigate(`/simulation/${s.id}`)}
              style={{
                padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s", marginBottom: 2,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon || "🌐"}</span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {s.title || "Untitled Simulation"}
              </span>
              <button onClick={(e) => handleDelete(s.id, e)} style={{
                background: "none", border: "none", color: "var(--text-muted)",
                cursor: "pointer", padding: 2, opacity: 0, transition: "opacity 0.15s",
                display: "flex",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#f87171"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                {deletingId === s.id ? "…" : <Trash2 size={12} />}
              </button>
            </div>
          ))}
          {!loading && simulations.length === 0 && (
            <div style={{ padding: "12px 8px", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
              No simulations yet. Start a new one to see your future.
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 10, marginBottom: 8, cursor: "pointer", transition: "background 0.15s" }}
            onClick={() => navigate("/account")}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--oracle), #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : initials}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            </div>
            <User size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          </div>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "8px" }}
            onClick={() => logOut()}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, minHeight: "100vh", padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.1 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {displayName.split(" ")[0]}.
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            You have {simulations.length} saved simulation{simulations.length !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Daily Oracle */}
        <div style={{
          padding: "24px 28px", borderRadius: 16, marginBottom: 32,
          background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(124,58,237,0.04) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}>
          <div className="badge badge-gold" style={{ marginBottom: 12 }}>⟐ DAILY ORACLE</div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", lineHeight: 1.5, color: "var(--text-primary)" }}>
            "{dailyOracle}"
          </p>
        </div>

        {/* Quick Start */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>QUICK START</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "💼", label: "Career simulation", prompt: "Simulate my career trajectory over the next 10 years. I want to know realistic outcomes." },
              { icon: "💞", label: "Relationship forecast", prompt: "Help me understand where my current relationship patterns will lead over the next 5 years." },
              { icon: "💰", label: "Financial future", prompt: "Simulate my financial trajectory. What does my path look like in 20 years?" },
              { icon: "🧬", label: "Health trajectory", prompt: "Simulate my health and longevity based on my current habits and lifestyle." },
              { icon: "🌌", label: "Life purpose", prompt: "Help me explore whether I'm living in alignment with my deepest purpose and values." },
              { icon: "✨", label: "Full life audit", prompt: "Give me a complete 360° simulation of my life — career, relationships, health, finances, and purpose — over the next 20 years." },
            ].map(q => (
              <button key={q.label} onClick={() => navigate("/simulation", { state: { starter: q.prompt } })}
                className="card" style={{
                  padding: "16px", textAlign: "left", cursor: "pointer", border: "1px solid var(--border)",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                  background: "var(--surface)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}
              >
                <span style={{ fontSize: 22 }}>{q.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* All simulations */}
        {simulations.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>ALL SIMULATIONS</h2>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 32, width: 220, height: 36, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filtered.map(s => (
                <div key={s.id} className="card" onClick={() => navigate(`/simulation/${s.id}`)}
                  style={{ padding: "18px 20px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>{s.icon || "🌐"}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.title || "Untitled"}</span>
                    </div>
                    <button onClick={(e) => handleDelete(s.id, e)} className="btn-icon" style={{ width: 28, height: 28, flexShrink: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {s.preview && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 10,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {s.preview}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    <Clock size={10} />
                    {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : "Recent"}
                    {s.model && <><span style={{ margin: "0 4px" }}>·</span><Zap size={10} />{s.model.split("-")[0]}</>}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && search && (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                No simulations match "{search}"
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile: redirect */}
      <style>{`
        @media (max-width: 768px) {
          aside { display: none; }
          main { margin-left: 0 !important; padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
