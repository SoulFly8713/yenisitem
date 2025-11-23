import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Lock } from 'lucide-react';
import axios from 'axios';

const Testimonials = ({ isAuthenticated, isCustomer }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Yeni yorum verisi
  const [newTestimonial, setNewTestimonial] = useState({
    content: '',
    rating: 5
  });

  // Kullanıcının rolünü (Admin mi?) anlamak için token kontrolü
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTestimonials();
    checkAdminRole();
  }, []);

  // Rol kontrolü
  const checkAdminRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'admin') {
                setIsAdmin(true);
            }
        } catch (e) {
            console.error("Token okunamadı");
        }
    }
  };

  // Yorumları Veritabanından Çek
  const fetchTestimonials = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/testimonials');
      setTestimonials(response.data.reverse());
      setLoading(false);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setError("Yorumlar yüklenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  // --- DÜZELTİLEN KISIM BURASI ---
  // Yeni Yorum Gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Token'ı alıyoruz
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
        return;
    }

    try {
        // 2. İsteği atarken 'headers' içine token'ı ekliyoruz
        await axios.post(
            'http://localhost:8000/api/testimonials', 
            {
                content: newTestimonial.content,
                rating: newTestimonial.rating
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}` // <-- İŞTE EKSİK OLAN ANAHTAR BUYDU!
                }
            }
        );

        setNewTestimonial({ content: '', rating: 5 });
        setShowForm(false);
        fetchTestimonials();
        alert("Yorumunuz başarıyla eklendi!");

    } catch (err) {
        console.error("Yorum hatası:", err);
        alert("Yorum gönderilirken hata oluştu. Lütfen tekrar giriş yapıp deneyin.");
    }
  };

  // Yorum Sil (Sadece Admin)
  const handleDelete = async (id) => {
      if(window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
          try {
              await axios.delete(`http://localhost:8000/api/testimonials/${id}`);
              setTestimonials(testimonials.filter(t => t.id !== id));
          } catch (err) {
              alert("Silme işlemi başarısız.");
          }
      }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-white text-white' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Başlık Bölümü */}
        <div className="mb-12 text-center sm:text-left">
          <h1 className="font-mono text-4xl sm:text-5xl font-bold uppercase tracking-tight mb-4">
            Yorumlar
          </h1>
          <p className="text-gray-400 text-lg">
            Müşterilerimizin deneyimleri ve geri bildirimleri
          </p>
        </div>

        {/* Yorum Ekleme Formu Açma Butonu */}
        {isAuthenticated && (isCustomer || isAdmin) && (
          <div className="mb-12">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-lg text-left hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-gray-400 group-hover:text-white transition-colors" />
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    Yorum yaz...
                  </span>
                </div>
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-in fade-in slide-in-from-top-4">
                <div className="mb-4">
                  <label className="block text-sm font-mono uppercase tracking-wider mb-2">
                    Değerlendirme
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={star <= newTestimonial.rating ? 'fill-white text-white' : 'text-gray-600'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-mono uppercase tracking-wider mb-2">
                    Yorumunuz
                  </label>
                  <textarea
                    value={newTestimonial.content}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors resize-none"
                    placeholder="Deneyiminizi paylaşın..."
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                   <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-transparent text-white border border-white/20 text-sm font-mono uppercase tracking-wider rounded-full hover:bg-white/10 transition-all"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-white text-black text-sm font-mono uppercase tracking-wider rounded-full hover:bg-gray-200 transition-all"
                  >
                    Gönder
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 1. UYARI: Giriş Yapmamışsa */}
        {!isAuthenticated && (
          <div className="mb-12 p-6 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-gray-400">
              Yorum yazmak için <a href="/login" className="text-white underline hover:text-gray-300">giriş yapın</a>
            </p>
          </div>
        )}

        {/* 2. UYARI: Giriş Yapmış ama Müşteri/Admin Değilse */}
        {isAuthenticated && !isCustomer && !isAdmin && (
          <div className="mb-12 p-8 bg-white/5 border border-white/10 rounded-lg text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-lg">
                <Lock className="text-gray-500" size={20} />
                YETKİ KISITLAMASI
            </div>
            <p className="text-gray-400 max-w-lg mx-auto">
              Yorum yazabilmek için <span className="text-white font-bold">"Müşteri"</span> etiketine sahip olmanız gerekmektedir.
            </p>
            <p className="text-sm text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              Müşteri misin?{' '}
              <a 
                href="https://discord.com/users/1028650548221706350" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-bold underline hover:text-gray-300 transition-colors"
              >
                soulfly871
              </a>
              {' '}ile iletişime geç.
            </p>
          </div>
        )}

        {/* Yorum Listesi */}
        {loading ? (
            <div className="text-center text-gray-500 py-10">Yorumlar yükleniyor...</div>
        ) : (
            <div className="space-y-6">
            {testimonials.length === 0 ? (
                <div className="text-center text-gray-500">Henüz yorum yapılmamış. İlk yorumu sen yap!</div>
            ) : (
                testimonials.map((testimonial, index) => (
                    <div
                    key={testimonial.id || index}
                    className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all relative group"
                    >
                    
                    {isAdmin && (
                        <button 
                            onClick={() => handleDelete(testimonial.id)}
                            className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            title="Yorumu Sil"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}

                    <div className="flex items-start justify-between mb-4 pr-8">
                        <div>
                        <h3 className="font-mono font-bold text-lg mb-1">{testimonial.author || "Anonim"}</h3>
                        <p className="text-gray-400 text-xs px-2 py-0.5 bg-white/10 rounded inline-block">
                            {testimonial.role || "Müşteri"}
                        </p>
                        </div>
                        {renderStars(testimonial.rating)}
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed mb-4">
                        "{testimonial.content}"
                    </p>
                    
                    <p className="text-gray-500 text-xs text-right">
                        {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                        }) : "Tarih yok"}
                    </p>
                    </div>
                ))
            )}
            </div>
        )}

      </div>
    </div>
  );
};

export default Testimonials;