import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Check if we have a redirect target in state, otherwise go to home or wizard
      // For this specific request, we'll try to go to wizard if they were coming from "Find Schemes"
      const from = location.state?.from || '/';
      window.location.href = from;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright flex flex-col justify-center items-center py-20 px-8">
      <div className="max-w-md w-full bg-surface-container-low rounded-[2.5rem] p-12 shadow-2xl shadow-primary/5 transition-all duration-700">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
             <span className="text-white font-black text-2xl leading-none">S</span>
          </div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tighter mb-2">
            Welcome Back
          </h2>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Resume your journey to discovered support.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-error-container text-on-error-container text-xs font-bold px-4 py-3 rounded-xl border border-error/10 animate-pulse">
            {error}
          </div>
        )}

        <form className="space-y-8" onSubmit={handleLogin}>
          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-[0.2em] ml-1 opacity-70">Email Access</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-surface-container-highest border-b-2 border-transparent
                           focus:border-primary focus:bg-white rounded-t-2xl
                           text-lg font-bold text-on-surface outline-none transition-all duration-300
                           placeholder:text-on-surface-variant/30"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="group">
              <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-[0.2em] ml-1 opacity-70">Identity Key</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-surface-container-highest border-b-2 border-transparent
                           focus:border-primary focus:bg-white rounded-t-2xl
                           text-lg font-bold text-on-surface outline-none transition-all duration-300
                           placeholder:text-on-surface-variant/30"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-5 bg-primary text-on-primary font-bold text-lg
                         rounded-[2rem] shadow-xl shadow-primary/20 
                         hover:scale-[1.02] active:scale-[0.98] 
                         transition-all duration-300"
            >
              Sign In
            </button>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/register" className="text-sm font-bold text-primary/70 hover:text-primary transition-colors tracking-wide underline underline-offset-8 decoration-primary/20">
              New explorer? Create an account here.
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

