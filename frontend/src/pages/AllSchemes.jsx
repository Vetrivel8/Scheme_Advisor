import { useEffect, useState } from "react";
import SchemeCard from "../components/SchemeCard";
import axios from "../api/axios";
import { Search, Filter } from "lucide-react";

export default function AllSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/schemes?t=${Date.now()}`);
        setSchemes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = schemes.filter(s => 
    s.title.en.toLowerCase().includes(search.toLowerCase()) ||
    s.category.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-surface-bright px-8 py-16">
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="display-sm text-primary mb-4 tracking-tighter">
              The Complete <span className="text-secondary italic">Registry</span>
            </h2>
            <p className="text-on-surface-variant max-w-xl leading-relaxed">
              Explore every government scheme currently defined in our database, 
              from rural employment to digital internships.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or category..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           </div>
        ) : filtered.length === 0 ? (
          <div className="card-tonal p-20 text-center">
            <h3 className="text-xl font-bold">No results for "{search}"</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(s => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
