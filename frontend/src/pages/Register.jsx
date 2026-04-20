import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setOtpSent(true);
      setMessage('OTP sent to your email. Please verify to continue.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      
      setMessage('Account verified successfully. Redirecting to log in...');
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 border border-blue-200 p-8 shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-blue-900">
            {otpSent ? 'Verify OTP' : 'Create an account'}
          </h2>
        </div>
        
        {error && <div className="text-red-500 text-sm font-semibold text-center mt-2">{error}</div>}
        {message && <div className="text-blue-600 text-sm font-semibold text-center mt-2">{message}</div>}

        {!otpSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-sm shadow-sm space-y-4">
              <div>
                <label className="sr-only">Name</label>
                <input
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-blue-300 placeholder-blue-400 text-blue-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="sr-only">Email address</label>
                <input
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-blue-300 placeholder-blue-400 text-blue-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="sr-only">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-blue-300 placeholder-blue-400 text-blue-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Register
              </button>
            </div>
            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800">
                Already have an account? Log in here.
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="rounded-sm shadow-sm space-y-4">
              <div>
                <label className="sr-only">OTP</label>
                <input
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-blue-300 placeholder-blue-400 text-blue-900 focus:outline-none focus:ring-blue-500 sm:text-sm text-center tracking-widest text-lg"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Verify & complete registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
