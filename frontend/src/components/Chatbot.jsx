import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User, Bot, ExternalLink, Globe } from "lucide-react";
import axios from "../api/axios";
import { useLang } from "../context/LanguageContext";

const QUICK_PROMPTS_EN = [
  "Recommend schemes for my profile",
  "Agriculture subsidies for farmers",
  "Education schemes for girls",
  "Health insurance for low income families",
];

const QUICK_PROMPTS_TA = [
  "என் சுயவிவரத்திற்கான திட்டங்களை பரிந்துரை",
  "விவசாயிகளுக்கான மானியங்கள்",
  "பெண்களுக்கான கல்வி திட்டங்கள்",
  "குறைந்த வருமானத்திற்கான சுகாதார காப்பீடு",
];

export default function Chatbot() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemeCount, setSchemeCount] = useState(0);
  const [chatHistory, setChatHistory] = useState([]); // { role, content }
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: lang === "ta"
        ? "வணக்கம்! நான் உங்கள் திட்ட ஆலோசகர். எந்த அரசு திட்டத்தைப் பற்றியும் கேளுங்கள் — தமிழிலும் கேட்கலாம்!"
        : "Hello! I'm your AI Scheme Advisor powered by Gemini. Ask me anything about government schemes — in English or Tamil!",
      sources: [],
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Fetch scheme count for display
  useEffect(() => {
    axios.get("/schemes").then(res => setSchemeCount(res.data?.length || 0)).catch(() => {});
  }, []);

  const getProfile = () => {
    const raw = JSON.parse(localStorage.getItem("userData") || "{}");
    const profile = raw.data || (raw.age ? raw : null);
    return profile;
  };

  const handleSend = async (text = input) => {
    const userText = text.trim();
    if (!userText || loading) return;

    setInput("");
    setLoading(true);

    // Append user message to UI
    setMessages(prev => [...prev, { sender: "user", text: userText, sources: [] }]);

    const profile = getProfile();

    try {
      const res = await axios.post("/chat", {
        query: userText,
        profile,
        chatHistory: chatHistory.slice(-6), // last 6 exchanges for context
        lang,
      });

      const { reply, sources = [] } = res.data;

      // Update rolling chat history for context
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: reply },
      ].slice(-12)); // keep last 12 messages in history

      setMessages(prev => [...prev, { sender: "bot", text: reply, sources }]);
    } catch (err) {
      const fallback = lang === "ta"
        ? "மன்னிக்கவும், இப்போது சேவை கிடைக்கவில்லை. சிறிது நேரத்திற்கு பிறகு மீண்டும் முயற்சிக்கவும்."
        : "Sorry, I'm having trouble right now. Please try again in a moment!";
      setMessages(prev => [...prev, { sender: "bot", text: fallback, sources: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = lang === "ta" ? QUICK_PROMPTS_TA : QUICK_PROMPTS_EN;

  const renderText = (text) => {
    return text.split("\n").map((line, i) => {
      // Bold text between **
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i} className={line.startsWith("•") || line.startsWith("-") || line.startsWith("📍") ? "mt-1.5" : (i > 0 ? "mt-1" : "")}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Open AI Chatbot"
      >
        {open ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-primary" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[640px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.18)] border border-white/20 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-6 duration-300">

          {/* Header */}
          <div className="bg-primary p-6 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-[0.15em]">AI Scheme Advisor</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white/70 uppercase">
                      Gemini • {schemeCount > 0 ? `${schemeCount} Schemes` : "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg border border-white/10">
                <Globe size={12} />
                <span className="text-[10px] font-black uppercase">{lang === "ta" ? "தமிழ்" : "EN"}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 scrollbar-hide bg-gradient-to-b from-gray-50/20 to-transparent">

            {/* Quick Prompts — only at start */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-3">
                  {lang === "ta" ? "விரைவு கேள்விகள்" : "Quick prompts"}
                </p>
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-semibold text-gray-600 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[92%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${msg.sender === "user" ? "bg-primary text-white border-primary" : "bg-white text-primary border-gray-100"}`}>
                    {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className="space-y-2">
                    {/* Bubble */}
                    <div className={`p-4 rounded-[1.25rem] text-sm leading-relaxed font-medium ${msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/15"
                      : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"
                    }`}>
                      {renderText(msg.text)}
                    </div>

                    {/* Source chips */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {msg.sources.map((s, j) => (
                          <a
                            key={j}
                            href={s.link || `/scheme/${s.id}`}
                            target={s.link ? "_blank" : "_self"}
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 border border-primary/15 text-primary rounded-full text-[10px] font-black uppercase tracking-wide hover:bg-primary/10 transition-colors"
                          >
                            <ExternalLink size={9} />
                            {s.title.length > 30 ? s.title.slice(0, 28) + "…" : s.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center">
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={lang === "ta" ? "கேள்வி கேளுங்கள்..." : "Ask about any government scheme..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading}
                className="w-full pl-5 pr-14 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/10 focus:border-primary/40 outline-none text-sm transition-all placeholder:text-gray-400 font-medium disabled:opacity-60"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-2.5 font-bold uppercase tracking-widest">
              Powered by Gemini AI • RAG System
            </p>
          </div>
        </div>
      )}
    </>
  );
}
