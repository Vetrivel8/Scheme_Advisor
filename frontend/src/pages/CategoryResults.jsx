import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";

export default function CategoryResults() {
  const { category } = useParams();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h2 className="text-3xl font-bold text-gray-800 capitalize">
          {category} Schemes
        </h2>
        <p className="text-gray-500 mt-2">
          Browse government schemes available under the {category} category.
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
              No schemes available
            </h3>
            <p className="text-gray-500 mt-2">
              Currently there are no schemes under this category.
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
