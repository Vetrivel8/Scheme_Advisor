import { useEffect, useState } from "react";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";
import { Sparkles } from "lucide-react";
import ExpiryModal from "../components/ExpiryModal";

export default function Results() {
  const { lang } = useLang();
  const t = translations[lang];

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  const SESSION_EXPIRY = 2 * 60 * 1000;
  
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    const rawData = JSON.parse(localStorage.getItem("filtrationData") || "null");
    return rawData?.timestamp || Date.now();
  });

  // Track session expiry in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      if (elapsed >= SESSION_EXPIRY) {
        clearInterval(timer);
        localStorage.removeItem("filtrationData");
        localStorage.removeItem("wizardDraft");
        setShowExpiryModal(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await axios.get(`/schemes?t=${Date.now()}`);
        const allSchemes = response.data;
        const userDataString = localStorage.getItem("filtrationData");
        
        if (!userDataString) {
          setSchemes(allSchemes);
          return;
        }

        let rawData = JSON.parse(userDataString);
        let userData = rawData.data || rawData || {};

        // Smart Ranking Logic (Level 1 AI)
        const scoredSchemes = allSchemes.map(scheme => {
          let score = 0;
          let matchReasons = [];

          // 1. Occupation Match (+40)
          const occMapping = {
            "farmer": "agriculture",
            "student": "education",
            "woman": "women",
            "elderly": "social welfare",
            "employee": "employment"
          };
          const userOcc = String(userData.occupation || "").toLowerCase().trim();
          const mappedCat = (occMapping[userOcc] || userOcc).trim();
          
          const categories = (Array.isArray(scheme.category) ? scheme.category : [scheme.category])
            .map(c => String(c).toLowerCase().trim());
          
          if (categories.includes(mappedCat)) {
            score += 40;
            matchReasons.push(`Matches your role: ${userData.occupation}`);
          }

          // 2. Income Match (+30)
          const uIncome = parseInt(userData.income);
          if (!isNaN(uIncome) && (scheme.maxIncome === null || uIncome <= scheme.maxIncome)) {
            score += 30;
            matchReasons.push("Income within eligibility range");
          }

          // 3. Age Match (+20)
          const uAge = parseInt(userData.age);
          if (!isNaN(uAge) && (scheme.minAge === null || uAge >= scheme.minAge) && (scheme.maxAge === null || uAge <= scheme.maxAge)) {
            score += 20;
            matchReasons.push("Age matched");
          }

          // 4. Default Boost for Social Welfare (+10)
          if (categories.includes("social welfare")) {
            score += 10;
          }

          return { ...scheme, matchScore: score, matchReasons };
        });

        // Filter and Sort by Score
        const filtered = scoredSchemes
          .filter(s => s.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore);

        setSchemes(filtered);
      } catch (err) {
        console.error("Error fetching schemes:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchemes();
  }, [sessionStartTime]);

  return (
    <div className="min-h-screen bg-surface-bright px-8 py-16">
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="display-md text-primary mb-4 tracking-tighter">
          {t.yourPaths} <span className="text-secondary italic">{t.opportunity}</span>.
        </h2>
        <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          {loading 
            ? t.analyzingSchemes
            : `${t.basedOnProfile} ${schemes.length} ${t.schemesFound}`}
        </p>

        {/* What-If Simulator (Level 1 AI) */}
        {!loading && (
          <div className="mt-8 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
              <Sparkles size={16} /> {t.whatIfSimulator}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">{t.age}</label>
              <input 
                type="number" 
                defaultValue={JSON.parse(localStorage.getItem("filtrationData") || "{}")?.data?.age}
                onChange={(e) => {
                  const data = JSON.parse(localStorage.getItem("filtrationData") || "{}");
                  data.data.age = e.target.value;
                  localStorage.setItem("filtrationData", JSON.stringify(data));
                  setSessionStartTime(Date.now()); // Trigger re-run
                }}
                className="w-20 px-3 py-2 bg-surface-container rounded-lg font-bold outline-none focus:ring-2 ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black uppercase text-on-surface-variant">{t.annualIncome}</label>
              <input 
                type="number" 
                defaultValue={JSON.parse(localStorage.getItem("filtrationData") || "{}")?.data?.income}
                onChange={(e) => {
                  const data = JSON.parse(localStorage.getItem("filtrationData") || "{}");
                  data.data.income = e.target.value;
                  localStorage.setItem("filtrationData", JSON.stringify(data));
                  setSessionStartTime(Date.now()); // Trigger re-run
                }}
                className="w-32 px-3 py-2 bg-surface-container rounded-lg font-bold outline-none focus:ring-2 ring-primary/20"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-bold text-primary font-mono tracking-widest uppercase text-xs">{t.processingMap}</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="card-tonal p-20 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-2">{t.noMatchingPaths}</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">{t.noMatchingDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </div>
      
      <ExpiryModal 
        isOpen={showExpiryModal} 
        onClose={() => setShowExpiryModal(false)} 
        t={t} 
      />
    </div>
  );
}
