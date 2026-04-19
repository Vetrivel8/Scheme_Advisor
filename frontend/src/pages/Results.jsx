import { useEffect, useState } from "react";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";

export default function Results() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

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

        let filtered = [...allSchemes];

        if (userData.age) {
          const uAge = parseInt(userData.age);
          if (!isNaN(uAge)) {
            filtered = filtered.filter(s => 
              (s.minAge === null || uAge >= s.minAge) && 
              (s.maxAge === null || uAge <= s.maxAge)
            );
          }
        }

        if (userData.income) {
          const uIncome = parseInt(userData.income);
          if (!isNaN(uIncome)) {
            filtered = filtered.filter(s => (s.maxIncome === null || uIncome <= s.maxIncome));
          }
        }

        if (userData.occupation) {
          const occMapping = {
            "farmer": "agriculture",
            "student": "education",
            "woman": "women",
            "elderly": "social welfare",
            "employee": "employment"
          };
          const occValue = String(userData.occupation).toLowerCase().trim();
          const mappedCat = (occMapping[occValue] || occValue).trim();

          filtered = filtered.filter(s => {
            const categories = (Array.isArray(s.category) ? s.category : [s.category]).map(c => String(c).toLowerCase().trim());
            const tags = (Array.isArray(s.tags) ? s.tags : []).map(t => String(t).toLowerCase().trim());
            
            // 1. Primary Mapping Match
            if (categories.includes(mappedCat)) return true;
            if (tags.includes(occValue)) return true;

            // 2. High Visibility Categories (Social Welfare should be shown for almost everyone)
            if (categories.includes("social welfare")) return true;
            
            // 3. Gender-based inclusivity (If they picked Woman occupation, show all women category schemes)
            // Even if they picked Student, we can't reliably know gender, but showing Women schemes to everyone isn't too bad
            // For now, let's keep it to occupation match unless it's social welfare.
            
            return false;
          });
        }

        setSchemes(filtered);
      } catch (err) {
        console.error("Error fetching schemes:", err);
        // Fallback to showing all schemes on error to prevent empty screen
        if (allSchemes) setSchemes(allSchemes);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchemes();
  }, []);

  return (
    <div className="min-h-screen bg-surface-bright px-8 py-16">
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="display-md text-primary mb-4 tracking-tighter">
          Your Paths to <span className="text-secondary italic">Opportunity</span>.
        </h2>
        <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed">
          {loading 
            ? "Our engines are analyzing the vast library of government support to find your perfect matches..." 
            : `Based on your unique profile, we've identified ${schemes.length} schemes that offer the support you deserve.`}
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-bold text-primary font-mono tracking-widest uppercase text-xs">Processing Eligibility Map</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="card-tonal p-20 text-center">
            <h3 className="text-2xl font-bold text-on-surface mb-2">No matching paths discovered yet</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">Consider broadening your criteria or checking back soon as new schemes are added daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schemes.map(s => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

