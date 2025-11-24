import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, X, Shield, Code, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, settingsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/projects'),
        axios.get('http://localhost:8000/api/settings')
      ]);

      const filtered = projectsRes.data.filter(p => !p.isService);
      setProjects(filtered.reverse());
      setAbout(settingsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Veriler yüklenemedi:", err);
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(projects.map(p => p.category))];
  
  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse text-red-500">YÜKLENİYOR...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="animate-fade-in">
            {/* Dinamik Başlık */}
            <h1 className="font-black text-6xl sm:text-8xl lg:text-9xl uppercase tracking-tighter mb-6 leading-none">
              {about?.title ? about.title.split(' ')[0] : 'VENDETTA'}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
                {about?.title ? about.title.split(' ').slice(1).join(' ') : 'SECURITY'}
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed border-l-2 border-red-600 pl-6 text-left italic">
              {about?.bio || "Veritabanından biyografi bekleniyor..."}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {about?.skills && about.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-900/10 transition-all"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="py-16 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs font-bold uppercase tracking-wider mb-6">
                <Shield size={14} /> Güvenlik Çözümü
              </div>
              <h2 className="font-black text-4xl sm:text-5xl uppercase tracking-tighter mb-4">
                Vendetta <span className="text-red-600">Security</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Roblox script şifreleme ve güvenlik çözümü. Kodlarınızı güvenli bir şekilde koruyun ve şifreleyin.
              </p>
              <Link
                to="/vendetta-security"
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-red-700 transition-all hover:gap-4"
              >
                Detayları Gör
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Shield className="w-48 h-48 text-white relative z-10 drop-shadow-2xl" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <h2 className="font-black text-4xl sm:text-5xl uppercase tracking-tighter mb-2">
                Projeler
                </h2>
                <div className="h-1 w-20 bg-red-600"></div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all border ${
                    selectedCategory === cat
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-500 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'Tümü' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group bg-zinc-900/20 border border-white/5 rounded-md overflow-hidden hover:border-red-500/30 transition-all duration-300"
              >
                {project.videoId ? (
                  <div className="relative aspect-video bg-zinc-900 cursor-pointer overflow-hidden" onClick={() => setSelectedVideoId(project.videoId)}>
                    <img
                      src={`https://img.youtube.com/vi/${project.videoId}/maxresdefault.jpg`}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        className="w-16 h-16 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform"
                      >
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ) : (
                    <div className="aspect-video bg-zinc-900 flex items-center justify-center border-b border-white/5">
                        <Code className="w-12 h-12 text-gray-700" />
                    </div>
                )}
                
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {project.category}
                    </span>
                    {project.featured && (
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Öne Çıkan
                        </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* VIDEO MODAL */}
      {selectedVideoId && (
        <div 
          onClick={() => setSelectedVideoId(null)}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm p-4"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="w-full max-w-5xl aspect-video relative bg-black rounded-md shadow-2xl border border-white/10"
          >
            <button 
                onClick={() => setSelectedVideoId(null)} 
                className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors flex items-center gap-2 font-mono uppercase text-sm tracking-wider"
            >
                Kapat <X size={24} />
            </button>
            <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&rel=0`}
                title="Video"
                className="w-full h-full rounded-md"
                allow="autoplay; encrypted-media"
                allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;