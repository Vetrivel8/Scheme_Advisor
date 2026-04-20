import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "ta" : "en";
    localStorage.setItem("lang", next);
    setLang(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
