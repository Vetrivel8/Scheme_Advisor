import { useState, useEffect } from "react";
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
  CheckCircle2
} from "lucide-react";

export default function WizardForm() {
  const navigate = useNavigate();

  const SESSION_EXPIRY = 2 * 60 * 1000;

  const [form, setForm] = useState(() => {
    const draftData = JSON.parse(localStorage.getItem("wizardDraft") || "null");
    const savedData = JSON.parse(localStorage.getItem("userData") || "{}");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    // Check expiry for draft
    const draft = (draftData && (Date.now() - draftData.timestamp < SESSION_EXPIRY)) ? draftData.data : null;
    // Check expiry for saved profile
    const saved = (savedData && savedData.timestamp && (Date.now() - savedData.timestamp < SESSION_EXPIRY)) ? savedData.data : (savedData.age ? savedData : null);

    const initialData = draft || saved || {};

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

  useEffect(() => {
    localStorage.setItem("wizardDraft", JSON.stringify({
      data: form,
      timestamp: Date.now()
    }));
  }, [form]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "age") {
      if (!value) error = "Age is required";
      else if (isNaN(value)) error = "Please enter a valid number";
      else if (Number(value) < 1 || Number(value) > 100) error = "Age must be between 1 and 100";
      else if (value.includes(".")) error = "Decimals are not allowed";
    }
    if (name === "income") {
      if (!value) error = "Income is required";
      else if (isNaN(value)) error = "Please enter a valid number";
      else if (Number(value) < 0) error = "Income cannot be negative";
      else if (value.includes(".")) error = "Decimals are not allowed";
    }
    if (name === "occupation" && !value) error = "Please select an occupation";
    if (name === "location" && !value) error = "Location is required";
    if (name === "residence" && !value) error = "Please select area of residence";
    if (name === "category" && !value) error = "Please select a category";
    
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
      
      // Scroll to first error
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
    <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gradient-to-br from-surface to-surface-container">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-primary/5 p-8 md:p-12 transition-all duration-500 overflow-hidden relative">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <User size={14} /> Personalize Discovery
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4 leading-tight">
              Tell Us <span className="text-primary">About You</span>
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-md font-medium">
              We personalize scheme discoveries based on your unique profile.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Age */}
              <InputWrapper label="Age" icon={User} error={errors.age} name="age">
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
              <InputWrapper label="Annual Income (₹)" icon={IndianRupee} error={errors.income} name="income">
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
            <InputWrapper label="Occupation" icon={Briefcase} error={errors.occupation} name="occupation">
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-6 py-4 bg-surface-container-low border-2 rounded-2xl appearance-none cursor-pointer
                           text-lg font-bold text-on-surface outline-none transition-all duration-300
                           ${errors.occupation ? 'border-error/50 focus:border-error' : 'border-transparent focus:border-primary focus:bg-white'}`}
              >
                <option value="">Select your role</option>
                <option value="Student">Student</option>
                <option value="Farmer">Farmer</option>
                <option value="Employee">Employee</option>
                <option value="Elderly">Elderly</option>
                <option value="Woman">Woman</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                <ChevronRight size={20} className="rotate-90" />
              </div>
            </InputWrapper>

            {/* Location */}
            <InputWrapper label="Location (District/City)" icon={MapPin} error={errors.location} name="location">
              <input
                name="location"
                type="text"
                placeholder="e.g. New Delhi"
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
            <InputWrapper label="Area of Residence" icon={Home} error={errors.residence} name="residence">
              <div className="grid grid-cols-2 gap-4">
                {["Urban", "Rural"].map((area) => (
                  <label 
                    key={area}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer font-bold
                               ${form.residence === area 
                                 ? 'bg-primary text-white border-primary border-b-4 translate-y-[-2px]' 
                                 : 'bg-surface-container-low text-on-surface-variant border-transparent hover:border-primary/30'}`}
                  >
                    <input
                      type="radio"
                      name="residence"
                      value={area}
                      checked={form.residence === area}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {area}
                    {form.residence === area && <CheckCircle2 size={18} />}
                  </label>
                ))}
              </div>
            </InputWrapper>

            {/* Category */}
            <InputWrapper label="Category (You belong to...)" icon={Users} error={errors.category} name="category">
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
                Please correct the errors above before continuing.
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
                Find My Schemes <ChevronRight size={24} />
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
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
