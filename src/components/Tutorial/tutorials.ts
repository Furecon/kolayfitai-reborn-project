export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

export type TutorialScreen = 'dashboard' | 'food_analysis' | 'photo_recognition' | 'detailed_analysis' | 'profile_setup'

export const tutorials: Record<TutorialScreen, TutorialStep[]> = {
  dashboard: [
    {
      id: 'add-meal-button',
      title: '🍽️ Öğün Eklemeye Başlayın',
      description: 'Buraya tıklayın! Yemeğinizin fotoğrafını çekin veya ismini yazın - AI hemen analiz edecek. Sadece 10 saniye sürer!',
      targetSelector: '[data-tutorial="add-meal-button"]',
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