import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Backend kayıt için email istediğinden buraya email de ekledik
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // JWT Token'ı çözüp içindeki Rolü (Admin/User) okumak için küçük bir fonksiyon
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- GİRİŞ YAPMA İŞLEMİ (Login) ---
        
        // FastAPI OAuth2 formatı "Form Data" ister, JSON kabul etmez. 
        // O yüzden veriyi özel bir formatta paketliyoruz:
        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);

        const response = await axios.post('http://localhost:8000/api/login', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Giriş Başarılı!
        const token = response.data.access_token;
        localStorage.setItem('token', token); // Token'ı tarayıcıya kaydet

        // Token içindeki bilgileri (Role, Username) al
        const decodedToken = parseJwt(token);
        const role = decodedToken ? decodedToken.role : 'user';
        
        // Sisteme giriş yapıldığını bildir
        onLogin({ 
            username: formData.username, 
            role: role, 
            isCustomer: role === 'customer' 
        });

        // Yönlendir
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }

      } else {
        // --- KAYIT OLMA İŞLEMİ (Register) ---
        
        // Kayıt olurken JSON formatı kullanıyoruz
        await axios.post('http://localhost:8000/api/register', {
            username: formData.username,
            password: formData.password,
            email: formData.email // Backend bunu istiyor!
        });

        // Kayıt başarılı olduysa
        setIsLogin(true); // Giriş ekranına döndür
        setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setFormData({ ...formData, password: '' }); // Şifreyi temizle
      }

    } catch (err) {
      // Backend'den gelen hatayı yakala ve ekrana yaz
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Sunucuya bağlanılamadı. Lütfen backend terminalini kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 mx-auto mb-4 text-white" />
          <h1 className="font-mono text-3xl font-bold uppercase tracking-tight mb-2">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-8">
          
          {/* HATA MESAJI KUTUSU */}
          {error && (
            <div className={`mb-6 p-4 border rounded-lg text-sm ${
                error.includes('başarılı') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' // Başarı mesajı yeşil
                : 'bg-red-500/10 border-red-500/20 text-red-400'       // Hata mesajı kırmızı
            }`}>
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-mono uppercase tracking-wider mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="kullaniciadi"
              required
            />
          </div>

          {/* KAYIT OLURKEN EMAIL İSTEYELİM */}
          {!isLogin && (
            <div className="mb-6">
                <label className="block text-sm font-mono uppercase tracking-wider mb-2">
                E-Mail Adresi
                </label>
                <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
                placeholder="ornek@email.com"
                required
                />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-mono uppercase tracking-wider mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-white text-black text-sm font-mono uppercase tracking-wider rounded-full hover:bg-gray-200 transition-all mb-4 disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ ...formData, password: '' });
              }}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-400 text-sm hover:text-white transition-colors">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;