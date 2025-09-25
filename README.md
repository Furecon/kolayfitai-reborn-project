# KolayfitAI - Akıllı Beslenme Asistanı

## Proje Hakkında

KolayfitAI, yapay zeka destekli beslenme takip uygulamasıdır. Kullanıcılar yemek fotoğrafları çekerek otomatik kalori hesaplama, kişiselleştirilmiş beslenme önerileri ve günlük hedef takibi yapabilirler.

## Özellikler

- 📸 AI destekli yemek fotoğrafı analizi
- 🔢 Otomatik kalori ve makro besin hesaplama
- 📊 Günlük hedef takibi ve ilerleme raporları
- 🤖 Kişiselleştirilmiş AI önerileri
- 📱 Barkod tarama ile ürün bilgisi
- ❤️ Favori yemekler ve tarifler
- 📈 Gelişim takibi ve AI değerlendirmeleri

## Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- OpenAI API anahtarı

### Adımlar

1. **Depoyu klonlayın:**
```bash
git clone <repository-url>
cd kolayfitai
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

4. **Environment değişkenlerini ayarlayın:**
`.env` dosyasını düzenleyerek Supabase ve OpenAI bilgilerinizi girin.

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

## Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Database URL ve Anon Key'i `.env` dosyasına ekleyin
4. Supabase migrations'ları çalıştırın

## Teknolojiler

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** OpenAI GPT-4 Vision API
- **State Management:** TanStack Query
- **Routing:** React Router

## Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Auth/           # Kimlik doğrulama
│   ├── Dashboard/      # Ana dashboard
│   ├── FoodAnalysis/   # Yemek analizi
│   ├── Profile/        # Kullanıcı profili
│   └── ui/             # UI bileşenleri
├── hooks/              # Custom React hooks
├── integrations/       # Supabase entegrasyonu
├── lib/                # Yardımcı fonksiyonlar
└── services/           # Servis katmanı
```

## Edge Functions

Supabase Edge Functions şunlar için kullanılır:

- `analyze-food`: Yemek fotoğrafı analizi
- `analyze-food-by-name`: Yemek adından besin değeri hesaplama
- `meal-suggestions`: AI destekli öğün önerileri
- `profile-assessment`: Kullanıcı profil değerlendirmesi
- `subscription-manager`: Abonelik yönetimi
- `barcode-lookup`: Barkod sorgulama

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
