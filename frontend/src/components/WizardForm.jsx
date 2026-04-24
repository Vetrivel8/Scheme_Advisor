import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Home, 
  Users, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Mic,
  MicOff
} from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { translations } from "../utils/translations";
import ExpiryModal from "./ExpiryModal";

export default function WizardForm() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = translations[lang];

  const SESSION_EXPIRY = 2 * 60 * 1000;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [timeLeft, setTimeLeft] = useState(SESSION_EXPIRY);
  const [sessionStartTime, setSessionStartTime] = useState(() => {
    const draftData = JSON.parse(localStorage.getItem("wizardDraft") || "null");
    return draftData?.startTime || Date.now();
  });

  const [form, setForm] = useState(() => {
    const draftData = JSON.parse(localStorage.getItem("wizardDraft") || "null");
    const savedData = JSON.parse(localStorage.getItem("userData") || "{}");
    
    const isExpired = draftData && (Date.now() - draftData.startTime >= SESSION_EXPIRY);
    const draft = (draftData && !isExpired) ? draftData.data : null;
    
    if (isExpired) return {
      name: user.name || "",
      age: "", income: "", occupation: "", location: "", residence: "", category: "",
    };

    const initialData = draft || (savedData.age ? savedData : {});

    return {
      name: user.name || "",
      age: initialData.age || "",
      income: initialData.income || "",
      occupation: initialData.occupation || "",
      location: initialData.location || "",
      residence: initialData.residence || "",
      category: initialData.category || "",
    };
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const magicInput = document.getElementById('magicInput');
        if (magicInput) {
          magicInput.value = transcript;
          extractData(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  const extractData = (text) => {
    const extracted = {
      age: text.match(/\b(100|[1-9]\d?)\b/)?.[0] || "",
      income: text.match(/\b(\d+(?:\.\d+)?)\s*(?:lakh|L|k|K|thousand)\b/i)?.[0] || text.match(/\b\d{4,}\b/)?.[0] || "",
      occupation: ["farmer", "student", "employee", "woman", "elderly"].find(o => text.toLowerCase().includes(o)) || ""
    };
    
    if (extracted.income.toLowerCase().includes('lakh')) {
      extracted.income = (parseFloat(extracted.income) * 100000).toString();
    }

    setForm(prev => ({ 
      ...prev, 
      ...extracted,
      occupation: extracted.occupation ? extracted.occupation.charAt(0).toUpperCase() + extracted.occupation.slice(1) : prev.occupation
    }));
  };

  const resetSession = () => {
    console.log("Wizard: Session expired. Clearing all fields.");
    
    // 1. Clear Storage
    localStorage.removeItem("wizardDraft");
    localStorage.removeItem("filtrationData");
    
    // 2. Clear Form State aggressively
    const emptyForm = {
      name: user.name || "",
      age: "",
      income: "",
      occupation: "",
      location: "",
      residence: "",
      category: "",
    };
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    
    // 3. Restart timer state
    const now = Date.now();
    setSessionStartTime(now);
    setTimeLeft(SESSION_EXPIRY);
    
    // 4. Update storage with fresh empty draft
    localStorage.setItem("wizardDraft", JSON.stringify({
      data: emptyForm,
      startTime: now,
      timestamp: now
    }));

    setShowExpiryModal(true);
  };

  useEffect(() => {
    // Only initialize if we don't have a valid session in localStorage
    const draftData = JSON.parse(localStorage.getItem("wizardDraft") || "null");
    if (!draftData || !draftData.startTime) {
      localStorage.setItem("wizardDraft", JSON.stringify({
        data: form,
        startTime: sessionStartTime,
        timestamp: Date.now()
      }));
    }

    const timer = setInterval(() => {
      const elapsed = Date.now() - sessionStartTime;
      const remaining = Math.max(0, SESSION_EXPIRY - elapsed);
      
      // Update time left
      setTimeLeft(remaining);

      // Trigger expiry
      if (elapsed >= SESSION_EXPIRY) {
        console.warn("Wizard: Time limit reached.");
        clearInterval(timer);
        resetSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  useEffect(() => {
    // Only save if there is data or interaction
    const draftData = JSON.parse(localStorage.getItem("wizardDraft") || "{}");
    if (Object.keys(form).some(k => form[k] !== "")) {
      localStorage.setItem("wizardDraft", JSON.stringify({
        ...draftData,
        data: form,
        timestamp: Date.now()
      }));
    }
  }, [form]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "age") {
      if (!value) error = t.ageRequired;
      else if (isNaN(value)) error = t.ageInvalid;
      else if (Number(value) < 1 || Number(value) > 100) error = t.ageRange;
      else if (value.includes(".")) error = t.ageDecimal;
    }
    if (name === "income") {
      if (!value) error = t.incomeRequired;
      else if (isNaN(value)) error = t.incomeInvalid;
      else if (Number(value) < 0) error = t.incomeNegative;
      else if (value.includes(".")) error = t.incomeDecimal;
    }
    if (name === "occupation" && !value) error = t.occupationRequired;
    if (name === "location" && !value) error = t.locationRequired;
    if (name === "residence" && !value) error = t.residenceRequired;
    if (name === "category" && !value) error = t.categoryRequired;
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const submit = () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    localStorage.setItem("filtrationData", JSON.stringify({
      data: form,
      timestamp: Date.now()
    }));
    localStorage.removeItem("wizardDraft");
    navigate("/results");
  };

  return (
    <>
      <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gradient-to-br from-surface to-surface-container">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 md:p-12 transition-all duration-500 overflow-hidden relative">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                  <User size={14} /> {t.personalizeDiscovery}
                </div>
                
                {/* Session Timer Badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors duration-500 ${timeLeft < 30000 ? 'bg-error/10 text-error animate-pulse' : 'bg-secondary/10 text-secondary'}`}>
                  <Clock size={14} />
                  <span>{t.sessionExpiresIn || 'Session expires in'}: {Math.floor(timeLeft / 60000)}:{(Math.floor(timeLeft / 1000) % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4 leading-tight">
                {t.tellUsAboutYou} <span className="text-primary">{t.aboutYou}</span>
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-md font-medium">
              {t.wizardDesc}
            </p>

            {/* Magic Fill (Level 2 AI) */}
            <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                <Sparkles size={16} /> {t.magicFill}
              </div>
              <textarea
                id="magicInput"
                placeholder={t.magicFillPlaceholder}
                className="w-full h-24 bg-white/50 border-2 border-transparent focus:border-primary/30 rounded-2xl p-4 text-sm font-medium outline-none transition-all resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const text = document.getElementById('magicInput').value;
                    extractData(text);
                  }}
                  className="px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all"
                >
                  {t.magicFill}
                </button>
                
                {/* Voice Input Button */}
                <button 
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all duration-300
                    ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Age */}
                <InputWrapper label={t.age} icon={User} error={errors.age} name="age">
                  <input
                    name="age"
                    type="number"
                    placeholder="e.g. 25"
                    value={form.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-4 bg-surface-container-low border-2 rounded-2xl
                               text-lg font-bold text-on-surface outline-none transition-all duration-300
                               ${errors.age ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary focus:bg-white'}
                               placeholder:text-on-surface-variant/30`}
                  />
                </InputWrapper>

                {/* Income */}
                <InputWrapper label={t.annualIncome} icon={IndianRupee} error={errors.income} name="income">
                  <input
                    name="income"
                    type="number"
                    placeholder="Enter amount"
                    value={form.income}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-6 py-4 bg-surface-container-low border-2 rounded-2xl
                               text-lg font-bold text-on-surface outline-none transition-all duration-300
                               ${errors.income ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary focus:bg-white'}
                               placeholder:text-on-surface-variant/30`}
                  />
                </InputWrapper>
              </div>

              {/* Occupation */}
              <InputWrapper label={t.occupation} icon={Briefcase} error={errors.occupation} name="occupation">
                <select
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-6 py-4 bg-surface-container-low border-2 rounded-2xl appearance-none cursor-pointer
                             text-lg font-bold text-on-surface outline-none transition-all duration-300
                             ${errors.occupation ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary focus:bg-white'}`}
                >
                  <option value="">{t.selectRole}</option>
                  <option value="Student">{t.student}</option>
                  <option value="Farmer">{t.farmer}</option>
                  <option value="Employee">{t.employee}</option>
                  <option value="Elderly">{t.elderly}</option>
                  <option value="Woman">{t.woman}</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  <ChevronRight size={20} className="rotate-90" />
                </div>
              </InputWrapper>

              {/* Location */}
              <InputWrapper label={t.location} icon={MapPin} error={errors.location} name="location">
                <input
                  name="location"
                  type="text"
                  placeholder={t.locationPlaceholder}
                  value={form.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-6 py-4 bg-surface-container-low border-2 rounded-2xl
                             text-lg font-bold text-on-surface outline-none transition-all duration-300
                             ${errors.location ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary focus:bg-white'}
                             placeholder:text-on-surface-variant/30`}
                />
              </InputWrapper>

              {/* Area of Residence */}
              <InputWrapper label={t.areaOfResidence} icon={Home} error={errors.residence} name="residence">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "Urban", label: t.urban },
                    { key: "Rural", label: t.rural }
                  ].map((area) => (
                    <label 
                      key={area.key}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold
                                 ${form.residence === area.key 
                                   ? 'bg-primary text-white border-primary border-b-4 translate-y-[-2px]' 
                                   : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-primary/30'}`}
                    >
                      <input
                        type="radio"
                        name="residence"
                        value={area.key}
                        checked={form.residence === area.key}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {area.label}
                      {form.residence === area.key && <CheckCircle2 size={18} />}
                    </label>
                  ))}
                </div>
              </InputWrapper>

              {/* Category */}
              <InputWrapper label={t.category} icon={Users} error={errors.category} name="category">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["General", "OBC", "PVTG", "SC", "ST", "DNT communities"].map((cat) => (
                    <label 
                      key={cat}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 text-sm transition-all cursor-pointer font-bold text-center
                                 ${form.category === cat 
                                   ? 'bg-secondary text-white border-secondary shadow-lg' 
                                   : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-white hover:border-secondary/30'}`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={form.category === cat}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </InputWrapper>

              {/* Error Message Summary */}
              {Object.keys(errors).some(k => errors[k] && touched[k]) && (
                <div className="p-4 bg-error-container/30 border border-error/10 rounded-2xl flex items-center gap-3 text-error text-sm font-bold">
                  <AlertCircle size={18} />
                  {t.correctErrors}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submit}
                className="group relative w-full py-6 bg-primary text-on-primary font-black text-xl
                           rounded-[2rem] shadow-2xl shadow-primary/20 
                           hover:scale-[1.02] active:scale-[0.98] 
                           transition-all duration-300 mt-8 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                <span className="flex items-center justify-center gap-2">
                  {t.findMySchemes} <ChevronRight size={24} />
                </span>
              </button>

            </div>
          </div>
        </div>
      </div>
        
      <ExpiryModal 
        isOpen={showExpiryModal} 
        onClose={() => setShowExpiryModal(false)} 
        t={t} 
      />
    </>
  );
}

const InputWrapper = ({ label, icon: Icon, error, children }) => (
  <div className="group space-y-2">
    <label className="flex items-center gap-2 text-sm font-bold text-on-surface-variant uppercase tracking-wider ml-1">
      {Icon && <Icon size={16} className="text-primary" />}
      {label}
    </label>
    <div className="relative">
      {children}
      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-error text-xs font-bold animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  </div>
);
