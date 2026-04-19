import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Wizard from "./pages/Wizard";
import Results from "./pages/Results";
import SchemeDetails from "./pages/SchemeDetails";
import Admin from "./pages/Admin";
import CategoryResults from "./pages/CategoryResults";
import Profile from "./pages/Profile";
import AllSchemes from "./pages/AllSchemes";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/results" element={<Results />} />
        <Route path="/schema/:id" element={<SchemeDetails />} />
        <Route path="/scheme/:id" element={<SchemeDetails />} />
        <Route path="/category/:category" element={<CategoryResults />} />
        <Route path="/schemes" element={<AllSchemes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>


      {/* ✅ Add Chatbot HERE (outside Routes) */}
      <Chatbot />

    </BrowserRouter>
  );
}

export default App;
