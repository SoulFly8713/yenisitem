import React from 'react';
import { MessageCircle, Shield, Code, Zap } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-mono text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4">
            İLETİŞİM
          </h1>
          <p className="text-gray-400 text-lg">
            Projeniz için benimle iletişime geçin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-white/20 transition-all">
            <MessageCircle className="w-12 h-12 mb-4 text-white" />
            <h3 className="font-mono text-xl font-bold mb-2">Discord</h3>
            <p className="text-gray-400 mb-4">En hızlı iletişim yolu.</p>
            <a
              href="https://discord.com/users/1028650548221706350"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-white text-black text-sm font-mono uppercase tracking-wider rounded-full hover:bg-gray-200 transition-all"
            >
              soulfly871
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-8 hover:border-white/20 transition-all">
            <Shield className="w-12 h-12 mb-4 text-white" />
            <h3 className="font-mono text-xl font-bold mb-2">Vendetta Security</h3>
            <p className="text-gray-400 mb-4">Kod şifreleme hizmetleri</p>
            <div className="text-white font-mono"></div>
            <a
              href="https://discord.gg/rFWUgKqnZu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-white text-black text-sm font-mono uppercase tracking-wider rounded-full hover:bg-gray-200 transition-all"
            >
              Discord
            </a>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-lg p-8 md:p-12">
          <h2 className="font-mono text-2xl font-bold mb-6">Hizmetlerim</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <Code className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-mono font-bold mb-1">Script Geliştirme</h4>
                <p className="text-gray-400 text-sm">Özel Lua script ve oyun mekaniği geliştirme</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-mono font-bold mb-1">Güvenlik Çözümleri</h4>
                <p className="text-gray-400 text-sm">Kod şifreleme ve koruma sistemleri</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-mono font-bold mb-1">NPC Sistemleri</h4>
                <p className="text-gray-400 text-sm">Yapay zeka destekli NPC geliştirme</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Code className="w-6 h-6 text-white flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-mono font-bold mb-1">Optimizasyon</h4>
                <p className="text-gray-400 text-sm">Performans iyileştirme ve hata giderme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;