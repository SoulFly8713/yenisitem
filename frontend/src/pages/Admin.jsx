import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, FileText, MessageSquare, Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  
  // Veritabanından gelecek veriler
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ title: '', bio: '', discord: '', skills: '' });
  
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Güvenlik ve Veri Çekme
  useEffect(() => {
    checkAuthAndFetchData();
  }, [navigate]);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    
    // 1. Admin Kontrolü
    if (!token) { navigate('/login'); return; }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') { navigate('/'); return; }
    } catch (e) { navigate('/login'); return; }

    // 2. Verileri Çek
    try {
        const [projRes, testRes, settRes, userRes] = await Promise.all([
            axios.get('http://localhost:8000/api/projects'),
            axios.get('http://localhost:8000/api/testimonials'),
            axios.get('http://localhost:8000/api/settings'),
            axios.get('http://localhost:8000/api/users')
        ]);

        setProjects(projRes.data);
        setTestimonials(testRes.data);
        setSettings({
            ...settRes.data,
            skills: settRes.data.skills ? settRes.data.skills.join(', ') : ''
        });
        setUsers(userRes.data);
        setLoading(false);
    } catch (err) {
        console.error("Veri çekme hatası:", err);
        setLoading(false);
    }
  };

  // --- PROJE İŞLEMLERİ ---

  const handleDeleteProject = async (id) => {
    if(window.confirm("Projeyi silmek istediğine emin misin?")) {
        try {
            await axios.delete(`http://localhost:8000/api/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
        } catch(err) { alert("Silinemedi."); }
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
        if (editingItem?.id) {
            await axios.put(`http://localhost:8000/api/projects/${editingItem.id}`, projectData);
            alert("Proje güncellendi!");
        } else {
            await axios.post('http://localhost:8000/api/projects', projectData);
            alert("Proje eklendi!");
        }
        checkAuthAndFetchData();
        setEditingItem(null);
        setShowAddForm(false);
    } catch (err) {
        alert("Kaydetme başarısız: " + err.message);
    }
  };

  // --- YORUM İŞLEMLERİ ---
  const handleDeleteTestimonial = async (id) => {
    if(window.confirm("Yorumu silmek istediğine emin misin?")) {
        try {
            await axios.delete(`http://localhost:8000/api/testimonials/${id}`);
            setTestimonials(testimonials.filter(t => t.id !== id));
        } catch(err) { alert("Silinemedi."); }
    }
  };

  // --- KULLANICI İŞLEMLERİ (DÜZELTİLDİ) ---

  const toggleCustomerStatus = async (user) => {
    try {
        const newStatus = !user.isCustomer;
        // API isteği atıyoruz
        await axios.put(`http://localhost:8000/api/users/${user.username}/status`, {
            isCustomer: newStatus
        });
        
        // Arayüzü hemen güncelliyoruz
        setUsers(users.map(u => 
            u.username === user.username ? { ...u, isCustomer: newStatus } : u
        ));
    } catch (err) {
        console.error(err);
        alert("Durum güncellenemedi. Sunucu hatası olabilir.");
    }
  };

  // --- AYAR İŞLEMLERİ ---
  const handleSaveSettings = async () => {
      try {
          const skillsArray = typeof settings.skills === 'string' 
            ? settings.skills.split(',').map(s => s.trim()) 
            : settings.skills;

          await axios.post('http://localhost:8000/api/settings', {
              ...settings,
              skills: skillsArray
          });
          alert("Ayarlar kaydedildi!");
      } catch (err) {
          alert("Ayarlar kaydedilemedi.");
      }
  };

  // --- FORM BİLEŞENİ ---
  const ProjectForm = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState(project || {
      title: '', description: '', videoUrl: '', videoId: '', category: '', featured: false, isService: false
    });

    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6 animate-in fade-in zoom-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Başlık</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Kategori</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" required />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Açıklama</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Video URL</label>
            <input type="text" value={formData.videoUrl || ''} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" placeholder="https://youtu.be/..." />
          </div>
          <div>
            <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Video ID</label>
            <input type="text" value={formData.videoId || ''} onChange={(e) => setFormData({ ...formData, videoId: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" />
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-white" />
            <span className="text-sm font-mono">Öne Çıkan</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={formData.isService} onChange={(e) => setFormData({ ...formData, isService: e.target.checked })} className="w-4 h-4 accent-white" />
            <span className="text-sm font-mono">Hizmet</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2 bg-white text-black text-sm font-mono uppercase rounded-full hover:bg-gray-200 transition-all flex items-center">
            <Save className="inline w-4 h-4 mr-2" /> Kaydet
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-transparent border border-white/20 text-white text-sm font-mono uppercase rounded-full hover:bg-white/10 transition-all flex items-center">
            <X className="inline w-4 h-4 mr-2" /> İptal
          </button>
        </div>
      </form>
    );
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono animate-pulse">VERİLER YÜKLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-mono text-4xl font-bold uppercase tracking-tight mb-2">Admin Paneli</h1>
            <p className="text-gray-400">Site içeriğini ve kullanıcıları yönetin</p>
          </div>
        </div>

        {/* Tab Menü */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-white/10 pb-6">
          {['projects', 'testimonials', 'users', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-mono uppercase tracking-wider rounded-full transition-all flex items-center ${
                activeTab === tab ? 'bg-white text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
              }`}
            >
              {tab === 'projects' && <FileText className="w-4 h-4 mr-2" />}
              {tab === 'testimonials' && <MessageSquare className="w-4 h-4 mr-2" />}
              {tab === 'users' && <Users className="w-4 h-4 mr-2" />}
              {tab === 'settings' && <Settings className="w-4 h-4 mr-2" />}
              {tab === 'projects' ? 'Projeler' : tab === 'testimonials' ? 'Yorumlar' : tab === 'users' ? 'Kullanıcılar' : 'Ayarlar'}
            </button>
          ))}
        </div>

        {/* --- İÇERİK ALANI --- */}

        {/* 1. PROJELER TABI */}
        {activeTab === 'projects' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-mono text-2xl font-bold">Mevcut Projeler</h2>
              <button
                onClick={() => { setShowAddForm(true); setEditingItem(null); }}
                className="px-6 py-2 bg-white text-black text-sm font-mono uppercase rounded-full hover:bg-gray-200 transition-all flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Yeni Proje
              </button>
            </div>

            {showAddForm && (
              <ProjectForm project={editingItem} onSave={handleSaveProject} onCancel={() => { setShowAddForm(false); setEditingItem(null); }} />
            )}

            <div className="space-y-4">
              {projects.length === 0 && <p className="text-gray-500">Hiç proje yok.</p>}
              {projects.map(project => (
                <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all">
                  {editingItem?.id === project.id ? (
                    <ProjectForm project={project} onSave={handleSaveProject} onCancel={() => setEditingItem(null)} />
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-mono text-lg font-bold">{project.title}</h3>
                            {project.featured && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-mono rounded border border-yellow-500/30">Öne Çıkan</span>}
                            {project.isService && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded border border-blue-500/30">Hizmet</span>}
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
                        <span className="px-3 py-1 bg-white/10 text-xs font-mono rounded-full text-gray-300">{project.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingItem(project)} className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-blue-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. YORUMLAR TABI */}
        {activeTab === 'testimonials' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-mono text-2xl font-bold mb-6">Müşteri Yorumları</h2>
            <div className="space-y-4">
              {testimonials.length === 0 && <p className="text-gray-500">Henüz yorum yapılmamış.</p>}
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="bg-white/5 border border-white/10 rounded-lg p-6 flex justify-between items-start hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono font-bold">{testimonial.author || "Anonim"}</h3>
                        <span className="text-xs text-yellow-500">★ {testimonial.rating}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">"{testimonial.content}"</p>
                    <p className="text-gray-600 text-xs">{testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('tr-TR') : ''}</p>
                  </div>
                  <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. KULLANICILAR TABI (DÜZELTİLDİ) */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-mono text-2xl font-bold mb-6">Kayıtlı Kullanıcılar</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id || user._id} className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-lg uppercase">
                        {user.username.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold">{user.username}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-mono rounded ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                            {user.role}
                        </span>
                        {user.isCustomer && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-mono rounded border border-green-500/30">Müşteri</span>}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleCustomerStatus(user)}
                    className={`w-full sm:w-auto px-4 py-2 text-xs font-mono uppercase rounded-full transition-all border ${
                        user.isCustomer
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                    }`}
                    >
                    {user.isCustomer ? 'Müşteriliği Kaldır' : 'Müşteri Yap'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. AYARLAR TABI */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-mono text-2xl font-bold mb-6">Genel Ayarlar</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Site Başlığı</label>
                <input type="text" value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Biyografi</label>
                <textarea value={settings.bio} onChange={(e) => setSettings({ ...settings, bio: e.target.value })} rows="4" className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Yetenekler (Virgülle ayırın)</label>
                <input type="text" value={settings.skills} onChange={(e) => setSettings({ ...settings, skills: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" placeholder="React, Python, Lua..." />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-mono uppercase tracking-wider mb-2 text-gray-400">Discord</label>
                <input type="text" value={settings.discord} onChange={(e) => setSettings({ ...settings, discord: e.target.value })} className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-white/50 outline-none" />
              </div>
              <button onClick={handleSaveSettings} className="px-6 py-2 bg-white text-black text-sm font-mono uppercase rounded-full hover:bg-gray-200 transition-all flex items-center">
                <Save className="inline w-4 h-4 mr-2" /> Kaydet
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;