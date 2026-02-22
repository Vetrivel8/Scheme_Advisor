import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import schemes from "../data/scheme.json";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello 👋 I can help you find government schemes." },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const userText = input.toLowerCase();

    let botReply = "Sorry, I couldn't find any schemes related to that.";

    // 🔎 Search by category or keyword
    const matchedSchemes = schemes.filter(
      (scheme) =>
        scheme.name.toLowerCase().includes(userText) ||
        scheme.category.toLowerCase().includes(userText)
    );

    if (matchedSchemes.length > 0) {
      botReply =
        "Here are some schemes you might be interested in:\n\n" +
        matchedSchemes.slice(0, 3).map((s) => `• ${s.name}`).join("\n");
    }

    setMessages((prev) => [
      ...prev,
      userMessage,
      { sender: "bot", text: botReply },
    ]);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white 
                   p-4 rounded-full shadow-lg hover:bg-blue-700 
                   transition-all duration-300 z-50"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-white 
                        rounded-2xl shadow-2xl border border-gray-200 
                        flex flex-col overflow-hidden z-50">

          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 font-semibold">
            Scheme Assistant
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {msg.text.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              placeholder="Ask about schemes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 px-3 py-2 border border-gray-300 
                         rounded-lg focus:ring-2 focus:ring-blue-500 
                         outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
