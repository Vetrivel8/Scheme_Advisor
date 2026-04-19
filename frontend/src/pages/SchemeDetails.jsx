import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bookmark, Share2, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import axios from "../api/axios";
import { addNotification } from "../utils/notifications";

export default function SchemeDetails() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const response = await axios.get(`/schemes/${id}`);
        setScheme(response.data);
        
        // Add to history
        const history = JSON.parse(localStorage.getItem("viewHistory") || "[]");
        if (!history.includes(parseInt(id))) {
          const newHistory = [parseInt(id), ...history].slice(0, 10);
          localStorage.setItem("viewHistory", JSON.stringify(newHistory));
        }

        // Check if saved
        const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
        setIsSaved(saved.includes(parseInt(id)));
      } catch (err) {
        console.error("Error fetching scheme details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
    let newSaved;
    if (isSaved) {
      newSaved = saved.filter(sid => sid !== parseInt(id));
    } else {
      newSaved = [...saved, parseInt(id)];
    }
    localStorage.setItem("savedSchemes", JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!scheme) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-gray-800">Scheme Not Found</h2>
      <Link to="/" className="mt-4 text-primary font-bold">Return Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Editorial Header */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Back to Exploration
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary/10">
                  Official Portal Path
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                  <Clock size={12} /> Last updated: March 2026
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">{scheme.title?.en}</h1>
              <p className="text-lg text-gray-500 font-medium max-w-2xl">{scheme.department?.en}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSave}
                className={`p-4 rounded-2xl border transition-all ${isSaved ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-200 hover:border-primary/50 hover:text-primary'}`}
              >
                <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <button className="p-4 bg-white text-gray-400 border border-gray-200 rounded-2xl hover:border-primary/50 hover:text-primary transition-all">
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          
          <section>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <ShieldCheck size={18} />
              Eligibility Framework
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm leading-loose text-gray-700">
              {scheme.eligibility?.en}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
                {scheme.minAge !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Minimum Age</p>
                    <p className="text-lg font-bold text-gray-800">{scheme.minAge} Years</p>
                  </div>
                )}
                {scheme.maxAge !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Maximum Age</p>
                    <p className="text-lg font-bold text-gray-800">{scheme.maxAge || 'None'} Years</p>
                  </div>
                )}
                {scheme.maxIncome !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Income Limit</p>
                    <p className="text-lg font-bold text-gray-800">₹{scheme.maxIncome.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6">Support & Benefits</h2>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm leading-loose text-gray-700 italic font-medium">
               "{scheme.benefits?.en}"
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-6">Application Procedure</h2>
            <div className="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
               <p className="relative z-10 leading-relaxed text-blue-100/90 font-medium">
                {scheme.apply?.en}
               </p>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Ready to apply?</h3>
              {scheme.link && (
                <a 
                  href={scheme.link} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => {
                    addNotification(
                      'success', 
                      'Application Initiated', 
                      `You've started the application process for ${scheme.title?.en}. Redirecting to official portal.`
                    );
                  }}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-4"
                >
                  Go to Official Portal <ExternalLink size={16} />
                </a>
              )}
             <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest px-4">
               Make sure yours documents are ready before proceeding
             </p>
           </div>

           <div className="bg-primary-container/10 p-8 rounded-3xl border border-primary/5">
             <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Fast-Track Assistance</h3>
             <p className="text-xs text-on-surface-variant font-medium leading-loose mb-6">
               Need help with this specific scheme? Our AI advisor has processed the documentation for this pathway.
             </p>
             <button className="w-full py-3 bg-white text-primary text-xs font-bold rounded-xl border border-primary/10 hover:bg-white/50 transition-all">
               Analyze My Eligibility
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

