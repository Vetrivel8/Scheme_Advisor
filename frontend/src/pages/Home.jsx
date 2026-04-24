import { useEffect } from "react";
import PortalInfo from "../components/PortalInfo";
import CategoryCards from "../components/CategoryCards";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";

export default function Home() {
  const { lang } = useLang();
  const t = translations[lang];

  // Reset session and clear stored form data when navigating to Home
  useEffect(() => {
    localStorage.removeItem("wizardDraft");
    localStorage.removeItem("filtrationData");
    // Optional: if userData is considered temporary session data, uncomment below
    // localStorage.removeItem("userData");
    console.log("Session reset: Form data cleared.");
  }, []);

  return (
    <div className="min-h-screen bg-surface-bright">
      {/* Hero Section: Editorial Focus */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        {/* Abstract Background Element (Organic Layering) */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 origin-top-right -z-10 blur-3xl opacity-50" />

        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Portal Information (Wider column for editorial feel) */}
            <div>
              <PortalInfo />
            </div>

            {/* Right: Hero Image - THE DIGNIFIED GUIDE Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full scale-75 animate-pulse" />
              <div className="relative z-10 p-4">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white group">
                  <img
                    src="/hero-image.png"
                    alt="Prosperity and Growth"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  {/* Subtle Tonal Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-40" />
                </div>

                {/* Floating Organic Element */}
                <div className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-primary/5 animate-bounce-slow">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest leading-none mb-1">{t.dignityGuaranteed}</p>
                    <p className="text-sm font-medium text-on-surface-variant">{t.verifiedSchemes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom: Horizontal Category Strip */}
      <section id="browse-categories" className="py-24 bg-surface-container-low transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">
                {t.exploreByInterest}
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {t.exploreDesc}
              </p>
            </div>
            <div className="h-px flex-grow bg-outline-variant/30 hidden md:block mx-12 mb-4" />
          </div>

          <CategoryCards horizontal />
        </div>
      </section>

      {/* Footer-like organic section */}
      <section className="py-20 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-sm font-bold tracking-[0.3em] uppercase text-on-surface/40">
            {t.footerText}
          </p>
        </div>
      </section>
    </div>
  );
}
