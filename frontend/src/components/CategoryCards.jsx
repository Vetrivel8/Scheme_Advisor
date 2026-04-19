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
  { name: "Agriculture", icon: Sprout, color: "text-secondary", bg: "bg-secondary-container" },
  { name: "Education", icon: GraduationCap, color: "text-primary", bg: "bg-primary-container" },
  { name: "Women", icon: User, color: "text-tertiary", bg: "bg-tertiary-container" },
  { name: "Employment", icon: Briefcase, color: "text-primary", bg: "bg-primary-fixed" },
  { name: "Health", icon: HeartPulse, color: "text-error", bg: "bg-error-container" },
  { name: "Social Welfare", icon: HandHeart, color: "text-secondary", bg: "bg-secondary-fixed" },
];

export default function CategoryCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((cat) => {
        const Icon = cat.icon;

        return (
          <div
            key={cat.name}
            onClick={() => navigate(`/category/${cat.name}`)}
            className="card-tonal flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            {/* Icon Circle */}
            <div
              className={`w-16 h-16 flex items-center justify-center 
                         rounded-2xl ${cat.bg} ${cat.color}
                         group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              <Icon size={28} />
            </div>

            {/* Title */}
            <h3 className="mt-6 text-sm font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
              {cat.name}
            </h3>
            
            <div className="mt-2 w-0 group-hover:w-8 h-1 bg-primary/20 rounded-full transition-all duration-500" />
          </div>
        );
      })}
    </div>
  );
}

