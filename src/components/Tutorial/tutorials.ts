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
      title: 'Öğün Ekle',
      description: 'Bu butona tıklayarak yeni bir öğün ekleyebilirsiniz. Fotoğrafla analiz en yüksek doğruluğu sağlar.',
      targetSelector: '[data-tutorial="add-meal-button"]',
      position: 'bottom'
    },
    {
      id: 'macro-charts',
      title: 'Makro Çember Grafikleri',
      description: 'Günlük protein, karbonhidrat ve yağ hedeflerinizi bu çember grafiklerle takip edebilirsiniz.',
      targetSelector: '[data-tutorial="macro-charts"]',
      position: 'top'
    },
    {
      id: 'calorie-cards',
      title: 'Kalori Takibi',
      description: 'Günlük kalori hedefinizi ve ne kadar tükettiğinizi burada görebilirsiniz.',
      targetSelector: '[data-tutorial="calorie-cards"]',
      position: 'bottom'
    },
    {
      id: 'meal-history',
      title: 'Öğün Listesi',
      description: 'Bugün eklediğiniz tüm öğünleri burada görebilir ve düzenleyebilirsiniz.',
      targetSelector: '[data-tutorial="meal-history"]',
      position: 'top'
    }
  ],

  food_analysis: [
    {
      id: 'manual-entry',
      title: 'Manuel Giriş',
      description: 'Fotoğraf olmadan da AI ile otomatik hesap yapılır. Yemek adı ve miktarı girmeniz yeterli.',
      targetSelector: '[data-tutorial="manual-entry"]',
      position: 'top'
    },
    {
      id: 'photo-upload',
      title: 'Fotoğraf Yükle',
      description: 'Bu butona tıklayarak yemek fotoğrafı yükleyebilir ve AI tarafından analiz ettirebilirsiniz.',
      targetSelector: '[data-tutorial="photo-upload"]',
      position: 'bottom'
    },
    {
      id: 'save-button',
      title: 'Kaydet',
      description: 'Tüm bilgileri girdikten sonra bu butonla yemeğinizi kaydedin.',
      targetSelector: '[data-tutorial="save-button"]',
      position: 'top'
    }
  ],

  photo_recognition: [
    {
      id: 'camera-button',
      title: 'Fotoğraf Çek',
      description: 'Bu butona tıklayarak yemeğinizin fotoğrafını çekin. AI otomatik olarak analiz edecek.',
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom'
    },
    {
      id: 'analysis-quick',
      title: 'Normal Analiz',
      description: 'Hızlı analiz için bu seçeneği kullanın.',
      targetSelector: '[data-tutorial="analysis-quick"]',
      position: 'top'
    },
    {
      id: 'analysis-detailed',
      title: 'Detaylı Analiz',
      description: 'Daha hassas sonuçlar için detaylı analiz seçeneğini kullanın.',
      targetSelector: '[data-tutorial="analysis-detailed"]',
      position: 'top'
    }
  ],

  detailed_analysis: [
    {
      id: 'portion-input',
      title: 'Porsiyon Girişi',
      description: 'Yediğiniz miktarı gram olarak veya porsiyon sayısı olarak girebilirsiniz.',
      targetSelector: '[data-tutorial="portion-input"]',
      position: 'bottom'
    },
    {
      id: 'cooking-method',
      title: 'Pişirme Yöntemi',
      description: 'Yemeğin nasıl pişirildiğini seçerek daha doğru kalori hesabı elde edebilirsiniz.',
      targetSelector: '[data-tutorial="cooking-method"]',
      position: 'top'
    },
    {
      id: 'save-button',
      title: 'Kaydet',
      description: 'Tüm bilgileri girdikten sonra bu butonla yemeğinizi günlük kaydınıza ekleyebilirsiniz.',
      targetSelector: '[data-tutorial="save-button"]',
      position: 'top'
    }
  ],

  profile_setup: [
    {
      id: 'body-info',
      title: 'Vücut Bilgileri',
      description: 'Yaş, kilo, boy ve cinsiyet bilgilerinizi buradan güncelleyebilirsiniz.',
      targetSelector: '[data-tutorial="body-info"]',
      position: 'bottom'
    },
    {
      id: 'goal-settings',
      title: 'Hedef Ayarları',
      description: 'Kilo verme, koruma veya alma hedefinizi seçerek kalori hedefinizi belirleyin.',
      targetSelector: '[data-tutorial="goal-settings"]',
      position: 'top'
    },
    {
      id: 'save-profile',
      title: 'Profili Kaydet',
      description: 'Tüm bilgileri girdikten sonra bu butonla profilinizi kaydedin.',
      targetSelector: '[data-tutorial="save-profile"]',
      position: 'top'
    }
  ]
}