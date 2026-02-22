import { Link } from "react-router-dom";
import { FileText, CheckCircle } from "lucide-react";

export default function SchemeCard({ scheme }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 
                    shadow-sm hover:shadow-xl transition-all duration-300 
                    hover:-translate-y-1">

      {/* Scheme Title */}
      <h3 className="text-xl font-semibold text-gray-800">
        {scheme.name}
      </h3>

      {/* Description */}
      <p className="mt-2 text-gray-600 text-sm leading-relaxed">
        {scheme.desc}
      </p>

      {/* Why Eligible Section */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Why Eligible:
        </p>

        <div className="flex flex-wrap gap-2">
          {scheme.why.map((item, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-3 py-1 text-xs 
                         bg-green-50 text-green-700 rounded-full"
            >
              <CheckCircle size={14} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Documents Section */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Required Documents:
        </p>

        <ul className="space-y-1 text-sm text-gray-600">
          {scheme.docs.map((doc, index) => (
            <li key={index} className="flex items-center gap-2">
              <FileText size={14} className="text-gray-400" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="mt-6">
        <Link to={`/scheme/${scheme.id}`}>
          <button
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium 
                       rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
