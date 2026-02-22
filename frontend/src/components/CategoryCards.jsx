import { useNavigate } from "react-router-dom";
import {
  Sprout,
  GraduationCap,
  User,
  Briefcase,
  HeartPulse,
  HandHeart,
} from "lucide-react";

const categories = [
  { name: "Agriculture", icon: Sprout, color: "bg-green-100 text-green-600" },
  { name: "Education", icon: GraduationCap, color: "bg-blue-100 text-blue-600" },
  { name: "Women", icon: User, color: "bg-pink-100 text-pink-600" },
  { name: "Employment", icon: Briefcase, color: "bg-purple-100 text-purple-600" },
  { name: "Health", icon: HeartPulse, color: "bg-red-100 text-red-600" },
  { name: "Social Welfare", icon: HandHeart, color: "bg-orange-100 text-orange-600" },
];

export default function CategoryCards() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <div
              key={cat.name}
              onClick={() => navigate(`/category/${cat.name}`)}
              className="group cursor-pointer bg-white/70 backdrop-blur-md 
                         border border-gray-200 rounded-2xl p-6
                         flex flex-col items-center justify-center
                         shadow-sm hover:shadow-xl
                         hover:-translate-y-2
                         transition-all duration-300"
            >
              {/* Icon Circle */}
              <div
                className={`w-14 h-14 flex items-center justify-center 
                           rounded-full ${cat.color}
                           group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={26} />
              </div>

              {/* Title */}
              <h3 className="mt-4 text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                {cat.name}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
