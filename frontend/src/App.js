import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import VendettaSecurity from "./pages/VendettaSecurity";
import UserSettings from "./pages/UserSettings";
import { ToastProvider } from "./context/ToastContext";

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar isAuthenticated={!!user} isAdmin={user?.role === 'admin'} onLogout={onLogout} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.sub,
          role: payload.role,
          isCustomer: payload.isCustomer
        });
      } catch (e) { localStorage.removeItem('token'); }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) return null;

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout user={user} onLogout={handleLogout}><Home /></Layout>} />
          <Route path="/vendetta-security" element={<Layout user={user} onLogout={handleLogout}><VendettaSecurity /></Layout>} />
          <Route path="/testimonials" element={<Layout user={user} onLogout={handleLogout}><Testimonials isAuthenticated={!!user} isCustomer={user?.isCustomer} /></Layout>} />
          <Route path="/contact" element={<Layout user={user} onLogout={handleLogout}><Contact /></Layout>} />
          <Route path="/settings" element={<Layout user={user} onLogout={handleLogout}><UserSettings /></Layout>} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;