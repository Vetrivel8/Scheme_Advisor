import { useParams } from "react-router-dom";
import schemes from "../data/scheme.json";
import SchemeCard from "../components/SchemeCard";

export default function CategoryResults() {
  const { category } = useParams();

  const filteredSchemes = schemes.filter(
    (s) => s.category.toLowerCase() === category.toLowerCase()
  );

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
        {filteredSchemes.length === 0 ? (
          
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
            {filteredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

        )}
      </div>

    </div>
  );
}
