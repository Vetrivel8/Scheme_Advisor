import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";

export default function CategoryResults() {
  const { category } = useParams();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await axios.get(`/schemes?t=${Date.now()}`);
        const filteredSchemes = response.data.filter((s) => {
          const cats = Array.isArray(s.category) ? s.category : [s.category];
          const tags = Array.isArray(s.tags) ? s.tags : [];
          const lowerCat = category.toLowerCase();
          return cats.some(c => c && String(c).toLowerCase().trim() === lowerCat) ||
                 tags.some(t => t && String(t).toLowerCase().trim() === lowerCat);
        });
        setSchemes(filteredSchemes);
      } catch (err) {
        console.error("Error fetching category schemes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [category]);

  const translatedCategory = translations[lang][category.toLowerCase()] || category;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-gray-800 capitalize">
          {translatedCategory} {t.schemesUnder}
        </h2>
        <p className="text-gray-500 mt-2">
          {t.browseUnder} {translatedCategory} {t.categoryLabel}
        </p>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : schemes.length === 0 ? (
          
          /* Empty State */
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">
              {t.noSchemesAvailable}
            </h3>
            <p className="text-gray-500 mt-2">
              {t.noSchemesCategory}
            </p>
          </div>

        ) : (
          
          /* Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

        )}
      </div>

    </div>
  );
}
