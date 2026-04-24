import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExpiryModal({ isOpen, onClose, t }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 mb-8 mx-auto">
          <Clock size={32} />
        </div>
        <h3 className="text-3xl font-black text-gray-900 text-center mb-4 tracking-tighter">
          {t.sessionExpired}
        </h3>
        <p className="text-gray-500 text-center font-medium leading-relaxed mb-10">
          {t.sessionExpiredDesc}
        </p>
        <button
          onClick={() => {
            onClose();
            navigate("/");
          }}
          className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:shadow-xl transition-all"
        >
          {t.backToHome}
        </button>
      </div>
    </div>
  );
}
