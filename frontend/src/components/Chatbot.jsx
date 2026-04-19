import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, User, Info, FileText, HelpCircle, Bot } from "lucide-react";
import localSchemes from "../data/scheme.json";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your personalized Scheme Assistant. I know everything about the schemes your organization has defined. How can I help you today?" },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getProfileData = () => {
    const raw = JSON.parse(localStorage.getItem("userData") || "{}");
    if (raw.timestamp && (Date.now() - raw.timestamp < 2 * 60 * 1000)) {
      return raw.data;
    }
    return raw.age ? raw : null;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const lcText = userText.toLowerCase();
    
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let botReply = "";
      const profile = getProfileData();

      // Logic 1: Recommendation request
      if (lcText.includes("recommend") || lcText.includes("suggest") || lcText.includes("my profile") || lcText.includes("suitable") || lcText.includes("fit")) {
        if (!profile) {
          botReply = "I'd love to suggest some schemes, but I don't know much about your profile yet. Please complete the registration form!";
        } else {
          const occValue = String(profile.occupation || "").toLowerCase().trim();
          
          // Match based on 'why' tags in localSchemes
          const matches = localSchemes.filter(s => {
            const whyTags = s.why.map(t => t.toLowerCase());
            return whyTags.includes(occValue) || 
                   (profile.income < 100000 && whyTags.includes("low income")) ||
                   (profile.age > 60 && whyTags.includes("elderly"));
          }).slice(0, 4);

          if (matches.length > 0) {
            botReply = `Based on your profile as a ${profile.occupation}, here are highly relevant schemes from our local list:\n\n` + 
                       matches.map(s => `📍 ${s.name}`).join("\n") + 
                       "\n\nYou can ask me about 'documents' for any of these!";
          } else {
            botReply = `I couldn't find exact matches in our defined list for a ${profile.occupation} right now. You can browse all categories in the main portal.`;
          }
        }
      }
      // Logic 2: Specific scheme details (Docs/Description)
      else {
        // More fuzzy search for scheme names
        const found = localSchemes.find(s => {
          const name = s.name.toLowerCase();
          return name.includes(lcText) || lcText.includes(name) || 
                 (lcText.length > 4 && name.split(" ").some(word => word.length > 3 && lcText.includes(word.toLowerCase())));
        });

        if (found) {
          if (lcText.includes("document") || lcText.includes("paper") || lcText.includes("docs")) {
            botReply = `To apply for **${found.name}**, you will need:\n` + 
                       found.docs.map(d => `📄 ${d}`).join("\n");
          } else if (lcText.includes("what is") || lcText.includes("detail") || lcText.includes("about") || lcText.includes("info")) {
            botReply = `**${found.name}**\n${found.desc}\n\n**Category:** ${found.category}\n**Eligibility Keys:** ${found.why.join(", ")}`;
          } else {
            botReply = `I found information on **${found.name}**. Would you like to check the 'documents' required or a 'description'?`;
          }
        } else {
          // Logic 3: Category search
          const categories = ["agriculture", "education", "social welfare", "employment", "women"];
          const matchedCat = categories.find(c => lcText.includes(c));
          
          if (matchedCat) {
            const matches = localSchemes.filter(s => s.category.toLowerCase().includes(matchedCat)).slice(0, 3);
            botReply = `Here are some **${matchedCat.toUpperCase()}** schemes from our defined list:\n\n` + 
                       matches.map(s => `• ${s.name}`).join("\n");
          } else {
            botReply = "I am specifically programmed to handle the 20 schemes defined in your `scheme.json` file. Try asking about 'PM Kisan' or for 'recommendations'.";
          }
        }
      }

      setMessages(prev => [...prev, { sender: "bot", text: botReply }]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-primary text-white 
                   p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95
                   transition-all duration-300 z-50 flex items-center justify-center"
      >
        {open ? <X size={24} /> : (
          <div className="relative">
            <MessageCircle size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse border-2 border-primary" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[420px] h-[620px] bg-white/95 backdrop-blur-xl
                        rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/20 
                        flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-6 duration-300">

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
                  <span className="text-[11px] font-black text-white/70 uppercase">Always Learning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-gray-50/30">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-4 max-w-[90%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border
                                 ${msg.sender === "user" ? "bg-primary text-white border-primary" : "bg-white text-gray-400 border-gray-100"}`}>
                    {msg.sender === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div
                    className={`p-5 rounded-[1.5rem] text-[15px] font-medium leading-relaxed
                      ${msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-none shadow-xl shadow-primary/10"
                        : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"
                      }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <div key={i} className={line.startsWith("📍") || line.startsWith("•") || line.startsWith("📄") ? "mt-3 flex gap-3" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                 <div className="flex gap-3 max-w-[85%] items-center">
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
            <div className="relative group">
              <input
                type="text"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full pl-5 pr-14 py-4 bg-white border border-gray-200 
                           rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 
                           focus:border-primary outline-none text-sm transition-all
                           placeholder:text-gray-400 font-medium"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 
                           bg-primary text-white rounded-xl hover:scale-105 
                           active:scale-95 disabled:opacity-50 disabled:scale-100
                           transition-all"
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
