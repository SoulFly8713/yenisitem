// Mock data for development
export const mockProjects = [
  {
    id: '1',
    title: 'NPC Destekli Er / Subay Eğitimi',
    description: 'Roblox Studio üzerinde geliştirdiğim NPC destekli askeri eğitim simülasyonu. Gerçekçi eğitim senaryoları ve yapay zeka destekli NPC sistemleri.',
    videoUrl: 'https://youtu.be/uJKXUEYjMto',
    videoId: 'uJKXUEYjMto',
    category: 'Simülasyon',
    featured: true
  },
  {
    id: '2',
    title: '5v5 Rehine Kurtarma Operasyonu',
    description: 'Takım bazlı taktiksel operasyon oyunu. 5v5 format ile gerçekçi rehine kurtarma senaryoları ve stratejik oynanış.',
    videoUrl: 'https://youtu.be/9BpH97GJeeY',
    videoId: '9BpH97GJeeY',
    category: 'Taktik',
    featured: true
  },
  {
    id: '3',
    title: 'Poligon Yarış Sistemi',
    description: 'Askeri poligonda yarış mekanikleri. Zaman tutma, skor sistemi ve rekabetçi oynanış özellikleri.',
    videoUrl: 'https://youtu.be/GpbWriG1ZbI',
    videoId: 'GpbWriG1ZbI',
    category: 'Yarış',
    featured: false
  },
  {
    id: '4',
    title: 'Vendetta Security',
    description: 'Roblox script şifreleme ve güvenlik çözümü. Kodlarınızı güvenli bir şekilde koruyun ve şifreleyin.',
    videoUrl: null,
    videoId: null,
    category: 'Güvenlik',
    featured: true,
    isService: true
  }
];

export const mockTestimonials = [
  {
    id: '1',
    author: 'Ahmet Y.',
    role: 'Oyun Geliştiricisi',
    content: 'Harika bir scripter! NPC sistemleri çok profesyonel ve optimize çalışıyor.',
    rating: 5,
    date: '2024-12-15',
    isCustomer: true
  },
  {
    id: '2',
    author: 'Mehmet K.',
    role: 'Proje Yöneticisi',
    content: 'Vendetta Security ile kodlarımızı güvence altına aldık. Kesinlikle tavsiye ederim.',
    rating: 5,
    date: '2024-12-10',
    isCustomer: true
  },
  {
    id: '3',
    author: 'Zeynep S.',
    role: 'Oyun Sahibi',
    content: 'Operasyon sistemi tam istediğim gibi oldu. Çok detaylı ve kaliteli bir çalışma.',
    rating: 5,
    date: '2024-12-05',
    isCustomer: true
  }
];

export const mockUser = {
  id: 'admin',
  username: 'soulfly871',
  role: 'admin',
  isCustomer: true
};

export const mockAbout = {
  title: 'Roblox Script Developer',
  bio: 'Roblox Studio üzerinde profesyonel script geliştirme hizmetleri sunuyorum. Askeri simülasyonlar, taktiksel oyunlar ve güvenlik sistemleri konusunda uzmanım. Her projeye özel çözümler üretiyorum.',
  skills: ['Lua Programming', 'Roblox Studio', 'Game Mechanics', 'NPC AI Systems', 'Security & Encryption'],
  discord: 'soulfly871'
};