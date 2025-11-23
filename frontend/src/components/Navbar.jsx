import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, FileText, MessageSquare, Mail } from 'lucide-react'; // ShoppingBag yerine Shield kullanabiliriz

const Navbar = ({ isAuthenticated, isAdmin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Aktif sayfa kontrolü
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO VE MARKA ALANI */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            {/* Logo Resmi (rounded-full yerine rounded-lg) */}
            <img 
              src="/vendetta-logo.png" 
              alt="Vendetta Security Logo" 
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105 rounded-lg" // Burayı değiştirdik
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            
            <span className="font-mono text-xl font-bold tracking-tighter text-white group-hover:text-red-500 transition-colors">
              VENDETTA STORE {/* Burayı değiştirdik */}
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Navigasyon Linkleri - Animasyonlu Çizgi Eklendi */}
            <Link to="/" className={`relative text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 pb-1 group ${
                isActive('/') ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText size={16} /> PROJELER
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transition-all duration-300 ${isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'}`}></span>
            </Link>
            
            <Link to="/vendetta-security" className={`relative text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 pb-1 group ${
                isActive('/vendetta-security') ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
               <Shield size={16} /> VENDETTA SECURİTY {/* ShoppingBag yerine Shield */}
               <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transition-all duration-300 ${isActive('/vendetta-security') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'}`}></span>
            </Link>
            
            <Link to="/testimonials" className={`relative text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 pb-1 group ${
                isActive('/testimonials') ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={16} /> YORUMLAR
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transition-all duration-300 ${isActive('/testimonials') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'}`}></span>
            </Link>
            
            <Link to="/contact" className={`relative text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 pb-1 group ${
                isActive('/contact') ? 'text-red-500' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail size={16} /> İLETİŞİM
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-red-500 transition-all duration-300 ${isActive('/contact') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'}`}></span>
            </Link>
            
            {/* AUTH ALANI (EKRANA UYGUN DÜZENLENDİ) */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                  {/* "GİRİŞ YAPILDI" kaldırıldı */}
                   
                  {isAdmin && (
                    <Link to="/admin" className={`font-mono text-sm border-2 px-3 py-2 rounded-lg transition-all ${
                      isActive('/admin') ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400' : 'bg-transparent border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10'
                     }`}>
                       ADMİN PANELİ
                    </Link>
                  )}
                   
                  <button onClick={onLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-red-700 transition-all flex items-center gap-1">
                    <LogOut size={16} /> ÇIKIŞ YAP
                  </button>
                </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-all">
                GİRİŞ YAP
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-gray-300 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 border-t border-white/10 absolute w-full pb-4">
          <div className="px-4 py-4 space-y-3">
            {[
              { path: '/', label: 'Projeler' },
              { path: '/vendetta-security', label: 'Vendetta Security' },
              { path: '/testimonials', label: 'Yorumlar' },
              { path: '/contact', label: 'İletişim' },
              ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel' }] : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-bold uppercase tracking-wider p-2 rounded-lg transition-colors ${
                  isActive(item.path) ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left mt-3 px-2 py-2 text-sm font-bold uppercase tracking-wider text-red-400 border border-red-400/20 rounded-lg hover:bg-red-500/10"
              >
                ÇIKIŞ YAP
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-left block mt-3 px-2 py-2 text-sm font-bold uppercase tracking-wider bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;