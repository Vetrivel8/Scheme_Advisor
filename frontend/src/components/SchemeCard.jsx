import { Link } from "react-router-dom";
import { CheckCircle, ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export default function SchemeCard({ scheme }) {
  const { lang } = useLang();
  const t = (field) => scheme[field]?.[lang] || scheme[field]?.en || "";
  const cat = Array.isArray(scheme.category) ? scheme.category[0] : scheme.category;

  return (
    <div className="card-tonal flex flex-col h-full group">

      {/* Category Tag */}
      <div className="mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
          {cat || "General"}
        </span>
      </div>

      {/* Scheme Title */}
      <h3 className="text-xl font-bold text-on-surface leading-snug group-hover:text-primary transition-colors duration-300">
        {t("title")}
      </h3>

      {/* Description */}
      <p className="mt-4 text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
        {t("benefits")}
      </p>

      {/* Eligibility Section */}
      <div className="bg-surface/50 rounded-xl p-4 mb-6">
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 opacity-50">
          {lang === "ta" ? "தகுதி விவரங்கள்" : "Eligibility Highlights"}
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
            <span>{lang === "ta" ? "விவரங்களை ஆராய்" : "Explore Details"}</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}
