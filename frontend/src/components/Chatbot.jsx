import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User, Bot } from "lucide-react";
import axios from "../api/axios";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your Scheme Assistant. Ask me about any government scheme, category, or get recommendations based on your profile!" },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch schemes once on mount
  useEffect(() => {
    axios.get("/schemes").then(res => setSchemes(res.data)).catch(() => {});
  }, []);

  const getProfile = () => {
    const raw = JSON.parse(localStorage.getItem("userData") || "{}");
    return raw.age ? raw : null;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const lc = userText.toLowerCase();

    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = "";
      const profile = getProfile();

      // 1. Recommendation intent
      if (lc.includes("recommend") || lc.includes("suggest") || lc.includes("suitable") || lc.includes("my profile") || lc.includes("eligible")) {
        if (!profile) {
          reply = "Please complete your profile details first so I can suggest matching schemes for you!";
        } else {
          const occ = String(profile.occupation || "").toLowerCase().trim();
          const income = parseInt(profile.income) || Infinity;
          const age = parseInt(profile.age) || 0;

          const matches = schemes.filter(s => {
            if (s.maxIncome !== null && income > s.maxIncome) return false;
            if (s.minAge !== null && age < s.minAge) return false;
            if (s.maxAge !== null && age > s.maxAge) return false;
            const cats = (Array.isArray(s.category) ? s.category : [s.category]).map(c => String(c).toLowerCase());
            const tags = (Array.isArray(s.tags) ? s.tags : []).map(t => String(t).toLowerCase());
            const map = { farmer: "agriculture", student: "education", woman: "women", elderly: "social welfare", employee: "employment" };
            const mapped = map[occ] || occ;
            return cats.includes(mapped) || tags.includes(occ) || cats.includes("social welfare");
          }).slice(0, 4);

          if (matches.length > 0) {
            reply = `Based on your profile (${profile.occupation}, ₹${profile.income}/yr), here are top matches:\n\n` +
              matches.map(s => `📍 ${s.title.en}`).join("\n") +
              "\n\nAsk me about any of these for more details!";
          } else {
            reply = `I couldn't find exact matches for your profile right now. Try browsing by category in the main portal!`;
          }
        }
      }
      // 2. Category search
      else if (["agriculture", "education", "women", "employment", "social welfare", "health", "housing", "pension", "disability"].some(c => lc.includes(c))) {
        const matchedCat = ["agriculture", "education", "women", "employment", "social welfare", "health", "housing", "pension", "disability"].find(c => lc.includes(c));
        const results = schemes.filter(s => {
          const cats = (Array.isArray(s.category) ? s.category : [s.category]).map(c => String(c).toLowerCase());
          const tags = (Array.isArray(s.tags) ? s.tags : []).map(t => String(t).toLowerCase());
          return cats.some(c => c.includes(matchedCat)) || tags.some(t => t.includes(matchedCat));
        }).slice(0, 4);

        if (results.length > 0) {
          reply = `Here are some **${matchedCat.toUpperCase()}** schemes:\n\n` +
            results.map(s => `• ${s.title.en}`).join("\n") +
            "\n\nAsk me about any specific scheme for details!";
        } else {
          reply = `I couldn't find schemes under "${matchedCat}" right now.`;
        }
      }
      // 3. Specific scheme lookup
      else {
        const found = schemes.find(s => {
          const name = s.title.en.toLowerCase();
          return name.includes(lc) || lc.includes(name) ||
            name.split(" ").some(w => w.length > 3 && lc.includes(w.toLowerCase()));
        });

        if (found) {
          if (lc.includes("benefit") || lc.includes("what") || lc.includes("about") || lc.includes("detail")) {
            reply = `**${found.title.en}**\n\n📋 Benefits: ${found.benefits.en}\n\n✅ Eligibility: ${found.eligibility.en}`;
          } else if (lc.includes("apply") || lc.includes("how") || lc.includes("document") || lc.includes("paper")) {
            reply = `**${found.title.en}**\n\n📝 How to Apply: ${found.apply.en}` +
              (found.requiredDocs?.length ? `\n\n📄 Documents: ${found.requiredDocs.join(", ")}` : "");
          } else {
            reply = `I found **${found.title.en}**.\n\nAsk me about its 'benefits', 'eligibility', or 'how to apply'!`;
          }
        } else {
          // 4. Greeting
          if (lc.includes("hello") || lc.includes("hi") || lc.includes("hey")) {
            reply = "Hello! 👋 I can help you find government schemes. Try asking:\n• 'Recommend schemes for me'\n• 'Agriculture schemes'\n• 'Tell me about PM Kisan'";
          } else {
            reply = "I can help with government schemes! Try:\n• 'Recommend schemes for my profile'\n• 'Education schemes'\n• 'Tell me about PM Kisan Samman Nidhi'";
          }
        }
      }

      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      <button
        id="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center"
      >
        {open ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse border-2 border-primary" />
          </div>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[620px] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/20 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-6 duration-300">

          {/* Header */}
          <div className="bg-primary p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <Bot size={32} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-[0.2em]">SmartBot</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[11px] font-black text-white/70 uppercase">
                    {schemes.length > 0 ? `${schemes.length} Schemes Loaded` : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-gray-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-4 max-w-[90%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${msg.sender === "user" ? "bg-primary text-white border-primary" : "bg-white text-gray-400 border-gray-100"}`}>
                    {msg.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-5 rounded-[1.5rem] text-[15px] font-medium leading-relaxed ${msg.sender === "user" ? "bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10" : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"}`}>
                    {msg.text.split("\n").map((line, j) => (
                      <div key={j} className={line.startsWith("📍") || line.startsWith("•") || line.startsWith("📄") || line.startsWith("📋") || line.startsWith("✅") || line.startsWith("📝") ? "mt-2" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about any scheme..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="w-full pl-5 pr-14 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm transition-all placeholder:text-gray-400 font-medium"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-4 font-bold uppercase tracking-widest">
              AI assistant may vary in accuracy
            </p>
          </div>
        </div>
      )}
    </>
  );
}
