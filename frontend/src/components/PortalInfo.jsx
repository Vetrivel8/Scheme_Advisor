import { useNavigate } from "react-router-dom";

export default function PortalInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6 py-12">
      
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-10 border border-gray-200">
        
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
          Government Scheme Advisor Portal
        </h1>

        {/* Description */}
        <p className="mt-4 text-gray-600 text-center leading-relaxed">
          Discover government schemes you are eligible for based on your 
          age, income, and occupation. Get transparent information and 
          required document details in one place.
        </p>

        {/* Feature List */}
        <ul className="mt-8 space-y-3 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✔</span>
            Central & State Government Schemes
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✔</span>
            Agriculture, Education, Women, Employment & Welfare
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✔</span>
            Simple eligibility-based discovery
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✔</span>
            Transparent information & required documents
          </li>
        </ul>

        {/* Note */}
        <p className="mt-8 text-sm text-gray-500 text-center">
          Start by filling the eligibility form or browse schemes by category.
        </p>

        {/* Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/wizard")}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
                       shadow-md hover:bg-blue-700 hover:shadow-lg
                       transition-all duration-300"
          >
            Get Started
          </button>
        </div>

      </div>
    </div>
  );
}
