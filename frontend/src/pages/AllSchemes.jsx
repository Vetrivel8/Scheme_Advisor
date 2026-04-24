import { useEffect, useState, useMemo, useRef } from "react";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, LayoutGrid, Mic, MicOff, Sparkles } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";

export default function AllSchemes() {
  const { lang } = useLang();
  const t = translations[lang];
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/schemes?t=${Date.now()}`);
        setSchemes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set();
    schemes.forEach(s => {
      if (Array.isArray(s.category)) {
        s.category.forEach(c => cats.add(c));
      } else if (s.category) {
        cats.add(s.category);
      }
    });
    return ["All", ...Array.from(cats)].sort();
  }, [schemes]);

  // Combined logic for Filter, Search, and Sort
  const processedSchemes = useMemo(() => {
    let result = [...schemes];

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        (s.title?.en?.toLowerCase() || "").includes(q) ||
        (s.title?.ta?.toLowerCase() || "").includes(q) ||
        (Array.isArray(s.category)
          ? s.category.some(c => c.toLowerCase().includes(q))
          : (s.category?.toLowerCase() || "").includes(q))
      );
    }

    // Filter by Category
    if (categoryFilter !== "All") {
      result = result.filter(s =>
        Array.isArray(s.category)
          ? s.category.includes(categoryFilter)
          : s.category === categoryFilter
      );
    }

    // Sort
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => (a.title[lang] || a.title.en).localeCompare(b.title[lang] || b.title.en));
        break;
      case "name-desc":
        result.sort((a, b) => (b.title[lang] || b.title.en).localeCompare(a.title[lang] || a.title.en));
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "oldest":
        result.sort((a, b) => a.id - b.id);
        break;
      default:
        break;
    }

    return result;
  }, [schemes, search, categoryFilter, sortBy, lang]);

  // Pagination Logic
  const totalPages = Math.ceil(processedSchemes.length / itemsPerPage);
  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedSchemes.slice(start, start + itemsPerPage);
  }, [processedSchemes, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] px-4 md:px-8 py-12 md:py-20">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 leading-none">
              {t.exploreAll} <span className="text-primary italic">{t.schemes}</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">
              {t.allSchemesDesc} {schemes.length} {t.activePrograms}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 lg:pt-0">
            <div className="relative group flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder={t.searchSchemes}
                className="pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all w-full md:w-80 font-medium text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {/* Voice Search Toggle */}
              <button 
                onClick={toggleListening}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300
                  ${isListening ? 'bg-red-500 text-white animate-pulse shadow-md' : 'text-gray-400 hover:text-primary hover:bg-primary/5'}`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100 last:border-0 overflow-x-auto scrollbar-hide">
            <Filter size={16} className="text-primary hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-sm text-gray-600 focus:ring-0 cursor-pointer capitalize"
            >
              <option value="All">{t.allCategories}</option>
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100 last:border-0">
            <ArrowUpDown size={16} className="text-primary hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-sm text-gray-600 focus:ring-0 cursor-pointer"
            >
              <option value="default">{t.sortById}</option>
              <option value="name-asc">{t.nameAZ}</option>
              <option value="name-desc">{t.nameZA}</option>
              <option value="newest">{t.recentFirst}</option>
              <option value="oldest">{t.oldestFirst}</option>
            </select>
          </div>

          <div className="ml-auto text-xs font-black text-gray-400 uppercase tracking-widest px-4">
            {t.showing} {paginatedSchemes.length} {t.of} {processedSchemes.length} {t.results}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-[4px] border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{t.synchronizing}</p>
          </div>
        ) : paginatedSchemes.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.noSchemesFound}</h3>
            <p className="text-gray-500 max-w-sm font-medium">{t.noSchemesDesc}</p>
            <button
              onClick={() => { setSearch(""); setCategoryFilter("All"); }}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-gray-900/10"
            >
              {t.clearAllFilters}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
              {paginatedSchemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-inherit transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2 mx-4 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide py-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show only 5 pages around current page if there are many pages
                    if (totalPages > 7) {
                      if (pageNum > 1 && pageNum < totalPages && (pageNum < currentPage - 2 || pageNum > currentPage + 2)) {
                        if (pageNum === currentPage - 3 || pageNum === currentPage + 3) return <span key={pageNum} className="text-gray-300 px-1">...</span>;
                        return null;
                      }
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all shadow-sm ${currentPage === pageNum
                          ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                          : "bg-white border border-gray-100 text-gray-500 hover:border-primary/50 hover:text-primary active:scale-95"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-inherit transition-all shadow-sm active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
