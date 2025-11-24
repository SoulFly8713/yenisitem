import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, FileText, MessageSquare, Mail, Settings } from 'lucide-react';

const Navbar = ({ isAuthenticated, isAdmin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Aktif sayfa kontrolü
  const isActive = (path) => location.pathname === path;

  // Linkler için ortak stil
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link 
      to={to} 
      className={`relative group flex items-center gap-2 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
        isActive(to) ? 'text-red-500' : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
      <span className={`absolute bottom-0 left-0 h-0.5 bg-red-600 transition-all duration-300 ease-out ${
        isActive(to) ? 'w-full' : 'w-0 group-hover:w-full'
      }`}></span>
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO VE MARKA ALANI (ARTIK SABİT) */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <img 
              src="/vendetta-logo.png" 
              alt="Vendetta Store Logo" 
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105 rounded-md" 
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
            <span className="font-mono text-xl font-bold tracking-tighter text-white group-hover:text-red-500 transition-colors">
              VENDETTA STORE
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            
            <NavItem to="/" icon={FileText} label="PROJELER" />
            <NavItem to="/vendetta-security" icon={Shield} label="VENDETTA SECURİTY" />
            <NavItem to="/testimonials" icon={MessageSquare} label="YORUMLAR" />
            <NavItem to="/contact" icon={Mail} label="İLETİŞİM" />
            
            {/* AUTH ALANI */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-4 border-l border-white/10 pl-4">
                  
                  {/* Ayarlar Butonu */}
                  <Link 
                    to="/settings" 
                    className={`p-2 rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5 ${isActive('/settings') ? 'text-white bg-white/10' : ''}`}
                    title="Kullanıcı Ayarları"
                  >
                    <Settings size={20} />
                  </Link>

                  {/* Admin Paneli Butonu */}
                  {isAdmin && (
                    <Link to="/admin" className={`font-mono text-sm border border-yellow-500/50 text-yellow-500 px-4 py-2 rounded-md hover:bg-yellow-500/10 transition-all uppercase tracking-wider ${
                      isActive('/admin') ? 'bg-yellow-500/10' : ''
                    }`}>
                       ADMİN PANELİ
                    </Link>
                  )}
                   
                  {/* Çıkış Yap Butonu */}
                  <button onClick={onLogout} className="bg-red-600 text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-2">
                    <LogOut size={16} /> ÇIKIŞ YAP
                  </button>
                </div>
            ) : (
              <div className="ml-4 border-l border-white/10 pl-4">
                <Link to="/login" className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-md hover:bg-gray-200 transition-all">
                  GİRİŞ YAP
                </Link>
              </div>
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
        <div className="md:hidden bg-black border-t border-white/10 absolute w-full pb-4 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {[
              { path: '/', label: 'Projeler' },
              { path: '/vendetta-security', label: 'VENDETTA SECURİTY' },
              { path: '/testimonials', label: 'Yorumlar' },
              { path: '/contact', label: 'İletişim' },
              { path: '/settings', label: 'Hesap Ayarları' },
              ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel' }] : []),
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-bold uppercase tracking-wider p-3 rounded-md transition-colors ${
                  isActive(item.path) ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10'
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
                className="w-full text-left mt-4 px-3 py-3 text-sm font-bold uppercase tracking-wider text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/10"
              >
                ÇIKIŞ YAP
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block mt-4 px-3 py-3 text-sm font-bold uppercase tracking-wider bg-white text-black rounded-md hover:bg-gray-200"
              >
                GİRİŞ YAP
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;