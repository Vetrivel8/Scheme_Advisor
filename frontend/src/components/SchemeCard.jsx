import { Link } from "react-router-dom";
import { CheckCircle, ArrowUpRight, Sparkles, AlertCircle } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";

export default function SchemeCard({ scheme }) {
  const { lang } = useLang();
  const globalT = translations[lang];
  const t = (field) => scheme[field]?.[lang] || scheme[field]?.en || "";
  const cat = Array.isArray(scheme.category) ? scheme.category[0] : scheme.category;

  const translatedCategory = translations[lang]?.[cat?.toLowerCase()] || cat || "General";
  
  const score = scheme.matchScore || 0;
  const isHighMatch = score >= 80;
  const isMediumMatch = score >= 50;

  return (
    <div className="card-tonal flex flex-col h-full group relative overflow-hidden">
      {/* Match Badge */}
      {score > 0 && (
        <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest text-white z-10 
          ${isHighMatch ? 'bg-secondary' : isMediumMatch ? 'bg-primary' : 'bg-on-surface-variant'}`}>
          {isHighMatch ? 'Best Match' : isMediumMatch ? 'Good Match' : 'Potential Match'}
        </div>
      )}

      {/* Category Tag */}
      <div className="mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
          {translatedCategory}
        </span>
      </div>

      {/* Scheme Title */}
      <h3 className="text-xl font-bold text-on-surface leading-snug group-hover:text-primary transition-colors duration-300 pr-12">
        {t("title")}
      </h3>

      {/* Eligibility Meter (Level 1 AI) */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
          <span className="text-on-surface-variant flex items-center gap-1">
            <Sparkles size={12} className="text-primary" /> Eligibility Score
          </span>
          <span className={isHighMatch ? 'text-secondary' : 'text-primary'}>{score}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isHighMatch ? 'bg-secondary' : 'bg-primary'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        {/* Success Prediction (Level 3 AI) */}
        <div className="flex items-center gap-2 pt-1">
          <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1
            ${isHighMatch ? 'bg-secondary/10 text-secondary' : isMediumMatch ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-600'}`}>
            <AlertCircle size={10} /> 
            Success Chance: {isHighMatch ? 'High' : isMediumMatch ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>

      {/* AI Insights / Match Reasons (Level 1 AI) */}
      {scheme.matchReasons && scheme.matchReasons.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {scheme.matchReasons.map((reason, i) => (
            <span key={i} className="text-[9px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle size={10} /> {reason}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="mt-4 text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-6 flex-grow">
        {t("benefits")}
      </p>

      {/* Eligibility Highlights */}
      <div className="bg-surface/50 rounded-xl p-4 mb-6">
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-50">
          {globalT.eligibilityHighlights}
        </p>
        <p className="text-xs text-on-surface flex items-start gap-2 leading-relaxed">
          <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 font-medium">{t("eligibility")}</span>
        </p>
      </div>

      {/* Action */}
      <div className="mt-auto">
        <Link to={`/scheme/${scheme.id}`} className="block">
          <button className="w-full py-4 bg-primary text-on-primary text-sm font-bold rounded-xl hover:bg-primary-container transition-all duration-300 flex items-center justify-center gap-2">
            <span>{globalT.exploreDetails}</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}
