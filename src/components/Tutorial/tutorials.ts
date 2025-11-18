export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

export type TutorialScreen = 'dashboard' | 'home' | 'ai-insights' | 'progress' | 'meals' | 'settings' | 'food_analysis' | 'photo_recognition' | 'detailed_analysis' | 'profile_setup'

export const tutorials: Record<TutorialScreen, TutorialStep[]> = {
  dashboard: [
    {
      id: 'add-meal-button',
      title: '🍽️ Öğün Eklemeye Başlayın',
      description: 'Buraya tıklayın! Yemeğinizin fotoğrafını çekin veya ismini yazın - AI hemen analiz edecek. Sadece 10 saniye sürer!',
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom'
    },
    {
      id: 'macro-charts',
      title: '📊 Makrolarınızı İzleyin',
      description: 'Bu renkli çemberler protein, karbonhidrat ve yağ tüketiminizi gösterir. Dolu çember = günlük hedefe ulaştınız! 🎯',
      targetSelector: '[data-tutorial="macro-charts"]',
      position: 'top'
    },
    {
      id: 'calorie-cards',
      title: '🔥 Kalori Dengesi',
      description: 'Bugün kaç kalori harcadınız ve ne kadar tükettiniz? Hedefinize ne kadar yakınsınız - hepsini burada görün!',
      targetSelector: '[data-tutorial="calorie-cards"]',
      position: 'bottom'
    },
    {
      id: 'meal-history',
      title: '📝 Bugünkü Öğünleriniz',
      description: 'Tüm öğünleriniz burada! İstediğiniz öğüne tıklayarak düzenleyebilir veya silebilirsiniz.',
      targetSelector: '[data-tutorial="meal-history"]',
      position: 'top'
    }
  ],

  home: [
    {
      id: 'home-header',
      title: '🏠 Ana Sayfa',
      description: 'Hoş geldiniz! Ana sayfanızda günlük kalori ve makro takibinizi kolayca görebilirsiniz.',
      targetSelector: '[data-tutorial="calorie-cards"]',
      position: 'bottom'
    },
    {
      id: 'add-meal-button-home',
      title: '➕ Hızlı Öğün Ekleme',
      description: 'Bu butona tıklayarak hızlıca yeni bir öğün ekleyebilirsiniz. Fotoğraf çekin veya manuel olarak girin!',
      targetSelector: '[data-tutorial="add-meal-button-home"]',
      position: 'top'
    },
    {
      id: 'macro-charts',
      title: '📊 Makro Takibi',
      description: 'Protein, karbonhidrat ve yağ oranlarınızı renkli grafiklerle takip edin. Hedefinize ne kadar yakınsınız?',
      targetSelector: '[data-tutorial="macro-charts"]',
      position: 'top'
    }
  ],

  'ai-insights': [
    {
      id: 'ai-insights-intro',
      title: '🧠 AI Analiz',
      description: 'Yapay zeka destekli öneriler ve analizlerle beslenme alışkanlıklarınızı iyileştirin!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'daily-analysis',
      title: '📈 Günlük Analiz',
      description: 'AI, günlük beslenmenizi analiz eder ve size özel öneriler sunar. Eksiklerinizi ve güçlü yönlerinizi öğrenin.',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'smart-tips',
      title: '💡 Akıllı İpuçları',
      description: 'Hedeflerinize ulaşmanız için kişiselleştirilmiş ipuçları alın. Her gün yeni öneriler!',
      targetSelector: 'body',
      position: 'bottom'
    }
  ],

  progress: [
    {
      id: 'progress-intro',
      title: '📊 Gelişim Takibi',
      description: 'Hedeflerinize doğru ilerlemenizi grafik ve istatistiklerle takip edin!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'weight-tracking',
      title: '⚖️ Kilo Takibi',
      description: 'Kilo değişimlerinizi görsel grafiklerle izleyin. Trend analizi ile gelişiminizi değerlendirin.',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'weekly-stats',
      title: '📅 Haftalık İstatistikler',
      description: 'Haftalık ortalamalarınızı görün. Hangi günler daha başarılıydı? Nerede gelişebilirsiniz?',
      targetSelector: 'body',
      position: 'bottom'
    }
  ],

  meals: [
    {
      id: 'meals-intro',
      title: '🍽️ Öğünler Sayfası',
      description: 'Tüm öğünlerinizi yönetin, favorilerinize ekleyin ve AI önerilerinden faydalanın!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'add-meal-button-meals',
      title: '➕ Öğün Ekle',
      description: 'Buradan hızlıca yeni öğün ekleyebilirsiniz. Fotoğraf çekin veya manuel olarak girin!',
      targetSelector: '[data-tutorial="add-meal-button-meals"]',
      position: 'top'
    },
    {
      id: 'meal-suggestions',
      title: '✨ AI Önerileri',
      description: 'Hedeflerinize uygun kişiselleştirilmiş öğün önerileri alın. AI sizin için en uygun tarifleri seçer!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'favorites',
      title: '❤️ Favorilerim',
      description: 'Sevdiğiniz tarifleri favorilere ekleyin, bir daha aradığınızda kolayca bulun!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'meal-history',
      title: '📝 Öğün Geçmişi',
      description: 'Bugün ve geçmiş günlerde yediğiniz öğünleri görüntüleyin, düzenleyin veya silin.',
      targetSelector: '[data-tutorial="meal-history"]',
      position: 'top'
    }
  ],

  settings: [
    {
      id: 'settings-intro',
      title: '⚙️ Ayarlar',
      description: 'Profilinizi düzenleyin, hedeflerinizi güncelleyin ve uygulamayı kendinize göre özelleştirin!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'profile-settings',
      title: '👤 Profil Bilgileri',
      description: 'Kilo, boy, yaş gibi bilgilerinizi güncel tutun. Doğru bilgiler, daha doğru kalori hesabı demek!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'goals',
      title: '🎯 Günlük Hedefler',
      description: 'Kalori ve makro hedeflerinizi belirleyin. Kilo verme, kilo alma veya kilo koruma - seçim sizin!',
      targetSelector: 'body',
      position: 'bottom'
    },
    {
      id: 'subscription',
      title: '👑 Abonelik',
      description: 'Premium özelliklerden faydalanın! Sınırsız analiz, detaylı raporlar ve daha fazlası...',
      targetSelector: 'body',
      position: 'bottom'
    }
  ],

  food_analysis: [
    {
      id: 'manual-entry',
      title: '✍️ Hızlı Yazılı Giriş',
      description: 'Fotoğraf yok? Sorun değil! Sadece "1 dilim pizza" veya "200g tavuk göğsü" yazın - AI gerisi halleder!',
      targetSelector: '[data-tutorial="manual-entry"]',
      position: 'top'
    },
    {
      id: 'photo-upload',
      title: '📸 Fotoğrafla Tanıma',
      description: 'Fotoğraf en doğru sonucu verir! Yemeğinizi çekin, AI görsel olarak analiz edip kalorilerini hesaplasın.',
      targetSelector: '[data-tutorial="photo-upload"]',
      position: 'bottom'
    },
    {
      id: 'save-button',
      title: '✅ Kaydedin ve Takip Edin',
      description: 'Her şey hazır mı? Bu butona basın ve öğününüz günlük hesabınıza eklensin!',
      targetSelector: '[data-tutorial="save-button"]',
      position: 'top'
    }
  ],

  photo_recognition: [
    {
      id: 'camera-button',
      title: '📷 Fotoğraf Çekin',
      description: 'Yemeğinizi net bir şekilde çekin. İpucu: Işık altında ve yakın mesafeden çekmek daha iyi sonuç verir!',
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom'
    },
    {
      id: 'analysis-quick',
      title: '⚡ Hızlı Analiz',
      description: 'Acele mi ediyorsunuz? Normal analiz 5-10 saniyede sonuç verir. Günlük kullanım için ideal!',
      targetSelector: '[data-tutorial="analysis-quick"]',
      position: 'top'
    },
    {
      id: 'analysis-detailed',
      title: '🔍 Detaylı Analiz',
      description: 'Karışık yemekler için önerilir. AI her malzemeyi tek tek analiz eder. Biraz daha uzun sürer ama çok daha hassas!',
      targetSelector: '[data-tutorial="analysis-detailed"]',
      position: 'top'
    }
  ],

  detailed_analysis: [
    {
      id: 'portion-input',
      title: '⚖️ Miktar Belirtin',
      description: 'Kaç gram yediniz? Bilmiyorsanız "1 porsiyon", "1 kase" veya "yarım tabak" gibi ifadeler de kullanabilirsiniz!',
      targetSelector: '[data-tutorial="portion-input"]',
      position: 'bottom'
    },
    {
      id: 'cooking-method',
      title: '🍳 Pişirme Şekli Önemli',
      description: 'Kızartma mı haşlama mı? Bu detay kalori hesabını etkiler! Doğru seçim yapın, AI gerçekçi sonuç versin.',
      targetSelector: '[data-tutorial="cooking-method"]',
      position: 'top'
    },
    {
      id: 'save-button',
      title: '💾 Tamamdı, Kaydedin!',
      description: 'Mükemmel! Tüm bilgiler doğru mu? Öyleyse kaydet butonuna basın ve hedefinize bir adım daha yaklaşın! 🎉',
      targetSelector: '[data-tutorial="save-button"]',
      position: 'top'
    }
  ],

  profile_setup: [
    {
      id: 'body-info',
      title: '👤 Vücut Bilgileriniz',
      description: 'Yaş, kilo ve boy bilgileriniz kişiselleştirilmiş kalori hedefi için gerekli. Güncel tutmayı unutmayın!',
      targetSelector: '[data-tutorial="body-info"]',
      position: 'bottom'
    },
    {
      id: 'goal-settings',
      title: '🎯 Hedefiniz Ne?',
      description: 'Kilo mu vermek istiyorsunuz yoksa kas mı yapmak? Hedefinizi seçin, size özel kalori planınızı oluşturalım!',
      targetSelector: '[data-tutorial="goal-settings"]',
      position: 'top'
    },
    {
      id: 'save-profile',
      title: '🚀 Yolculuğa Başlayın',
      description: 'Harika! Artık her şey hazır. Kaydet butonuna basın ve hedeflerinize ulaşma yolculuğunuz başlasın!',
      targetSelector: '[data-tutorial="save-profile"]',
      position: 'top'
    }
  ]
}