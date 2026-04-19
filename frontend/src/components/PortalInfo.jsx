import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import axios from "../api/axios";

export default function PortalInfo() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);

  useEffect(() => {
    axios.get(`/schemes?t=${Date.now()}`)
      .then(res => setAllSchemes(res.data))
      .catch(err => console.error("Search failed to load schemes:", err));
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (val.trim().length > 1) {
      const filtered = allSchemes.filter(s => 
        s.title.en.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
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
          The Dignified Guide to Your <span className="text-secondary italic font-medium">Future</span>.
        </h1>

        {/* Search Bar - Modern & Responsive */}
        <div className="relative mb-12 max-w-xl group">
          <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl group-focus-within:bg-primary/10 transition-all duration-500" />
          <div className="relative flex items-center bg-white border border-gray-100 rounded-[2rem] px-6 py-5 shadow-lg shadow-primary/5">
            <Search className="text-gray-400 mr-4" size={24} />
            <input 
              type="text" 
              placeholder="Search scheme names (e.g. PM Kisan)"
              value={searchValue}
              onChange={handleSearch}
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-gray-700 placeholder:text-gray-300"
            />
            {searchValue && (
               <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[10px] font-black uppercase text-primary tracking-widest animate-in fade-in transition-all">
                 <Sparkles size={12} /> Live matching
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
                      <h4 className="font-bold text-gray-800 group-hover/item:text-primary transition-colors">{s.title.en}</h4>
                      <p className="text-xs text-secondary/60 font-bold uppercase tracking-widest mt-1">Direct Application Path</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-primary group-hover/item:text-white transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of curated matches</p>
              </div>
            </div>
          )}
        </div>

        {/* Description with High-End Editorial feel */}
        <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-12">
          Discover {allSchemes.length} government schemes curated precisely for your life stage. 
          We've eliminated the bureaucratic noise to bring you direct paths to 
          agriculture, education, and social welfare.
        </p>

        {/* Feature Grid with Tonal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { title: "Central & State", desc: "Unified access to all levels of support.", icon: "🏛️" },
            { title: "Smart Discovery", desc: "Eligibility-based filters that respect your time.", icon: "🧠" },
            { title: "Pure Clarity", desc: "No jargon. Just documents and deadlines.", icon: "📄" },
            { title: "Secure & Private", desc: "Your data stays with you throughout the journey.", icon: "🛡️" },
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
            Find Schemes for you
          </button>
          
          <button
            onClick={() => {
              const el = document.getElementById('browse-categories');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-5 bg-surface-container-highest text-primary font-bold rounded-[2rem]
                       hover:bg-primary/5 transition-all duration-300"
          >
            Browse Categories
          </button>
        </div>
      </div>
    </div>
  );
}


