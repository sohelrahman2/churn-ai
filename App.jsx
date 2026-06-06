import { useState, useRef, useEffect } from "react";

const STATS = {
  total: 6418, churned: 1732, stayed: 4275, joined: 411,
  churn_rate: 27.0, avg_monthly_charge: 63.65, avg_tenure: 17.3,
  total_revenue: 19471390.41,
  top_churn_reasons: {
    "Competitor had better devices": 289,
    "Competitor made better offer": 274,
    "Attitude of support person": 208,
    "Don't know": 124,
    "Competitor offered more data": 106
  },
  top_churn_categories: { Competitor: 761, Attitude: 301, Dissatisfaction: 300, Price: 196, Other: 174 },
  contract_churn: { "One Year": 11.0, "Month-to-Month": 46.5, "Two Year": 2.7 },
  internet_churn: { "Cable": 25.7, "Fiber Optic": 41.1, "DSL": 19.4 },
  state_churn: {
    "Jammu & Kashmir": 57.2, "Assam": 38.1, "Jharkhand": 34.5,
    "Chhattisgarh": 30.5, "Delhi": 29.9, "Odisha": 28.9,
    "Kerala": 27.5, "Rajasthan": 27.0, "Puducherry": 26.8, "Haryana": 26.1
  },
  gender_churn: { Male: 26.2, Female: 27.4 },
  avg_age_churned: 50.1, avg_age_stayed: 46.1,
  payment_churn: { "Credit Card": 14.8, "Bank Withdrawal": 34.4, "Mailed Check": 37.8 }
};

const SYSTEM_PROMPT = `You are an expert Customer Analytics AI Assistant analyzing a telecom customer dataset of ${STATS.total} customers from India.

## Dataset Statistics:
- Total Customers: ${STATS.total.toLocaleString()}
- Churned: ${STATS.churned.toLocaleString()} (${STATS.churn_rate}%)
- Stayed: ${STATS.stayed.toLocaleString()}
- Newly Joined: ${STATS.joined.toLocaleString()}
- Avg Monthly Charge: $${STATS.avg_monthly_charge}
- Avg Tenure: ${STATS.avg_tenure} months
- Total Revenue: $${STATS.total_revenue.toLocaleString()}

## Churn by Category: ${JSON.stringify(STATS.top_churn_categories)}
## Top Churn Reasons: ${JSON.stringify(STATS.top_churn_reasons)}
## Contract Churn Rates: ${JSON.stringify(STATS.contract_churn)}
## Internet Type Churn: ${JSON.stringify(STATS.internet_churn)}
## Payment Method Churn: ${JSON.stringify(STATS.payment_churn)}
## State-wise Churn (top 10): ${JSON.stringify(STATS.state_churn)}
## Gender Churn: ${JSON.stringify(STATS.gender_churn)}
## Avg Age Churned: ${STATS.avg_age_churned}, Avg Age Stayed: ${STATS.avg_age_stayed}

## Your role:
- Answer questions about customer churn, retention, revenue, demographics, and service patterns
- Provide actionable business recommendations
- Identify at-risk customer segments
- Suggest retention strategies based on data
- Be concise, data-driven, and use specific numbers from the dataset
- Format responses clearly with bullet points or sections when helpful
- When relevant, mention which customer segments are most at risk

Always back your insights with specific numbers from the dataset.`;

const SUGGESTED = [
  "What are the main reasons customers are churning?",
  "Which customer segment is at highest risk of churning?",
  "How does contract type affect churn?",
  "Give me 5 actionable retention strategies",
  "Which states have the highest churn rate?",
  "How does internet type impact customer loyalty?",
  "Compare churn between payment methods",
  "What's the revenue impact of churn?",
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#6366f1",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: "14px 18px",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 18,
      animation: "fadeUp 0.3s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 10, marginTop: 2, fontSize: 14
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isUser
          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
          : "rgba(255,255,255,0.05)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding: "12px 16px",
        color: "#f1f5f9",
        fontSize: 14,
        lineHeight: 1.65,
        whiteSpace: "pre-wrap",
      }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginLeft: 10, marginTop: 2, fontSize: 14
        }}>👤</div>
      )}
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("churniq_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keySubmitted, setKeySubmitted] = useState(() => !!localStorage.getItem("churniq_api_key"));

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Hello! I'm your **Customer Analytics AI Assistant**.

I've analyzed **6,418 customer records** from your telecom dataset. Here's a quick snapshot:

• 📊 Overall churn rate: **27%** (1,732 customers lost)
• 💰 Total revenue: **$19.47M**
• ⚠️ Biggest churn driver: **Competitor offers** (761 cases)
• 🔴 Highest risk: **Month-to-Month contracts** (46.5% churn)

Ask me anything about customer behavior, churn patterns, retention strategies, or revenue insights!`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  function handleSaveKey() {
    const k = apiKeyInput.trim();
    if (!k.startsWith("sk-ant-")) return alert("Invalid key — must start with sk-ant-");
    localStorage.setItem("churniq_api_key", k);
    setApiKey(k);
    setKeySubmitted(true);
  }

  if (!keySubmitted) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=DM+Mono&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ width:420, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:20, padding:36, color:"#f1f5f9" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📡</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>ChurnIQ <span style={{ color:"#6366f1" }}>AI</span></div>
            <div style={{ fontSize:13, color:"#64748b", marginTop:6 }}>Enter your Anthropic API key to start</div>
          </div>
          <input
            type="password"
            placeholder="sk-ant-api03-..."
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSaveKey()}
            style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(99,102,241,0.4)", background:"rgba(255,255,255,0.05)", color:"#f1f5f9", fontSize:14, fontFamily:"'DM Mono',monospace", marginBottom:12, outline:"none" }}
          />
          <button onClick={handleSaveKey} style={{ width:"100%", padding:"12px", borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer", border:"none" }}>
            Start Analyzing →
          </button>
          <div style={{ marginTop:16, padding:12, background:"rgba(99,102,241,0.08)", borderRadius:10, fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>
            🔒 Your key is stored only in your browser (localStorage).<br/>
            Get a free key at <a href="https://console.anthropic.com" target="_blank" style={{ color:"#a5b4fc" }}>console.anthropic.com</a>
          </div>
        </div>
      </div>
    );
  }
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Connection error. Please check your API key and try again."
      }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const miniBar = (val, max, color) => (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, flex: 1 }}>
      <div style={{ width: `${(val / max) * 100}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.8s ease" }} />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#f1f5f9",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 10px; }
        @keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        textarea:focus { outline: none; }
        button { cursor: pointer; border: none; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "rgba(10,15,30,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.2)",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 0 20px rgba(99,102,241,0.4)"
          }}>📡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>
              ChurnIQ <span style={{ color: "#6366f1" }}>AI</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Customer Analytics Assistant • 6,418 records</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["chat", "insights"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: activeTab === tab ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.05)",
              color: activeTab === tab ? "#fff" : "#94a3b8",
              border: activeTab === tab ? "none" : "1px solid rgba(255,255,255,0.08)",
              transition: "all 0.2s",
            }}>
              {tab === "chat" ? "💬 Chat" : "📊 Insights"}
            </button>
          ))}
          <button onClick={() => { localStorage.removeItem("churniq_api_key"); setKeySubmitted(false); setApiKeyInput(""); }} style={{
            padding: "7px 12px", borderRadius: 8, fontSize: 12,
            background: "rgba(255,255,255,0.04)", color: "#64748b",
            border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s",
          }} title="Change API Key">🔑</button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", maxWidth: 1200, width: "100%", margin: "0 auto", padding: "0 16px" }}>

        {activeTab === "chat" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 20 }}>
            {/* KPI strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              <StatCard label="Total Customers" value="6,418" sub="Full dataset" color="#6366f1" />
              <StatCard label="Churn Rate" value="27.0%" sub="1,732 churned" color="#ef4444" />
              <StatCard label="Avg Monthly Charge" value="$63.65" sub="Per customer" color="#f59e0b" />
              <StatCard label="Total Revenue" value="$19.47M" sub="All customers" color="#10b981" />
            </div>

            {/* Chat area */}
            <div style={{
              flex: 1, overflowY: "auto",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16, padding: "20px 16px",
              marginBottom: 16, minHeight: 300,
            }}>
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px" }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested questions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SUGGESTED.slice(0, 4).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 12,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#a5b4fc", transition: "all 0.2s",
                  fontFamily: "inherit",
                }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 14, padding: "10px 14px",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about churn patterns, customer segments, retention strategies..."
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "#f1f5f9", fontSize: 14, resize: "none",
                  fontFamily: "inherit", lineHeight: 1.5,
                  maxHeight: 120, overflowY: "auto",
                }}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: loading || !input.trim()
                  ? "rgba(99,102,241,0.2)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 17,
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>↑</button>
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 8 }}>
              Powered by Claude AI • Press Enter to send
            </div>
          </div>
        ) : (
          /* ── INSIGHTS TAB ── */
          <div style={{ flex: 1, overflowY: "auto", paddingTop: 20, paddingBottom: 30 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Churn by Category */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#e2e8f0" }}>
                  🏷️ Churn by Category
                </div>
                {Object.entries(STATS.top_churn_categories).map(([cat, cnt], i) => {
                  const colors = ["#ef4444","#f59e0b","#6366f1","#10b981","#8b5cf6"];
                  return (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "#cbd5e1" }}>{cat}</span>
                        <span style={{ color: colors[i], fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{cnt}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {miniBar(cnt, 761, colors[i])}
                        <span style={{ fontSize: 11, color: "#64748b", width: 36, textAlign: "right" }}>
                          {Math.round(cnt / 1732 * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Contract Churn */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#e2e8f0" }}>
                  📋 Churn Rate by Contract
                </div>
                {Object.entries(STATS.contract_churn).sort((a,b)=>b[1]-a[1]).map(([c, r], i) => {
                  const cols = ["#ef4444","#f59e0b","#10b981"];
                  return (
                    <div key={c} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "#cbd5e1" }}>{c}</span>
                        <span style={{ color: cols[i], fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{r}%</span>
                      </div>
                      {miniBar(r, 50, cols[i])}
                    </div>
                  );
                })}
                <div style={{ marginTop: 16, padding: 12, background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#fca5a5" }}>
                  ⚠️ Month-to-Month contracts are <strong>17x riskier</strong> than Two Year contracts
                </div>
              </div>

              {/* Internet Type */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#e2e8f0" }}>
                  🌐 Churn by Internet Type
                </div>
                {Object.entries(STATS.internet_churn).sort((a,b)=>b[1]-a[1]).map(([t, r], i) => {
                  const cols = ["#ef4444","#f59e0b","#10b981"];
                  return (
                    <div key={t} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "#cbd5e1" }}>{t}</span>
                        <span style={{ color: cols[i], fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{r}%</span>
                      </div>
                      {miniBar(r, 50, cols[i])}
                    </div>
                  );
                })}
              </div>

              {/* Payment Method */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#e2e8f0" }}>
                  💳 Churn by Payment Method
                </div>
                {Object.entries(STATS.payment_churn).sort((a,b)=>b[1]-a[1]).map(([p, r], i) => {
                  const cols = ["#ef4444","#f59e0b","#10b981"];
                  return (
                    <div key={p} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: "#cbd5e1" }}>{p}</span>
                        <span style={{ color: cols[i], fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{r}%</span>
                      </div>
                      {miniBar(r, 45, cols[i])}
                    </div>
                  );
                })}
              </div>

              {/* Top States */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20, gridColumn: "span 2" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, color: "#e2e8f0" }}>
                  🗺️ Top 10 States by Churn Rate
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
                  {Object.entries(STATS.state_churn).map(([state, rate], i) => (
                    <div key={state} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: 12, color: "#64748b", width: 18, fontFamily: "'DM Mono', monospace" }}>{i+1}.</span>
                      <span style={{ fontSize: 13, color: "#cbd5e1", flex: 1 }}>{state}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 5 }}>
                          <div style={{ width: `${(rate/57.2)*100}%`, background: rate > 35 ? "#ef4444" : rate > 28 ? "#f59e0b" : "#6366f1", height: "100%", borderRadius: 3 }} />
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                          color: rate > 35 ? "#ef4444" : rate > 28 ? "#f59e0b" : "#a5b4fc"
                        }}>{rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 20, gridColumn: "span 2" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "#a5b4fc" }}>
                  🧠 Key AI Insights
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { icon: "🎯", title: "Highest Risk Segment", text: "Month-to-Month contract + Fiber Optic users face 41%+ churn — immediate intervention needed" },
                    { icon: "💡", title: "Quick Win", text: "Converting M-t-M customers to One Year contracts could reduce churn by ~35 percentage points" },
                    { icon: "📍", title: "Geographic Focus", text: "J&K (57.2%) and Assam (38.1%) are critical hotspots needing targeted retention campaigns" },
                  ].map(({ icon, title, text }) => (
                    <div key={title} style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
