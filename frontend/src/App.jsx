import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot"; // ✅ Import Chatbot

import Home from "./pages/Home";
import Wizard from "./pages/Wizard";
import Results from "./pages/Results";
import SchemeDetails from "./pages/SchemeDetails";
import Admin from "./pages/Admin";
import CategoryResults from "./pages/CategoryResults";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/scheme/:id" element={<SchemeDetails />} />
        <Route path="/category/:category" element={<CategoryResults />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* ✅ Add Chatbot HERE (outside Routes) */}
      <Chatbot />

    </BrowserRouter>
  );
}

export default App;
