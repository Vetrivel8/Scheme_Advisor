import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, Mic, MicOff } from "lucide-react";
import axios from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";

export default function PortalInfo() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = translations[lang];

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    axios.get(`/schemes?t=${Date.now()}`)
      .then(res => setAllSchemes(res.data))
      .catch(err => console.error("Search failed to load schemes:", err));

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchValue(transcript);
        filterResults(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [lang]);

  const filterResults = (val) => {
    if (val.trim().length > 1) {
      const filtered = allSchemes.filter(s => {
        const titleEn = s.title.en?.toLowerCase() || "";
        const titleTa = s.title.ta?.toLowerCase() || "";
        return titleEn.includes(val.toLowerCase()) || titleTa.includes(val.toLowerCase());
      }).slice(0, 6);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    filterResults(val);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  const handleFindSchemes = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/wizard");
    } else {
      navigate("/login", { state: { from: "/wizard" } });
    }
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl">
        {/* Editorial Heading */}
        <h1 className="display-md text-primary mb-6">
          {t.heroTitle} <span className="text-secondary italic font-medium">{t.heroSpan}</span>.
        </h1>

        {/* Search Bar - Modern & Responsive */}
        <div className="relative mb-12 max-w-xl group">
          <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl group-focus-within:bg-primary/10 transition-all duration-500" />
          <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] px-6 py-5 shadow-lg shadow-primary/5">
            <Search className="text-gray-400 mr-4" size={24} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchValue}
              onChange={handleSearch}
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-gray-700 placeholder:text-gray-300"
            />
            
            {/* Voice Search Toggle */}
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all duration-300 ml-2 
                ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {searchValue && (
               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[10px] font-black uppercase text-primary tracking-widest animate-in fade-in transition-all ml-2">
                 <Sparkles size={12} /> {t.liveMatching}
               </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <div className="p-2">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => navigate(`/scheme/${s.id}`)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all rounded-2xl group/item text-left"
                  >
                    <div>
                      <h4 className="font-bold text-gray-800 group-hover/item:text-primary transition-colors">{s.title[lang]}</h4>
                      <p className="text-xs text-secondary/60 font-bold uppercase tracking-widest mt-1">{t.directPath}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-primary group-hover/item:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.endOfMatches}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description with High-End Editorial feel */}
        <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-12">
          Discover {allSchemes.length} {t.heroDesc}
        </p>

        {/* Feature Grid with Tonal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { title: t.centralState, desc: t.centralStateDesc, icon: "🏛️" },
            { title: t.smartDiscovery, desc: t.smartDiscoveryDesc, icon: "🧠" },
            { title: t.pureClarity, desc: t.pureClarityDesc, icon: "📄" },
            { title: t.securePrivate, desc: t.securePrivateDesc, icon: "🛡️" },
          ].map((item, idx) => (
            <div key={idx} className="card-tonal group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{item.title}</h3>
              <p className="text-sm text-on-surface-variant leading-loose">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Pillar */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleFindSchemes}
            className="px-10 py-5 bg-primary text-on-primary font-bold rounded-[2rem]
                       shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-300"
          >
            {t.findSchemes}
          </button>
          
          <button
            onClick={() => {
              const el = document.getElementById('browse-categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-5 bg-surface-container-highest text-primary font-bold rounded-[2rem]
                       hover:bg-primary/5 transition-all duration-300"
          >
            {t.browseCategories}
          </button>
        </div>
      </div>
    </div>
  );
}
