import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-mono text-lg font-bold mb-4">SOULFLY871</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              
            </p>
          </div>

          <div>
            <h4 className="text-white font-mono text-sm uppercase tracking-wider mb-4">Sayfalar</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Projeler
                </Link>
              </li>
              <li>
                <Link to="/testimonials" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Yorumlar
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-mono text-sm uppercase tracking-wider mb-4">İletişim</h4>
            <p className="text-gray-400 text-sm">
              Discord: <span className="text-white">soulfly871</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Soulfly871. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;