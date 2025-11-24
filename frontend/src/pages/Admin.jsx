import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, FileText, MessageSquare, Users, Plus, Trash2, Edit2, Save, X, ArrowLeft, Box, Key, LogOut, ShieldCheck, Crown, CheckCircle, CreditCard, Code } from 'lucide-react';
import axios from 'axios';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({ title: '', bio: '', discord: '', skills: '' });
  
  const [selectedUserForVault, setSelectedUserForVault] = useState(null); 
  const [userVaults, setUserVaults] = useState([]); 
  const [newVault, setNewVault] = useState({ name: '', game: '', key: '', status: 'Aktif', script_content: '' });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [navigate]);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'admin') { navigate('/'); return; }
    } catch (e) { navigate('/login'); return; }

    try {
        const [projRes, testRes, settRes, userRes] = await Promise.all([
            axios.get('http://localhost:8000/api/projects'),
            axios.get('http://localhost:8000/api/testimonials'),
            axios.get('http://localhost:8000/api/settings'),
            axios.get('http://localhost:8000/api/users')
        ]);
        setProjects(projRes.data);
        setTestimonials(testRes.data);
        setSettings({ ...settRes.data, skills: settRes.data.skills ? settRes.data.skills.join(', ') : '' });
        setUsers(userRes.data);
        setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  const ProjectForm = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState(project || { title: '', description: '', videoUrl: '', videoId: '', category: '', featured: false, isService: false });
    const handleUrlChange = (e) => {
        const url = e.target.value;
        const id = extractVideoId(url);
        setFormData({ ...formData, videoUrl: url, videoId: id });
    };
    return (
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
            <input placeholder="Başlık" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black border border-white/20 rounded p-2 text-white" required />
            <input placeholder="Kategori" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-black border border-white/20 rounded p-2 text-white" required />
        </div>
        <textarea placeholder="Açıklama" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black border border-white/20 rounded p-2 mb-4 text-white" rows="3" required />
        <div className="grid grid-cols-2 gap-4 mb-4">
            <input placeholder="Video URL" value={formData.videoUrl} onChange={handleUrlChange} className="w-full bg-black border border-white/20 rounded p-2 text-white" />
            <input placeholder="Video ID" value={formData.videoId} onChange={(e) => setFormData({ ...formData, videoId: e.target.value })} className="w-full bg-black border border-white/20 rounded p-2 text-white" />
        </div>
        <div className="flex gap-4 mb-4 text-sm">
            <label className="flex gap-2 items-center"><input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} /> Öne Çıkan</label>
            <label className="flex gap-2 items-center"><input type="checkbox" checked={formData.isService} onChange={e => setFormData({...formData, isService: e.target.checked})} /> Hizmet</label>
        </div>
        <div className="flex gap-2">
            <button type="submit" className="bg-white text-black px-4 py-2 rounded font-bold">Kaydet</button>
            <button type="button" onClick={onCancel} className="text-white border border-white/20 px-4 py-2 rounded">İptal</button>
        </div>
      </form>
    );
  };

  const openPlanModal = (user) => { setTargetUser(user); setShowPlanModal(true); };
  const applyPlan = async (planName, isCustomerStatus) => {
      if (!targetUser) return;
      try {
          await axios.put(`http://localhost:8000/api/users/${targetUser.username}/status`, { isCustomer: isCustomerStatus, subscription_plan: planName });
          alert("Güncellendi!"); setShowPlanModal(false); setTargetUser(null); checkAuthAndFetchData();
      } catch (err) { alert("Hata."); }
  };
  const removeMembership = async (user) => { if(window.confirm("İptal?")) { try { await axios.put(`http://localhost:8000/api/users/${user.username}/status`, { isCustomer: false, subscription_plan: "Yok" }); checkAuthAndFetchData(); } catch (e) { alert("Hata"); } } };

  const openVaultManager = async (user) => { setSelectedUserForVault(user); try { const res = await axios.get(`http://localhost:8000/api/vaults/user/${user.username}`); setUserVaults(res.data); } catch (err) { alert("Hata."); } };
  const handleAddVault = async (e) => { e.preventDefault(); if (!selectedUserForVault) return; try { const vaultData = { ...newVault, owner_username: selectedUserForVault.username }; await axios.post('http://localhost:8000/api/vaults', vaultData); const res = await axios.get(`http://localhost:8000/api/vaults/user/${selectedUserForVault.username}`); setUserVaults(res.data); setNewVault({ name: '', game: '', key: '', status: 'Aktif', script_content: '' }); alert("Eklendi!"); } catch (err) { alert("Hata."); } };
  const handleDeleteVault = async (vaultId) => { if (window.confirm("Silinsin mi?")) { try { await axios.delete(`http://localhost:8000/api/vaults/${vaultId}`); setUserVaults(userVaults.filter(v => v.id !== vaultId)); } catch (err) { alert("Hata."); } } };
  
  const handleDeleteProject = async (id) => { if(window.confirm("Silinsin mi?")) { await axios.delete(`http://localhost:8000/api/projects/${id}`); setProjects(projects.filter(p => p.id !== id)); } };
  const handleSaveProject = async (projectData) => { if (editingItem?.id) await axios.put(`http://localhost:8000/api/projects/${editingItem.id}`, projectData); else await axios.post('http://localhost:8000/api/projects', projectData); checkAuthAndFetchData(); setEditingItem(null); setShowAddForm(false); };
  const handleDeleteTestimonial = async (id) => { if(window.confirm("Silinsin mi?")) { await axios.delete(`http://localhost:8000/api/testimonials/${id}`); setTestimonials(testimonials.filter(t => t.id !== id)); } };
  const handleSaveSettings = async () => { const skillsArray = typeof settings.skills === 'string' ? settings.skills.split(',').map(s => s.trim()) : settings.skills; await axios.post('http://localhost:8000/api/settings', { ...settings, skills: skillsArray }); alert("Kaydedildi!"); };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="w-64 border-r border-white/10 p-6 flex flex-col fixed h-full bg-black z-10">
        <h1 className="font-black text-xl tracking-tight mb-8 pl-2">ADMIN PANEL</h1>
        <nav className="flex-1 space-y-2">
          {['users', 'projects', 'testimonials', 'settings'].map(tab => (
              <button key={tab} onClick={() => {setActiveTab(tab); setSelectedUserForVault(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all ${activeTab === tab ? 'bg-white text-black font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
                {tab==='users' && <Users size={18}/>} {tab==='projects' && <FileText size={18}/>} {tab==='testimonials' && <MessageSquare size={18}/>} {tab==='settings' && <Settings size={18}/>}
                <span className="uppercase text-sm">{tab === 'testimonials' ? 'Yorumlar' : tab === 'users' ? 'Kullanıcılar' : tab === 'projects' ? 'Projeler' : 'Ayarlar'}</span>
              </button>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-900/10 rounded-md transition-colors mt-auto border border-red-500/20">
          <ArrowLeft size={18} /> <span className="text-sm font-bold">SİTEYE DÖN</span>
        </Link>
      </div>

      <div className="flex-1 p-8 ml-64">
        {activeTab === 'users' && (
          <div>
            {selectedUserForVault ? (
                <div className="animate-in fade-in slide-in-from-right-4">
                    <button onClick={() => setSelectedUserForVault(null)} className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft size={16} /> LİSTEYE DÖN</button>
                    <div className="mb-8 p-6 bg-zinc-900/30 border border-white/10 rounded-lg">
                        <h2 className="text-2xl font-black uppercase mb-1">Script Yönetimi</h2>
                        <p className="text-gray-400 text-sm font-mono">Kullanıcı: <span className="text-white font-bold">{selectedUserForVault.username}</span></p>
                    </div>
                    <form onSubmit={handleAddVault} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-gray-400"><Plus size={16} /> Yeni Script Tanımla</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input placeholder="Script İsmi" value={newVault.name} onChange={e => setNewVault({...newVault, name: e.target.value})} className="bg-black border border-white/20 rounded p-3 text-white text-sm" required />
                            <input placeholder="Oyun İsmi" value={newVault.game} onChange={e => setNewVault({...newVault, game: e.target.value})} className="bg-black border border-white/20 rounded p-3 text-white text-sm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input placeholder="KEY" value={newVault.key} onChange={e => setNewVault({...newVault, key: e.target.value})} className="bg-black border border-white/20 rounded p-3 text-white text-sm font-mono" required />
                            <select value={newVault.status} onChange={e => setNewVault({...newVault, status: e.target.value})} className="bg-black border border-white/20 rounded p-3 text-white text-sm"><option value="Aktif">Aktif</option><option value="Bakımda">Bakımda</option><option value="Pasif">Pasif</option></select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Script Kodu</label>
                            <textarea placeholder="loadstring..." value={newVault.script_content} onChange={e => setNewVault({...newVault, script_content: e.target.value})} className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm font-mono h-32" />
                        </div>
                        <button type="submit" className="bg-white text-black px-6 py-2 rounded font-bold text-sm hover:bg-gray-200 transition-all">Tanımla</button>
                    </form>
                    <div className="space-y-3">
                        {userVaults.map(vault => (
                            <div key={vault.id} className="bg-white/5 border border-white/10 p-4 rounded flex justify-between items-center">
                                <div className="flex items-center gap-4"><div className="p-2 bg-zinc-900 rounded text-red-500"><Box size={20}/></div><div><h4 className="font-bold text-sm">{vault.name}</h4><p className="text-xs text-gray-400">{vault.game}</p></div></div>
                                <div className="flex items-center gap-4">
                                    {vault.script_content && <Code size={16} className="text-blue-400" />}
                                    <code className="bg-black px-3 py-1 rounded text-xs font-mono text-gray-300 border border-white/10">{vault.key}</code>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded border bg-green-900/20 text-green-400 border-green-500/20">{vault.status}</span>
                                    <button onClick={() => handleDeleteVault(vault.id)} className="text-zinc-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-black uppercase mb-6 tracking-tight">Kullanıcı Listesi</h2>
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-gray-300">{user.username.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-bold text-sm">{user.username}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded text-gray-400">{user.role}</span>
                                            {user.isCustomer && <span className="text-[10px] uppercase bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-500/20">{user.subscription_plan || "MÜŞTERİ"}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openVaultManager(user)} className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded hover:bg-blue-600/20 transition-all text-[10px] font-bold uppercase">
                                        <Key size={14} /> Script Ver
                                    </button>
                                    <button onClick={() => openPlanModal(user)} className={`flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase rounded border transition-all ${user.isCustomer ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                                        <ShieldCheck size={14} /> Üyelik Düzenle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {showPlanModal && targetUser && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg w-96 shadow-2xl">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold uppercase flex items-center gap-2"><CreditCard size={20} className="text-red-500" /> Üyelik Yönetimi</h3><button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button></div>
                    <p className="text-sm text-gray-400 mb-6 pb-4 border-b border-white/10">Kullanıcı: <span className="text-white font-bold ml-1">{targetUser.username}</span></p>
                    <div className="space-y-2">
                        <button onClick={() => applyPlan("1 Aylık Abonelik", true)} className="w-full text-left px-4 py-3 bg-black border border-zinc-800 rounded hover:border-red-600 hover:bg-zinc-900 transition-all flex justify-between items-center group"><span className="text-sm font-bold">1 Aylık Abonelik</span><CheckCircle size={16} className="text-zinc-700 group-hover:text-red-600" /></button>
                        <button onClick={() => applyPlan("3 Aylık Abonelik", true)} className="w-full text-left px-4 py-3 bg-black border border-zinc-800 rounded hover:border-red-600 hover:bg-zinc-900 transition-all flex justify-between items-center group"><span className="text-sm font-bold">3 Aylık Abonelik</span><CheckCircle size={16} className="text-zinc-700 group-hover:text-red-600" /></button>
                        <button onClick={() => applyPlan("6 Aylık Abonelik", true)} className="w-full text-left px-4 py-3 bg-black border border-zinc-800 rounded hover:border-red-600 hover:bg-zinc-900 transition-all flex justify-between items-center group"><span className="text-sm font-bold">6 Aylık Abonelik</span><CheckCircle size={16} className="text-zinc-700 group-hover:text-red-600" /></button>
                        <div className="h-px bg-white/10 my-2"></div>
                        <button onClick={() => applyPlan("Müşteri", true)} className="w-full text-left px-4 py-3 bg-black border border-green-900/30 rounded hover:border-green-500 hover:bg-green-900/10 transition-all flex justify-between items-center group"><span className="text-sm font-bold text-green-400">Müşteri Rolü Ver</span><Crown size={16} className="text-zinc-700 group-hover:text-green-500" /></button>
                        <button onClick={() => removeMembership(targetUser)} className="w-full text-left px-4 py-3 bg-black border border-red-900/30 rounded hover:border-red-500 hover:bg-red-900/10 transition-all flex justify-between items-center group"><span className="text-sm font-bold text-red-400">Müşteriliği Kaldır</span><X size={16} className="text-zinc-700 group-hover:text-red-500" /></button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'projects' && (
            <div className="animate-in fade-in">
                <div className="flex justify-between mb-6 items-center"><h2 className="text-2xl font-black uppercase">Projeler</h2><button onClick={() => {setShowAddForm(true); setEditingItem(null);}} className="bg-white text-black px-4 py-2 rounded font-bold text-sm flex gap-2 items-center"><Plus size={16}/> Yeni Ekle</button></div>
                {showAddForm && <ProjectForm project={editingItem} onSave={handleSaveProject} onCancel={() => {setShowAddForm(false); setEditingItem(null);}} />}
                <div className="space-y-3">{projects.map(p => (<div key={p.id} className="bg-white/5 p-4 rounded flex justify-between items-center border border-white/10"><div><h4 className="font-bold text-sm">{p.title}</h4><span className="text-xs text-gray-500">{p.category}</span></div><div className="flex gap-2"><button onClick={() => {setEditingItem(p); setShowAddForm(true);}} className="p-2 bg-white/5 rounded hover:bg-white/10"><Edit2 size={14}/></button><button onClick={() => handleDeleteProject(p.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><Trash2 size={14}/></button></div></div>))}</div>
            </div>
        )}
        {activeTab === 'testimonials' && ( <div className="animate-in fade-in"><h2 className="text-2xl font-black uppercase mb-6">Yorumlar</h2><div className="space-y-3">{testimonials.map(t => (<div key={t.id} className="bg-white/5 p-4 rounded flex justify-between border border-white/10"><div><h4 className="font-bold text-sm">{t.author}</h4><p className="text-xs text-gray-400">"{t.content}"</p></div><button onClick={() => handleDeleteTestimonial(t.id)} className="text-red-500 p-2"><Trash2 size={16}/></button></div>))}</div></div> )}
        {activeTab === 'settings' && (
            <div className="animate-in fade-in max-w-xl">
                <h2 className="text-2xl font-black uppercase mb-6">Ayarlar</h2>
                <div className="space-y-4">
                    <input className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm" placeholder="Başlık" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} />
                    <textarea className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm" rows="4" placeholder="Bio" value={settings.bio} onChange={e => setSettings({...settings, bio: e.target.value})} />
                    <input className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm" placeholder="Yetenekler" value={settings.skills} onChange={e => setSettings({...settings, skills: e.target.value})} />
                    <input className="w-full bg-black border border-white/20 rounded p-3 text-white text-sm" placeholder="Discord" value={settings.discord} onChange={e => setSettings({...settings, discord: e.target.value})} />
                    <button onClick={handleSaveSettings} className="bg-white text-black px-6 py-2 rounded font-bold text-sm flex gap-2 items-center"><Save size={16}/> Kaydet</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Admin;