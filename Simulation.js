import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Send, Mic, MicOff, Volume2, VolumeX, ArrowLeft,
  Save, Trash2, ChevronDown, RotateCcw, Zap,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { saveSimulation, getUserSimulations, updateSimulation } from "../lib/firebase";

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", badge: "Best" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", badge: "Fast" },
  { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B", badge: "Long" },
];

const DOMAIN_ICONS = {
  career: "💼", relationship: "💞", health: "🧬", finance: "💰",
  spirit: "🌌", growth: "🧠", default: "🌐",
};

function detectDomain(text) {
  const t = text.toLowerCase();
  if (t.match(/career|job|work|profession|business|entrepren/)) return "career";
  if (t.match(/relationship|partner|love|marriage|family|friend/)) return "relationship";
  if (t.match(/health|body|fitness|longevity|diet|exercise|mental/)) return "health";
  if (t.match(/financ|money|wealth|invest|saving|retire/)) return "finance";
  if (t.match(/purpose|meaning|spirit|soul|life/)) return "spirit";
  if (t.match(/growth|habit|identity|learn|skill/)) return "growth";
  return "default";
}

export default function Simulation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS[0].id);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [simId, setSimId] = useState(id || null);
  const [saved, setSaved] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load existing simulation
  useEffect(() => {
    if (!id || !user) return;
    getUserSimulations(user.uid).then(sims => {
      const sim = sims.find(s => s.id === id);
      if (sim?.messages) {
        setMessages(sim.messages);
        setSaved(true);
      }
    });
  }, [id, user]);

  // Starter prompt from dashboard
  useEffect(() => {
    if (location.state?.starter && messages.length === 0) {
      setInput(location.state.starter);
      setTimeout(() => {
        if (textareaRef.current) textareaRef.current.focus();
      }, 100);
    }
  }, [location.state]);

  const speak = useCallback((text) => {
    if (!ttsEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    // Prefer a premium voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes("Google") && v.lang === "en-US")
      || voices.find(v => v.lang === "en-US")
      || voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 0.92;
    utter.pitch = 0.95;
    utter.volume = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synthRef.current.speak(utter);
  }, [ttsEnabled]);

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setSpeaking(false);
  };

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }, [listening]);

  const sendMessage = async (overrideText) => {
    const text = overrideText || input.trim();
    if (!text || loading) return;
    setInput("");
    setSaved(false);

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await fetch("/.netlify/functions/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model }),
      });
      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content || "Oracle encountered an error. Please try again.";
      const assistantMsg = { role: "assistant", content: reply };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      if (ttsEnabled) speak(reply);

      // Auto-save / update
      const domain = detectDomain(text);
      const title = text.length > 50 ? text.slice(0, 47) + "…" : text;
      const preview = reply.slice(0, 160);
      const icon = DOMAIN_ICONS[domain];

      if (user) {
        if (simId) {
          await updateSimulation(simId, { messages: finalMessages, preview, title, icon, model });
        } else {
          const ref = await saveSimulation(user.uid, { messages: finalMessages, title, preview, icon, model });
          setSimId(ref.id);
          window.history.replaceState(null, "", `/simulation/${ref.id}`);
        }
        setSaved(true);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}. Please check your Netlify function configuration.` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSimulation = () => {
    if (messages.length > 0 && !window.confirm("Start a new simulation? Current messages will be cleared.")) return;
    setMessages([]);
    setSimId(null);
    setSaved(false);
    setInput("");
    window.history.replaceState(null, "", "/simulation");
  };

  const selectedModel = MODELS.find(m => m.id === model);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--void)" }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 12, padding: "0 20px",
        height: 56, borderBottom: "1px solid var(--border)",
        background: "var(--void-2)", flexShrink: 0, zIndex: 10,
      }}>
        <button className="btn-icon" onClick={() => navigate("/dashboard")} title="Back to dashboard">
          <ArrowLeft size={16} />
        </button>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, color: "var(--oracle)", filter: "drop-shadow(0 0 6px var(--oracle))" }}>⟐</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Oracle</span>
          {saved && <span className="badge badge-oracle" style={{ fontSize: 10 }}>Saved</span>}
        </div>

        {/* Model selector */}
        <div style={{ position: "relative" }}>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 6 }}
            onClick={() => setShowModelMenu(p => !p)}>
            <Zap size={12} /> {selectedModel?.label} <ChevronDown size={12} />
          </button>
          {showModelMenu && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)", minWidth: 200,
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
              padding: 6, boxShadow: "var(--shadow-card)", zIndex: 100,
            }}>
              {MODELS.map(m => (
                <button key={m.id} onClick={() => { setModel(m.id); setShowModelMenu(false); }}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 7, border: "none",
                    background: model === m.id ? "var(--oracle-subtle)" : "transparent",
                    color: model === m.id ? "var(--oracle-bright)" : "var(--text-secondary)",
                    fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    textAlign: "left",
                  }}>
                  <span>{m.label}</span>
                  <span className={`badge ${model === m.id ? "badge-oracle" : ""}`} style={{ fontSize: 10, padding: "2px 6px" }}>{m.badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TTS toggle */}
        <button className={`btn-icon ${ttsEnabled ? "active" : ""}`}
          onClick={() => { setTtsEnabled(p => !p); if (speaking) stopSpeaking(); }}
          title={ttsEnabled ? "Disable voice" : "Enable voice"}>
          {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        {speaking && (
          <button className="btn-icon active" onClick={stopSpeaking} title="Stop speaking">
            <div className="waveform active" style={{ height: 20 }}>
              {[1,2,3,4,5].map(i => <span key={i} />)}
            </div>
          </button>
        )}

        <button className="btn-icon" onClick={resetSimulation} title="New simulation">
          <RotateCcw size={15} />
        </button>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
        {messages.length === 0 ? (
          <EmptyState onPrompt={(p) => { setInput(p); setTimeout(() => textareaRef.current?.focus(), 50); }} />
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px" }}>
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && <LoadingBubble />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid var(--border)", background: "var(--void-2)",
        padding: "16px 20px", flexShrink: 0,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 16, padding: "10px 10px 10px 16px",
            transition: "border-color 0.2s",
          }}
            onFocus={() => {}}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Oracle to simulate your future…"
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 15,
                resize: "none", lineHeight: 1.5, maxHeight: 160, overflow: "auto",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
              disabled={loading}
            />
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", paddingBottom: 2 }}>
              <button
                className={`btn-icon voice-btn ${listening ? "listening" : ""}`}
                onClick={startListening}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: listening ? "var(--oracle-subtle)" : "",
                  borderColor: listening ? "var(--oracle)" : "",
                  color: listening ? "var(--oracle-bright)" : "",
                }}
                title={listening ? "Stop listening" : "Voice input"}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
              <button
                className="btn btn-oracle"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ width: 36, height: 36, padding: 0, borderRadius: "50%", justifyContent: "center" }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {listening ? "🔴 Listening…" : "Enter to send · Shift+Enter for new line · 🎙 for voice"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className="fade-in" style={{
      display: "flex", gap: 12, marginBottom: 24,
      flexDirection: isUser ? "row-reverse" : "row",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isUser ? "var(--surface-2)" : "linear-gradient(135deg, var(--oracle), #7c3aed)",
        border: isUser ? "1px solid var(--border)" : "none",
        fontSize: isUser ? 12 : 16,
        boxShadow: isUser ? "none" : "0 0 16px var(--oracle-glow)",
        marginTop: 4,
      }}>
        {isUser ? "👤" : "⟐"}
      </div>
      <div style={{ maxWidth: "80%", minWidth: 0 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6, textAlign: isUser ? "right" : "left" }}>
          {isUser ? "You" : "Oracle"}
        </div>
        <div style={{
          padding: "14px 18px", borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser ? "var(--surface-2)" : "var(--surface)",
          border: isUser ? "1px solid var(--border)" : "1px solid rgba(139,92,246,0.15)",
          fontSize: 15, lineHeight: 1.75, color: "var(--text-primary)",
        }}>
          <FormattedMessage content={message.content} />
        </div>
      </div>
    </div>
  );
}

function FormattedMessage({ content }) {
  // Convert markdown-lite to styled spans
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div className="prose">
      {content.split("\n\n").map((para, i) => (
        <p key={i} style={{ marginBottom: i < content.split("\n\n").length - 1 ? 12 : 0 }}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      ))}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--oracle), #7c3aed)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: "0 0 16px var(--oracle-glow)", marginTop: 4,
      }}>⟐</div>
      <div style={{ maxWidth: "80%" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: 6 }}>Oracle</div>
        <div style={{
          padding: "16px 20px", borderRadius: "4px 16px 16px 16px",
          background: "var(--surface)", border: "1px solid rgba(139,92,246,0.15)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div className="waveform active">
            {[1,2,3,4,5].map(i => <span key={i} style={{ background: "var(--oracle)" }} />)}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Consulting the future…
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPrompt }) {
  const PROMPTS = [
    "Where will my career be in 10 years if I stay on my current path?",
    "What does my relationship trajectory look like based on current patterns?",
    "Simulate my financial future — am I building wealth or falling behind?",
    "What health outcomes should I expect in 20 years based on my lifestyle?",
    "Am I living my life's purpose, or just drifting?",
  ];

  return (
    <div style={{ textAlign: "center", padding: "60px 24px", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ fontSize: 56, marginBottom: 20, filter: "drop-shadow(0 0 30px #8b5cf6)", animation: "spin 8s linear infinite" }}>⟐</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 10 }}>Oracle is ready.</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
        Share your situation, your current path, your habits, your goals — and Oracle will simulate where you're headed. Be specific for the most accurate results.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PROMPTS.map(p => (
          <button key={p} onClick={() => onPrompt(p)}
            style={{
              padding: "13px 18px", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text-secondary)", fontSize: 14,
              cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)",
              transition: "all 0.2s", lineHeight: 1.4,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--oracle)"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--oracle-subtle)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface)"; }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
