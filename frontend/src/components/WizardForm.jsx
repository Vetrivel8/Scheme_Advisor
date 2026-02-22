import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WizardForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: "",
    income: "",
    occupation: "",
  });

  const submit = () => {
    if (!form.age || !form.income || !form.occupation) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem("userData", JSON.stringify(form));
    navigate("/results");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6 py-12">
      
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Tell Us About You
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          Provide basic details to find eligible government schemes.
        </p>

        {/* Form */}
        <div className="mt-8 space-y-5">

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              min="0"
              max="120"
              placeholder="Enter your age"
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         outline-none transition"
            />
          </div>

          {/* Income */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Income (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="Enter annual income"
              value={form.income}
              onChange={(e) =>
                setForm({ ...form, income: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         outline-none transition"
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <select
              value={form.occupation}
              onChange={(e) =>
                setForm({ ...form, occupation: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         outline-none transition bg-white"
            >
              <option value="">Select occupation</option>
              <option value="farmer">Farmer</option>
              <option value="student">Student</option>
              <option value="woman">Woman</option>
              <option value="elderly">Elderly</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={submit}
            className="w-full py-3 bg-blue-600 text-white font-semibold 
                       rounded-lg shadow-md hover:bg-blue-700 
                       hover:shadow-lg transition-all duration-300"
          >
            Find Schemes
          </button>

        </div>
      </div>
    </div>
  );
}
