import React, { useState, useEffect } from 'react';
// 👇 DÜZELTME: CheckCircle buraya eklendi
import { Star, MessageSquare, Trash2, Lock, Crown, UserCheck, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Testimonials = ({ isAuthenticated, isCustomer }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newTestimonial, setNewTestimonial] = useState({ content: '', rating: 5 });
  
  // Yetki State'leri
  const [isAdmin, setIsAdmin] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [hasPosted, setHasPosted] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, [isCustomer, isAuthenticated]); 

  const checkUserStatus = (currentTestimonials) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub;

        if (payload.role === 'admin') {
            setIsAdmin(true);
            setCanPost(true);
        }
        
        if (payload.isCustomer === true) {
            setCanPost(true);
        }

        if (payload.role !== 'admin') {
            const existingPost = currentTestimonials.find(t => t.userId === username);
            if (existingPost) {
                setHasPosted(true);
            }
        }
    } catch (e) { console.error("Token okunamadı"); }
  };

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/testimonials');
      const data = response.data.reverse();
      setTestimonials(data);
      checkUserStatus(data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert("Giriş yapmalısınız");

    try {
        await axios.post('http://localhost:8000/api/testimonials', newTestimonial, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setNewTestimonial({ content: '', rating: 5 });
        setShowForm(false);
        setHasPosted(true);
        fetchTestimonials();
        alert("Yorumunuz eklendi!");
    } catch (err) { 
        alert(err.response?.data?.detail || "Hata oluştu."); 
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Silmek istediğinize emin misiniz?")) {
          try {
              await axios.delete(`http://localhost:8000/api/testimonials/${id}`);
              const updatedList = testimonials.filter(t => t.id !== id);
              setTestimonials(updatedList);
              
              const token = localStorage.getItem('token');
              if(token) {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const stillHasPost = updatedList.find(t => t.userId === payload.sub);
                  if (!stillHasPost) setHasPosted(false);
              }
          } catch (err) { alert("Silinemedi"); }
      }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={14} className={star <= rating ? 'fill-red-600 text-red-600' : 'text-zinc-800'} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-black text-4xl sm:text-5xl uppercase tracking-tighter mb-2">Yorumlar</h1>
            <div className="h-1 w-20 bg-red-600"></div>
          </div>
          <p className="text-gray-400 text-right text-sm">Müşterilerimizin geri bildirimleri</p>
        </div>

        {/* YORUM FORMU */}
        {isAuthenticated && canPost && !hasPosted && (
          <div className="mb-12">
            {!showForm ? (
              <button onClick={() => setShowForm(true)} className="w-full px-6 py-6 bg-zinc-900/30 border border-white/5 rounded-md text-left hover:border-red-600/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors text-gray-500">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wider group-hover:text-white transition-colors block">Bir yorum bırak...</span>
                    <span className="text-xs text-green-500 font-mono flex items-center gap-1 mt-1"><UserCheck size={12}/> Yetkili Kullanıcı</span>
                  </div>
                </div>
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="bg-zinc-900/30 border border-white/10 rounded-md p-8 animate-in fade-in slide-in-from-top-4">
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Puanla</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })} className="hover:scale-110 transition-transform">
                        <Star size={28} className={star <= newTestimonial.rating ? 'fill-red-600 text-red-600' : 'text-zinc-700'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Düşüncelerin</label>
                  <textarea value={newTestimonial.content} onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })} rows="4" className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-md text-white focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder="Deneyimini paylaş..." required />
                </div>
                <div className="flex gap-3 justify-end">
                   <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-transparent text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-white/5 transition-all">İptal</button>
                   <button type="submit" className="px-8 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-red-700 transition-all">Gönder</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ZATEN YORUM YAPMIŞSA */}
        {isAuthenticated && hasPosted && !isAdmin && (
             <div className="mb-12 p-6 bg-green-900/10 border border-green-500/20 rounded-md text-center flex flex-col items-center gap-3">
                <CheckCircle size={32} className="text-green-500" />
                <p className="text-green-400 font-bold uppercase tracking-wider">Değerlendirmeniz Alındı</p>
                <p className="text-gray-400 text-sm">Daha önce bir yorum yaptınız. İlginiz için teşekkürler!</p>
             </div>
        )}

        {/* GİRİŞ YAPMAMIŞSA */}
        {!isAuthenticated && (
          <div className="mb-12 p-8 bg-zinc-900/20 border border-white/5 rounded-md text-center">
            <p className="text-gray-400">Yorum yazmak için <a href="/login" className="text-red-500 font-bold hover:underline">giriş yapın</a>.</p>
          </div>
        )}

        {/* YETKİSİ YOKSA */}
        {isAuthenticated && !canPost && !hasPosted && (
          <div className="mb-12 p-8 bg-zinc-900/20 border border-red-900/30 rounded-md text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-red-500 font-bold font-mono uppercase tracking-wider">
                <Lock size={20} /> Yetki Kısıtlaması
            </div>
            <p className="text-gray-400 max-w-lg mx-auto text-sm">
              Yorum yazabilmek için <span className="text-white font-bold">Abonelik</span> veya <span className="text-white font-bold">Müşteri</span> statüsüne sahip olmanız gerekmektedir.
            </p>
            <div className="flex gap-2">
                <a href="/vendetta-security#pricing" className="text-xs bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Crown size={14} /> Paket Satın Al
                </a>
                <a href="https://discord.com/users/1028650548221706350" target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 text-gray-300 px-4 py-2 rounded-md font-bold hover:bg-white/20 transition-colors">
                    Destek Al
                </a>
            </div>
          </div>
        )}

        <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
                <div key={testimonial.id || index} className="bg-zinc-900/20 border border-white/5 rounded-md p-8 hover:border-red-500/30 transition-all relative group">
                    {isAdmin && (
                        <button onClick={() => handleDelete(testimonial.id)} className="absolute top-6 right-6 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>
                    )}
                    <div className="flex items-start justify-between mb-4 pr-8">
                        <div>
                        <h3 className="font-bold text-lg text-white mb-1">{testimonial.author || "Anonim"}</h3>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                            {/* Shield ve Crown kullanımı */}
                            {testimonial.role === 'admin' ? <Shield size={12} className="text-red-500"/> : <Crown size={12} className="text-green-500"/>}
                            {testimonial.role || "Müşteri"}
                        </p>
                        </div>
                        {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm mb-4 border-l-2 border-red-900/50 pl-4">
                        "{testimonial.content}"
                    </p>
                    <p className="text-zinc-600 text-xs text-right font-mono">
                        {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('tr-TR') : "Tarih yok"}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;