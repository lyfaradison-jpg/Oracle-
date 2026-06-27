import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const DOMAINS = [
  { icon: "💼", label: "Career & Purpose" },
  { icon: "💞", label: "Relationships" },
  { icon: "🧬", label: "Health & Longevity" },
  { icon: "💰", label: "Finance & Wealth" },
  { icon: "🌌", label: "Meaning & Spirit" },
  { icon: "🧠", label: "Personal Growth" },
];

const TESTIMONIALS = [
  { text: "Oracle showed me a version of my life 20 years out that shook me. I changed careers the next week.", name: "Maya K.", role: "Architect → Founder" },
  { text: "The relationship simulation was uncomfortably accurate. It helped me have a conversation I'd been avoiding for years.", name: "Daniel R.", role: "Therapist" },
  { text: "I've tried every journaling app. Nothing prepares you for seeing your financial trajectory laid out like this.", name: "Priya S.", role: "Engineer" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="page grid-bg noise" style={{ paddingTop: "80px" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid rgba(139,92,246,0.1)",
        background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
        padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, color: "#8b5cf6", filter: "drop-shadow(0 0 10px #8b5cf6)" }}>⟐</span>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>Oracle</span>
          <span className="badge badge-oracle" style={{ marginLeft: 4 }}>v2</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => navigate("/auth")}>Sign in</button>
          <button className="btn btn-oracle" style={{ padding: "8px 18px", fontSize: 14 }} onClick={() => navigate("/auth?mode=signup")}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
        {/* Glow orb */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="fade-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <div className="badge badge-gold" style={{ marginBottom: 24, fontSize: 11 }}>
            ✦ AI-POWERED LIFE SIMULATION
          </div>
        </div>

        <h1 className="fade-in" style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(48px, 8vw, 88px)",
          lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24,
          background: "linear-gradient(135deg, #f0ecff 0%, #a78bfa 50%, #7c3aed 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animationDelay: "0.2s", opacity: 0,
        }}>
          See Your Future.<br />Shape Your Path.
        </h1>

        <p className="fade-in" style={{
          fontSize: "clamp(16px, 2.5vw, 20px)", color: "var(--text-secondary)",
          maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7,
          animationDelay: "0.35s", opacity: 0,
        }}>
          Oracle simulates your life with brutal honesty — grounded in real psychology,
          economics, and longitudinal research. Not fortune-telling. Evidence-based foresight.
        </p>

        <div className="fade-in" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animationDelay: "0.45s", opacity: 0 }}>
          <button className="btn btn-oracle" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => navigate("/auth?mode=signup")}>
            Start Your Simulation →
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => navigate("/auth")}>
            Sign in
          </button>
        </div>

        {/* Floating stat chips */}
        <div className="fade-in" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 48, animationDelay: "0.55s", opacity: 0 }}>
          {["Harvard Grant Study", "Framingham Heart Study", "40+ Year Longitudinal Data", "Behavioral Economics"].map(s => (
            <div key={s} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12,
              background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
              color: "var(--text-secondary)", fontFamily: "var(--font-mono)"
            }}>{s}</div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="badge badge-cyan" style={{ marginBottom: 16 }}>SIMULATION DOMAINS</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 12 }}>
              Every dimension of your life, simulated.
            </h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto" }}>
              Oracle draws from decades of research across six life domains to give you a complete picture.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {DOMAINS.map(d => (
              <div key={d.label} className="card" style={{ padding: "20px 16px", textAlign: "center", transition: "all 0.2s", cursor: "default" }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{d.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { icon: "🎙️", title: "Voice Chat", desc: "Talk naturally with Oracle. Full speech-to-text and text-to-speech — simulate out loud." },
              { icon: "🌐", title: "Three Life Paths", desc: "Every simulation shows the likely path, the upside path, and the shadow path if nothing changes." },
              { icon: "📖", title: "Saved Simulations", desc: "Your simulations are saved to your account — revisit, compare, and track your growth over time." },
              { icon: "🔒", title: "Private & Secure", desc: "End-to-end encrypted. Your life data stays yours. We never train models on your simulations." },
              { icon: "⚡", title: "Powered by Llama 3.3", desc: "State-of-the-art reasoning via Groq's ultra-fast inference. Responses in under 2 seconds." },
              { icon: "📲", title: "Install as App", desc: "Add Oracle to your home screen for instant access — works offline for reviewing past simulations." },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: "24px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
          <div className="badge badge-oracle" style={{ marginBottom: 32 }}>WHAT PEOPLE SAY</div>
          <div style={{ minHeight: 140 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                display: i === activeTestimonial ? "block" : "none",
                animation: "fadeIn 0.5s ease",
              }}>
                <p style={{
                  fontFamily: "var(--font-display)", fontSize: "clamp(18px, 3vw, 24px)",
                  fontStyle: "italic", lineHeight: 1.5, color: "var(--text-primary)", marginBottom: 24,
                }}>"{t.text}"</p>
                <div style={{ fontWeight: 600, color: "var(--oracle-bright)" }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{t.role}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 24 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 20 : 6, height: 6, borderRadius: 3,
                background: i === activeTestimonial ? "var(--oracle)" : "var(--border)",
                border: "none", cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "60px 48px", borderRadius: 24,
          background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(124,58,237,0.05) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 80px rgba(139,92,246,0.08)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16, filter: "drop-shadow(0 0 20px #8b5cf6)" }}>⟐</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 12 }}>
            Your future is waiting.
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, maxWidth: 360 }}>
            Most people never seriously examine where their current path leads. Be the exception.
          </p>
          <button className="btn btn-oracle" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => navigate("/auth?mode=signup")}>
            Begin Your Simulation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          ⟐ Oracle · Life Simulation Engine · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
