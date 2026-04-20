import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Bell, LogOut, Activity, Briefcase, ChevronDown, LayoutDashboard, Bookmark, Languages } from "lucide-react";
import { useLang } from "../context/LanguageContext";

export default function Navbar() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { lang, toggleLang } = useLang();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifs = () => {
      const stored = JSON.parse(localStorage.getItem("userNotifications") || "[]");
      setNotifications(stored);
    };
    
    loadNotifs();
    window.addEventListener("notificationsUpdated", loadNotifs);
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("notificationsUpdated", loadNotifs);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("userNotifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 text-gray-800 shadow-sm">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl leading-none">S</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">
            myScheme<span className="text-gray-400 font-medium">Advisor</span>
            <span className="ml-2 text-[8px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified DB</span>
          </h1>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8 text-sm font-semibold">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/schemes" className="hover:text-primary transition-colors">Browse All</Link>

          {!token ? (
            <div className="flex items-center gap-6 ml-4">
              <Link to="/login" className="text-gray-600 hover:text-primary uppercase tracking-widest text-[11px]">Log In</Link>
              <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-shadow shadow-md shadow-primary/10 uppercase tracking-widest text-[11px]">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                title={lang === "en" ? "Switch to Tamil" : "Switch to English"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-500 hover:text-primary"
              >
                <Languages size={15} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {lang === "en" ? "EN" : "தமிழ்"}
                </span>
              </button>

              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setNotifOpen(!notifOpen)}
                  className={`text-gray-400 hover:text-primary transition-colors p-2 relative rounded-full hover:bg-gray-50 ${notifOpen ? 'text-primary bg-primary/5' : ''}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="px-4 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-bold text-primary hover:underline">Mark all as read</button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <Bell size={32} className="mx-auto text-gray-100 mb-2" />
                          <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative ${!n.read ? 'bg-primary/5' : ''}`}>
                            {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
                            <p className="text-xs font-bold text-gray-800">{n.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">
                              {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <Link to="/profile?tab=activity" onClick={() => setNotifOpen(false)} className="block w-full py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 border-t border-gray-50">
                        View All Activity
                      </Link>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="font-black text-xs">{user.name?.[0].toUpperCase()}</span>
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile?tab=overview" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard size={14} /> My Overview
                    </Link>
                    <Link 
                      to="/profile?tab=details" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <User size={14} /> My Details
                    </Link>
                    <Link 
                      to="/profile?tab=saved" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <Bookmark size={14} /> Saved Schemes
                    </Link>
                    <Link 
                      to="/profile?tab=tracking" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      <Briefcase size={14} /> Track Application
                    </Link>
                    
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-gray-50 border-t border-gray-100 h-10 flex items-center overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400/80">
          <span className="mx-8">📢 New schemes for Agriculture updated</span>
          <span className="mx-8">⚡ Check your application status in 'My Applications'</span>
          <span className="mx-8">📢 New schemes for Agriculture updated</span>
        </div>
      </div>
    </nav>
  );
}


