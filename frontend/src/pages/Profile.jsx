import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  User, 
  Bookmark, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Bell, 
  ChevronRight, 
  Trash2,
  LogOut,
  LayoutDashboard,
  MessageCircle,
  AlertCircle,
  Home,
  Users,
  Activity
} from "lucide-react";
import axios from "../api/axios";
import { addNotification } from "../utils/notifications";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "overview";

  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [history, setHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [lastSaved, setLastSaved] = useState(Date.now());

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    const dataToSave = {
      ...editForm,
      timestamp: Date.now()
    };
    localStorage.setItem("userData", JSON.stringify(dataToSave));
    setProfileData(editForm);
    setIsEditing(false);
    addNotification('success', 'Profile Restructured', 'Your Dossier has been updated successfully from the primary source.');
    setLastSaved(Date.now());
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const stored = JSON.parse(localStorage.getItem("userData") || "{}");
    const storedSaved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
    const storedHistory = JSON.parse(localStorage.getItem("viewHistory") || "[]");
    
    // Load permanent profile details
    const profile = stored.data || (stored.age ? stored : null);

    // Simple mock data for tracking
    const mockApps = [
      { id: 1, name: "PM Kisan Scheme", status: "Under Review", date: "12 Oct 2023", color: "blue" },
      { id: 2, name: "Student Scholarship", status: "Approved", date: "05 Sept 2023", color: "green" }
    ];

    setUser(userData);
    setProfileData(profile);
    setSavedSchemes(storedSaved);
    setHistory(storedHistory);
    setApplications(mockApps);

    const fetchSchemes = async () => {
      try {
        const res = await axios.get("/schemes");
        setAllSchemes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();

    const loadNotifs = () => {
      const stored = JSON.parse(localStorage.getItem("userNotifications") || "[]");
      setNotifications(stored);
    };
    loadNotifs();
    window.addEventListener("notificationsUpdated", loadNotifs);
    return () => window.removeEventListener("notificationsUpdated", loadNotifs);
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "My Overview", icon: LayoutDashboard },
    { id: "details", label: "My Details", icon: User },
    { id: "saved", label: "Saved Schemes", icon: Bookmark },
    { id: "tracking", label: "Track Application", icon: Briefcase },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const recommended = allSchemes.filter(s => {
    if (!profileData) return false;
    
    // 1. Age Check
    const uAge = parseInt(profileData.age);
    if (!isNaN(uAge)) {
      if ((s.minAge !== null && uAge < s.minAge) || (s.maxAge !== null && uAge > s.maxAge)) return false;
    }

    // 2. Income Check
    const uIncome = parseInt(profileData.income);
    if (!isNaN(uIncome) && s.maxIncome !== null && uIncome > s.maxIncome) return false;

    // 3. Occupation / Category Mapping
    const occValue = String(profileData.occupation || "").toLowerCase().trim();
    if (!occValue) return true; // Show general if no occupation

    const cats = (Array.isArray(s.category) ? s.category : [s.category]).map(c => String(c).toLowerCase().trim());
    const tags = (Array.isArray(s.tags) ? s.tags : []).map(t => String(t).toLowerCase().trim());
    
    const occMapping = {
      "farmer": "agriculture",
      "student": "education",
      "woman": "women",
      "elderly": "social welfare",
      "employee": "employment"
    };
    const mappedCat = (occMapping[occValue] || occValue);

    return cats.includes(mappedCat) || tags.includes(occValue) || cats.includes("social welfare");
  }).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Welcome Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Namaste, {user?.name}!</h1>
              <p className="text-sm text-gray-500">Welcome to your scheme advisor portal.</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Simple Side Navigation */}
        <nav className="lg:col-span-3 flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(`/profile?tab=${tab.id}`)}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Profile Summary & Strategy */}
              <div className="bg-gradient-to-r from-primary to-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-blue-100">Profile Intelligence Summary</h2>
                  <p className="text-2xl font-bold mb-4 leading-tight">
                    {profileData 
                      ? `Based on your ${profileData.occupation} profile in ${profileData.location}, you are optimized for ${recommended.length}+ key national schemes.`
                      : "Complete your profile to unlock personalized scheme strategies."}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-blue-100">Saved Schemes</p>
                      <p className="text-lg font-black">{savedSchemes.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-blue-100">Live Applications</p>
                      <p className="text-lg font-black">{applications.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-blue-100">Required Docs</p>
                      <p className="text-lg font-black">3 Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Detailed Information Overview */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                      <User size={20} className="text-primary" /> Identity Overview
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    <InfoBlock icon={Calendar} label="Age Profile" value={profileData?.age ? `${profileData.age} Years` : "N/A"} />
                    <InfoBlock icon={IndianRupee} label="Income Bracket" value={profileData?.income ? `₹${profileData.income}` : "N/A"} />
                    <InfoBlock icon={Briefcase} label="Current Role" value={profileData?.occupation || "N/A"} />
                    <InfoBlock icon={MapPin} label="Geographics" value={profileData?.location || "N/A"} />
                    <InfoBlock icon={Home} label="Resident Type" value={profileData?.residence || "N/A"} />
                    <InfoBlock icon={Users} label="Social Category" value={profileData?.category || "N/A"} />
                  </div>
                </div>

                {/* Chatbot Scheme Suggestions */}
                <div 
                  onClick={() => document.getElementById('chatbot-toggle')?.click()} 
                  className="group relative bg-white p-8 rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <MessageCircle size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">Scheme Assistant</h2>
                    <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                      Get instant personalized scheme suggestions based on your profile details. Our AI analyzes your eligibility in real-time.
                    </p>
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-xl border border-gray-100 text-xs font-black text-primary uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                      Activate Assistant <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Schemes For You Section */}
              <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
                    <CheckCircle2 size={20} className="text-green-500" /> Schemes Tailored For You
                  </h2>
                  <Link to="/results" className="text-sm font-bold text-primary hover:underline">Explore More Matches</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommended.map(s => (
                    <div key={s.id} onClick={() => navigate(`/scheme/${s.id}`)} className="p-6 bg-surface-container-low rounded-2xl border border-transparent hover:border-primary/40 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                        <FileText size={16} />
                      </div>
                      <h3 className="font-extrabold text-gray-900 group-hover:text-primary mb-2 line-clamp-1">{s.title.en}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 font-medium mb-6 leading-relaxed">{s.benefits.en}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Learn More</span>
                        <ChevronRight size={14} className="text-primary translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                      </div>
                    </div>
                  ))}
                  {recommended.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 font-bold mb-4">No specific matches discovered for your current dossier.</p>
                      <button 
                        onClick={() => navigate('/profile?tab=details')}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all inline-block"
                      >
                        Populate My Dossier
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Simple Notifications & History List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Bell size={16} /> Recent Updates
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium text-center py-8">No recent activity found.</p>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="flex gap-4">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500">{n.message}</p>
                            <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase">{new Date(n.time).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={16} /> Recently Viewed
                  </h3>
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 divide-y divide-gray-50">
                    {allSchemes.filter(s => history.includes(s.id)).slice(0, 3).map(s => (
                      <div key={s.id} onClick={() => navigate(`/scheme/${s.id}`)} className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                        <span className="text-sm font-medium text-gray-700 truncate pr-4">{s.title.en}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </div>
                    ))}
                    {history.length === 0 && <p className="p-6 text-gray-400 text-sm text-center">Empty</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="bg-white p-10 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">My Full Profile Dossier</h2>
                  {!isEditing ? (
                    <button 
                      onClick={() => {
                        setEditForm(profileData || {});
                        setIsEditing(true);
                      }}
                      className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                    >
                      Edit Dossier
                    </button>
                  ) : (
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        className="px-6 py-2.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <EditInput label="Current Occupation / Job" name="occupation" value={editForm.occupation} onChange={handleEditChange} />
                      <EditInput label="Physical Geography / Location" name="location" value={editForm.location} onChange={handleEditChange} />
                      <EditInput label="Residence Type (Urban/Rural)" name="residence" value={editForm.residence} onChange={handleEditChange} />
                    </div>
                    <div className="space-y-4">
                      <EditInput label="Current Age" name="age" type="number" value={editForm.age} onChange={handleEditChange} />
                      <EditInput label="Annual Income Bracket (₹)" name="income" type="number" value={editForm.income} onChange={handleEditChange} />
                      <EditInput label="Social Category (General/OBC/SC/ST)" name="category" value={editForm.category} onChange={handleEditChange} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                      <DetailItem label="Account Name" value={user?.name} icon={User} />
                      <DetailItem label="Primary Email" value={user?.email} icon={FileText} />
                      <DetailItem label="Social Category" value={profileData?.category || "Not Specified"} icon={Users} />
                      <DetailItem label="System Role" value={profileData?.occupation || "Not Specified"} icon={Briefcase} />
                    </div>
                    <div className="space-y-10">
                      <DetailItem label="Geography" value={`${profileData?.location || "Not Specified"} (${profileData?.residence || "N/A"})`} icon={MapPin} />
                      <DetailItem label="Economic Bracket" value={profileData?.income ? `₹${profileData.income} / Year` : "N/A"} icon={IndianRupee} />
                      <DetailItem label="Age Maturity" value={profileData?.age ? `${profileData.age} Years` : "N/A"} icon={Calendar} />
                      <DetailItem label="Account Created" value="April 19, 2026" icon={Clock} />
                    </div>
                  </div>
                )}

                <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Knowledge Management</h4>
                    <p className="text-xs text-gray-500 font-medium italic">You have {savedSchemes.length} schemes bookmarked for quick access.</p>
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-lg">
                    Primary Data Source: Profile Dossier
                  </div>
                </div>
              </div>

              {/* Saved Schemes Mini-Section within Details as requested */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Saved Schemes Quicklink</h3>
                {savedSchemes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {allSchemes.filter(s => savedSchemes.includes(s.id)).slice(0, 5).map(s => (
                      <Link 
                        key={s.id} 
                        to={`/scheme/${s.id}`}
                        className="px-4 py-2 bg-surface-container-low border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-primary/5 hover:text-primary transition-all"
                      >
                        {s.title.en}
                      </Link>
                    ))}
                    {savedSchemes.length > 5 && (
                      <button onClick={() => navigate('/profile?tab=saved')} className="text-xs font-black text-primary hover:underline">+{savedSchemes.length - 5} More</button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No bookmarks found in this section.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. Saved Tab */}
          {activeTab === 'saved' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">My Secure Vault</h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <Bookmark size={16} className="text-primary" />
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{savedSchemes.length} Total Saved</span>
                  </div>
               </div>

               <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-100">
                  {savedSchemes.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bookmark size={32} className="text-gray-200" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Vault is empty</h3>
                      <p className="text-gray-400 font-medium mb-8">You haven't saved any schemes to your profile yet.</p>
                      <Link to="/" className="px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-xl transition-all inline-block">Explore Schemes</Link>
                    </div>
                  ) : (
                    allSchemes.filter(s => savedSchemes.includes(s.id)).map(s => (
                      <div key={s.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/50 transition-all group">
                        <div className="mb-4 md:mb-0">
                          <h4 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors mb-1">{s.title.en}</h4>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" /> {s.department.en || "Central Government"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => navigate(`/scheme/${s.id}`)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-all">View Entry</button>
                          <button 
                            onClick={() => {
                              addNotification('success', 'Application Started', `You initiated an application for ${s.title.en}.`);
                              if (s.link) window.open(s.link, '_blank');
                            }}
                            className="px-5 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg hover:shadow-lg shadow-primary/20 transition-all hover:scale-105"
                          >
                            Proceed to Apply
                          </button>
                          <button 
                            onClick={() => {
                              const saved = JSON.parse(localStorage.getItem("savedSchemes") || "[]");
                              const updated = saved.filter(id => id !== s.id);
                              localStorage.setItem("savedSchemes", JSON.stringify(updated));
                              window.location.reload();
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            title="Remove Bookmark"
                          >
                            <Trash2 size={20}/>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>

               {/* Recently Viewed Items Section */}
               <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-primary" /> Recently Interacted
                  </h3>
                  {history.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allSchemes.filter(s => history.includes(s.id)).slice(0, 3).map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => navigate(`/scheme/${s.id}`)}
                          className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary transition-all cursor-pointer group"
                        >
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Viewed Recently</p>
                          <h4 className="font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-primary">{s.title.en}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 font-medium italic">Your interaction history will appear here.</p>
                  )}
               </div>
            </div>
          )}

          {/* 4. Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Application Control Center</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Activity size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
                </div>
              </div>
              
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment Scheme</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Filing Date</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Status</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Metrics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applications.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-10 py-8 font-black text-gray-900">{app.name}</td>
                          <td className="px-10 py-8 text-xs font-bold text-gray-500 uppercase">{app.date}</td>
                          <td className="px-10 py-8">
                             <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                               {app.status === 'Approved' ? <CheckCircle2 size={12}/> : <Clock size={12}/>} {app.status}
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <button className="px-4 py-2 bg-white border border-gray-100 text-primary font-black text-[10px] uppercase tracking-widest rounded-lg hover:border-primary transition-all">Detailed Log</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Document Repository */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white p-10 rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-3">
                      <FileText size={20} className="text-primary" /> Compliance Repository
                    </h3>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Batch Upload</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocCard title="National ID (Aadhaar)" status="verified" date="Oct 2023" />
                    <DocCard title="Fiscal Earnings Cert" status="verified" date="Nov 2023" />
                    <DocCard title="Educational Credentials" status="pending" date="Processing" />
                    <DocCard title="Residence Verification" status="missing" date="Action Required" />
                  </div>
                </div>

                <div className="lg:col-span-4 bg-gray-900 p-10 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                   <div>
                    <AlertCircle size={32} className="text-primary mb-6" />
                    <h3 className="text-2xl font-black mb-4 leading-tight uppercase tracking-tighter">Diagnostic Analytics</h3>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed mb-8">Your profile currently meets 85% of documentation requirements for top-tier schemes.</p>
                   </div>
                   <button className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] transition-all">
                      Run Smart Health Check
                   </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Support Components
function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{label}</p>
        <p className="font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.1em] mb-0.5">{label}</p>
        <p className="text-lg font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DocCard({ title, status, date }) {
  const styles = {
    verified: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: CheckCircle2, label: 'Verified' },
    pending: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: Clock, label: 'Pending' },
    missing: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', icon: AlertCircle, label: 'Missing' }
  };
  const s = styles[status];
  return (
    <div className={`p-4 rounded-2xl border ${s.bg} ${s.border} flex items-center justify-between transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <s.icon size={18} className={s.text} />
        <div>
          <p className="text-xs font-black text-gray-800">{title}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">{date}</p>
        </div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${s.text}`}>{s.label}</span>
    </div>
  );
}

function EditInput({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-800 focus:bg-white focus:border-primary/50 outline-none transition-all"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
