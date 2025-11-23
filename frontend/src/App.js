import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import VendettaSecurity from "./pages/VendettaSecurity";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar 
          isAuthenticated={!!user} 
          isAdmin={user?.role === 'admin'} 
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendetta-security" element={<VendettaSecurity />} />
          <Route 
            path="/testimonials" 
            element={
              <Testimonials 
                isAuthenticated={!!user} 
                isCustomer={user?.isCustomer} 
              />
            } 
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={<Admin isAdmin={user?.role === 'admin'} />} 
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
