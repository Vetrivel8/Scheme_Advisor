import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white shadow-lg">

      {/* Top Section */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">

        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-wide hover:scale-105 transition-transform duration-300 cursor-pointer">
          | Scheme Advisor 
        </h1>

        {/* Links */}
        <div className="flex items-center gap-8 text-lg font-medium">
          <Link 
            to="/" 
            className="relative group transition duration-300"
          >
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link 
            to="/admin" 
            className="relative group transition duration-300"
          >
            Admin
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="relative overflow-hidden bg-blue-900 h-10 flex items-center">
        <div className="whitespace-nowrap animate-marquee text-sm font-medium tracking-wide">
          📢 Update: Agriculture & Employment schemes are now available — 
          Check eligibility before deadlines! 🌾💼
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>

    </nav>
  );
}
