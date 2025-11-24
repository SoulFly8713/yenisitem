import React, { useState, useEffect } from 'react';
import { User, Edit2, X, Box, Shield, Copy, Terminal, Lock, Save, Crown, Code, ChevronDown, ChevronUp, Mail, KeyRound } from 'lucide-react';
import axios from 'axios';
// Toast Hook'unu çağırıyoruz
import { useToast } from '../context/ToastContext';

const UserSettings = () => {
  const { addToast } = useToast(); // Toast fonksiyonunu aldık
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vaults, setVaults] = useState([]);
  const [openScriptId, setOpenScriptId] = useState(null);
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    password: '', 
    confirmPassword: '',
    oldPassword: '',
    isCustomer: false,
    subscription_plan: ''
  });

  useEffect(() => {
    fetchFullUserData();
  }, []);

  const fetchFullUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const res = await axios.get('http://localhost:8000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setProfileData(prev => ({ 
            ...prev, 
            username: res.data.username,
            email: res.data.email || "Mail adresi girilmemiş",
            isCustomer: res.data.isCustomer,
            subscription_plan: res.data.subscription_plan
        }));
        fetchVaults(res.data.username);
    } catch (e) { console.error("Kullanıcı verisi çekilemedi"); }
  };

  const fetchVaults = async (username) => {
      try {
          const res = await axios.get(`http://localhost:8000/api/vaults/user/${username}`);
          setVaults(res.data);
      } catch (err) { console.error("Kasalar yüklenemedi"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (profileData.email && !profileData.email.includes("Mail adresi girilmemiş")) {
        const email = profileData.email.toLowerCase();
        const allowedDomains = ["@gmail.com", "@hotmail.com", "@outlook.com", "@yahoo.com", "@icloud.com", "@yandex.com", "@proton.me"];
        if (!allowedDomains.some(domain => email.endsWith(domain))) {
            addToast("Hata: Geçersiz mail sağlayıcısı.", "error"); // ALERT YERİNE TOAST
            return;
        }
    }

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      addToast("Hata: Şifreler eşleşmiyor!", "error");
      return;
    }

    if (profileData.password && !profileData.oldPassword) {
        addToast("Güvenlik: Mevcut şifrenizi girmelisiniz.", "error");
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const dataToSend = {};
      
      if (profileData.email && !profileData.email.includes("Mail adresi girilmemiş")) {
          dataToSend.email = profileData.email;
      }
      if (profileData.password) {
          dataToSend.password = profileData.password;
          dataToSend.old_password = profileData.oldPassword;
      }

      await axios.put('http://localhost:8000/api/users/me/update', dataToSend, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      addToast("Profil başarıyla güncellendi!", "success"); // BAŞARILI TOAST
      setIsEditing(false);
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '', oldPassword: '' }));

    } catch (err) { 
        const errorMsg = err.response?.data?.detail || "Güncelleme başarısız.";
        addToast(errorMsg, "error"); // HATA TOAST
    } finally { 
        setLoading(false); 
    }
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      addToast("Panoya kopyalandı!", "success");
  };

  // ... Kalan return kısmı (HTML) aynı, değişmedi ...
  // Sadece yukarıdaki logic değişti. HTML'i önceki dosyadan aynen koruyarak yapıştırıyorum:

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-md flex items-center justify-center text-red-600">
                <User size={24} />
            </div>
            <div>
                <h1 className="font-black text-2xl uppercase tracking-tighter">HESAP YÖNETİMİ</h1>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Profil ve Script Kasalarınız</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL: PROFİL */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/20 border border-white/10 rounded-md p-6 backdrop-blur-sm relative">
                <button onClick={() => setIsEditing(!isEditing)} className={`absolute top-4 right-4 p-2 rounded-md transition-all ${isEditing ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'}`}>
                    {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                </button>

                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Shield size={18} className="text-red-600" /> Profil Bilgileri
                </h2>

                <div className="space-y-4">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-md text-center mb-6">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">ÜYELİK DURUMU</span>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-sm font-bold uppercase tracking-wider ${profileData.isCustomer ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-zinc-800 border-zinc-700 text-gray-400'}`}>
                            {profileData.isCustomer ? <Crown size={14} /> : <User size={14} />}
                            {profileData.isCustomer ? (profileData.subscription_plan || "PREMIUM") : 'STANDART ÜYE'}
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Kullanıcı Adı</label>
                            <div className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-md text-gray-400 font-mono text-sm flex items-center justify-between">
                                {profileData.username || "Yükleniyor..."} <Lock size={12} />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">E-Mail Adresi</label>
                            <input 
                                type="email" 
                                disabled={!isEditing} 
                                value={profileData.email} 
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                                placeholder="Mail adresi girilmemiş" 
                                className={`w-full px-4 py-3 bg-black border rounded-md text-sm font-mono outline-none transition-all ${isEditing ? 'border-red-900/50 text-white focus:border-red-600' : 'border-zinc-800 text-gray-500 cursor-not-allowed'}`} 
                            />
                        </div>

                        {isEditing && (
                            <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-200 text-xs mb-2">
                                    🔒 Güvenlik: Şifre değişimi için mevcut şifrenizi giriniz.
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-yellow-500 mb-1">Mevcut Şifreniz</label>
                                    <div className="relative">
                                        <input type="password" value={profileData.oldPassword} onChange={(e) => setProfileData({...profileData, oldPassword: e.target.value})} className="w-full px-4 py-3 pl-10 bg-black border border-yellow-500/50 rounded-md text-sm font-mono text-white focus:border-yellow-500 outline-none" placeholder="Şu anki şifre" />
                                        <KeyRound size={14} className="absolute left-3 top-3.5 text-yellow-500"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">Yeni Şifre</label>
                                    <input type="password" value={profileData.password} onChange={(e) => setProfileData({...profileData, password: e.target.value})} className="w-full px-4 py-3 bg-black border border-red-900/50 rounded-md text-sm font-mono text-white focus:border-red-600 outline-none" placeholder="Yeni şifre" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input type="password" value={profileData.confirmPassword} onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-black border border-red-900/50 rounded-md text-sm font-mono text-white focus:border-red-600 outline-none" placeholder="Yeni şifre tekrar" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-wider rounded-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"><Save size={16} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
          </div>

          {/* SAĞ: KASALAR */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/20 border border-white/10 rounded-md p-6 backdrop-blur-sm min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-bold text-lg flex items-center gap-2"><Box size={18} className="text-red-600" /> Kasalarım</h2>
                    <span className="text-xs text-gray-500 font-mono border border-white/10 px-2 py-1 rounded">{vaults.length} ADET</span>
                </div>

                <div className="space-y-4">
                    {vaults.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-md">
                            <p className="text-gray-500 text-sm mb-2">Henüz tanımlanmış bir scriptiniz yok.</p>
                            <p className="text-xs text-zinc-600">Satın alım yaptıysanız Admin onayı bekleyin.</p>
                        </div>
                    ) : (
                        vaults.map((vault, index) => (
                            <div key={index} className="bg-black/40 border border-white/5 rounded-md p-4 transition-all">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-900 rounded-md flex items-center justify-center text-gray-500"><Terminal size={20} /></div>
                                        <div><h3 className="font-bold text-sm text-white">{vault.name}</h3><p className="text-xs text-gray-500 font-mono">{vault.game}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex flex-col items-end mr-4">
                                            <span className="text-[10px] text-gray-600 uppercase font-bold tracking-wider">LİSANS ANAHTARI</span>
                                            <div className="flex items-center gap-2 text-xs font-mono text-gray-300 bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-white/10 hover:text-white" onClick={() => copyToClipboard(vault.key)}>
                                                {vault.key} <Copy size={12} />
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${vault.status === 'Aktif' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-900/30'}`}>{vault.status}</span>
                                    </div>
                                </div>
                                {vault.script_content && (
                                    <div className="border-t border-white/5 pt-3 mt-2">
                                        <button onClick={() => setOpenScriptId(openScriptId === vault.id ? null : vault.id)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors">
                                            {openScriptId === vault.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {openScriptId === vault.id ? 'Kodu Gizle' : 'Script Kodunu Görüntüle'}
                                        </button>
                                        {openScriptId === vault.id && (
                                            <div className="mt-3 relative group/code animate-in fade-in slide-in-from-top-2">
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button onClick={() => copyToClipboard(vault.script_content)} className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-[10px] uppercase font-bold rounded hover:bg-blue-600/30 transition-all"> <Copy size={12} /> Kopyala </button>
                                                </div>
                                                <pre className="bg-zinc-950 border border-white/10 p-4 rounded-md text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto shadow-inner">{vault.script_content}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserSettings;