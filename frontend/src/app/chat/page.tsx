"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { chatAPI } from "@/lib/api";
import { ChatMessage, AGENT_COLORS, AGENT_ICONS } from "@/types";
import {
  Send, Bot, User, Loader2, ChevronDown, ChevronUp,
  Zap, Shield, Wrench, Factory, BarChart3, Brain,
  Trash2, Info, TrendingUp, Copy, Check,
} from "lucide-react";

const AGENT_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  MAINTENANCE: { icon: Wrench,    color: "#f59e0b", label: "Maintenance Agent" },
  SAFETY:      { icon: Shield,    color: "#ef4444", label: "Safety Agent"      },
  ENERGY:      { icon: Zap,       color: "#10b981", label: "Energy Agent"      },
  PRODUCTION:  { icon: Factory,   color: "#3b82f6", label: "Production Agent"  },
  REPORTING:   { icon: BarChart3, color: "#8b5cf6", label: "Reporting Agent"   },
  SUPERVISOR:  { icon: Brain,     color: "#6366f1", label: "Supervisor Agent"  },
};

const SUGGESTED = [
  "Why is Plant A at risk of downtime?",
  "What are the top safety hazards right now?",
  "How can we reduce energy consumption by 15%?",
  "Which units need maintenance in the next 48 hours?",
  "Generate an executive summary for the board meeting",
  "What is causing the production shortfall in Plant B?",
  "Identify the highest CO₂ emitting units",
  "What is our current safety score and how to improve it?",
];

const PLANTS = ["ALL", "Plant-A", "Plant-B", "Plant-C", "Plant-D"];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full bg-steel-600/30 border border-steel-600/40 flex items-center justify-center flex-shrink-0">
        <Bot size={15} className="text-steel-400" />
      </div>
      <div className="card-glass rounded-2xl rounded-bl-sm px-4 py-3 border border-card-border max-w-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-steel-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-steel-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-steel-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function AgentBadge({ agent }: { agent: string }) {
  const meta = AGENT_META[agent] || AGENT_META.SUPERVISOR;
  const Icon = meta.icon;
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: `${meta.color}15`, borderColor: `${meta.color}30`, color: meta.color }}>
      <Icon size={10} />
      {meta.label}
    </div>
  );
}

function RoutingScores({ scores }: { scores: Record<string, number> }) {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const max = sorted[0]?.[1] || 1;
  return (
    <div className="space-y-1.5 mt-2">
      {sorted.map(([agent, score]) => (
        <div key={agent} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{agent}</span>
          <div className="flex-1 h-1 bg-surface-50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(score / max) * 100}%`, background: AGENT_COLORS[agent] || "#6366f1" }} />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-3">{score}</span>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-steel-600" : "bg-steel-600/30 border border-steel-600/40"
      }`}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} className="text-steel-400" />
        }
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Agent badge for assistant */}
        {!isUser && msg.agent && <AgentBadge agent={msg.agent} />}

        {/* Bubble */}
        <div className={`relative group rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-steel-600 text-white rounded-br-sm"
            : "card-glass border border-card-border rounded-bl-sm"
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{msg.content}</p>

          {/* Copy button */}
          <button onClick={handleCopy}
            className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-card border border-card-border">
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} className="text-muted-foreground" />}
          </button>
        </div>

        {/* Confidence */}
        {!isUser && msg.confidence !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-surface-50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-steel-500" style={{ width: `${msg.confidence * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground font-mono">{(msg.confidence * 100).toFixed(0)}% confidence</span>
          </div>
        )}

        {/* Expandable reasoning */}
        {!isUser && (msg.reasoning || msg.impact) && (
          <div className="w-full">
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
              <Info size={10} />
              {expanded ? "Hide" : "Show"} reasoning & impact
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            {expanded && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {msg.reasoning && (
                  <div className="p-2.5 rounded-lg bg-steel-600/10 border border-steel-600/20">
                    <div className="flex items-center gap-1 mb-1">
                      <Info size={10} className="text-steel-400" />
                      <span className="text-xs font-semibold text-steel-400 uppercase tracking-wide">Reasoning</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{msg.reasoning}</p>
                  </div>
                )}
                {msg.impact && (
                  <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={10} className="text-green-400" />
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Expected Impact</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{msg.impact}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-600">
          {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages,   setMessages]   = useState<ChatMessage[]>([]);
  const [input,      setInput]      = useState("");
  const [sending,    setSending]    = useState(false);
  const [selectedPlant, setSelectedPlant] = useState("ALL");
  const [routingScores, setRoutingScores] = useState<Record<string, number>>({});
  const [showPanel,  setShowPanel]  = useState(true);
  const [lastAgent,  setLastAgent]  = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await chatAPI.sendMessage(text.trim(), selectedPlant, history);
      const d   = res.data;
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: d.response,
        agent: d.agent,
        confidence: d.confidence,
        reasoning: d.reasoning,
        impact: d.impact,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setRoutingScores(d.routing_scores || {});
      setLastAgent(d.agent);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Unable to reach the APIS backend. Please check the server connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [messages, selectedPlant, sending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const clearChat = () => {
    setMessages([]);
    setRoutingScores({});
    setLastAgent(null);
  };

  const lastAgentMeta = lastAgent ? AGENT_META[lastAgent] : null;

  return (
    <AppShell>
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border/40 bg-surface/80 backdrop-blur-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Multi-agent plant intelligence — powered by Gemini</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Plant selector */}
            <div className="flex items-center gap-1 bg-card border border-card-border rounded-lg p-1">
              {PLANTS.map(p => (
                <button key={p} onClick={() => setSelectedPlant(p)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${selectedPlant === p ? "bg-steel-600 text-white" : "text-muted-foreground hover:text-white"}`}>
                  {p}
                </button>
              ))}
            </div>
            {/* Panel toggle */}
            <button onClick={() => setShowPanel(v => !v)}
              className="p-2 rounded-lg bg-card border border-card-border text-muted-foreground hover:text-white transition-all text-xs font-medium flex items-center gap-1.5">
              <Brain size={13} />
              {showPanel ? "Hide" : "Show"} Panel
            </button>
            {/* Clear */}
            {messages.length > 0 && (
              <button onClick={clearChat}
                className="p-2 rounded-lg bg-card border border-card-border text-muted-foreground hover:text-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Chat area */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                  {/* Hero */}
                  <div className="w-16 h-16 rounded-2xl bg-steel-600/20 border border-steel-600/30 flex items-center justify-center glow-steel">
                    <Brain size={28} className="text-steel-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">APIS Multi-Agent System</h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Ask any question about plant operations. The Supervisor Agent routes your query
                      to the most relevant specialist — Maintenance, Safety, Energy, Production, or Reporting.
                    </p>
                  </div>

                  {/* Agent chips */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(AGENT_META).map(([key, meta]) => {
                      const Icon = meta.icon;
                      return (
                        <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                          style={{ background: `${meta.color}10`, borderColor: `${meta.color}25`, color: meta.color }}>
                          <Icon size={11} />
                          {meta.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggested queries */}
                  <div className="w-full max-w-2xl">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 font-semibold">Suggested queries</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {SUGGESTED.map(q => (
                        <button key={q} onClick={() => send(q)}
                          className="text-left px-4 py-3 rounded-xl bg-card border border-card-border hover:border-steel-600/40 hover:bg-card-hover transition-all text-sm text-gray-300 hover:text-white">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              {sending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Suggested prompts strip (when chat has messages) */}
            {messages.length > 0 && (
              <div className="px-6 pb-2 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                {SUGGESTED.slice(0, 4).map(q => (
                  <button key={q} onClick={() => send(q)} disabled={sending}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs bg-card border border-card-border text-muted-foreground hover:text-white hover:border-steel-600/40 transition-all disabled:opacity-50">
                    {q.length > 40 ? q.slice(0, 40) + "…" : q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <div className="flex gap-3 items-end card-glass rounded-2xl border border-card-border p-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about maintenance, safety, energy, production, or request a report…"
                  rows={1}
                  disabled={sending}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed max-h-32 disabled:opacity-60"
                  style={{ minHeight: "24px" }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || sending}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-steel-600 hover:bg-steel-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all glow-steel"
                >
                  {sending
                    ? <Loader2 size={15} className="animate-spin text-white" />
                    : <Send size={15} className="text-white" />
                  }
                </button>
              </div>
              <p className="text-xs text-gray-700 mt-2 text-center">
                Enter to send · Shift+Enter for new line · Responses powered by Gemini 1.5 Flash
              </p>
            </div>
          </div>

          {/* Right panel - agent reasoning */}
          {showPanel && (
            <div className="w-72 flex-shrink-0 border-l border-card-border/40 bg-surface-50 flex flex-col overflow-hidden">
              <div className="px-4 py-4 border-b border-card-border/40">
                <h3 className="font-semibold text-white text-sm">Agent Panel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Routing & reasoning details</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Active agent */}
                {lastAgentMeta && lastAgent && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Active Agent</p>
                    <div className="p-3 rounded-xl border"
                      style={{ background: `${lastAgentMeta.color}10`, borderColor: `${lastAgentMeta.color}25` }}>
                      <div className="flex items-center gap-2">
                        {(() => { const Icon = lastAgentMeta.icon; return <Icon size={16} style={{ color: lastAgentMeta.color }} />; })()}
                        <span className="font-semibold text-sm text-white">{lastAgentMeta.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Routed by Supervisor Agent based on keyword analysis.
                      </p>
                    </div>
                  </div>
                )}

                {/* Routing scores */}
                {Object.keys(routingScores).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Routing Scores</p>
                    <div className="p-3 rounded-xl bg-card border border-card-border">
                      <RoutingScores scores={routingScores} />
                    </div>
                  </div>
                )}

                {/* All agents */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Available Agents</p>
                  <div className="space-y-2">
                    {Object.entries(AGENT_META).map(([key, meta]) => {
                      const Icon = meta.icon;
                      const isActive = key === lastAgent;
                      return (
                        <div key={key} className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                          isActive
                            ? "border-opacity-40 bg-opacity-10"
                            : "border-card-border bg-card/30"
                        }`}
                          style={isActive ? { borderColor: `${meta.color}40`, background: `${meta.color}08` } : {}}>
                          <div className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ background: `${meta.color}20` }}>
                            <Icon size={12} style={{ color: meta.color }} />
                          </div>
                          <span className={`text-xs font-medium ${isActive ? "text-white" : "text-muted-foreground"}`}>
                            {meta.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{ background: meta.color }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Session</p>
                  <div className="p-3 rounded-xl bg-card border border-card-border space-y-2">
                    {[
                      { label: "Messages", value: messages.length },
                      { label: "User queries", value: messages.filter(m => m.role === "user").length },
                      { label: "AI responses", value: messages.filter(m => m.role === "assistant").length },
                      { label: "Plant context", value: selectedPlant },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-mono text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
