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
      id: 'camera-button',
      title: 'Fotoğraf ile Yemek Tanıma',
      description: 'Buradan fotoğraf çekerek yemeklerinizi kolayca tanıyabilir ve kalorilerini hesaplayabilirsiniz.',
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom'
    },
    {
      id: 'macro-charts',
      title: 'Makro Takibi',
      description: 'Günlük makro değerlerinizi (protein, karbonhidrat, yağ) çember grafiklerle takip edebilirsiniz.',
      targetSelector: '[data-tutorial="macro-charts"]',
      position: 'top'
    },
    {
      id: 'meal-history',
      title: 'Öğün Geçmişi',
      description: 'Bugün eklediğiniz tüm öğünleri burada görebilir ve düzenleyebilirsiniz.',
      targetSelector: '[data-tutorial="meal-history"]',
      position: 'top'
    },
    {
      id: 'calorie-cards',
      title: 'Kalori Takibi',
      description: 'Günlük kalori hedefinize ne kadar yakın olduğunuzu burada görebilirsiniz.',
      targetSelector: '[data-tutorial="calorie-cards"]',
      position: 'bottom'
    }
  ],

  food_analysis: [
    {
      id: 'analysis-options',
      title: 'Analiz Seçenekleri',
      description: 'Fotoğraf çekerek otomatik analiz yapabilir veya manuel olarak yemek ekleyebilirsiniz.',
      targetSelector: '[data-tutorial="analysis-options"]',
      position: 'bottom'
    },
    {
      id: 'camera-capture',
      title: 'Fotoğraf Çekme',
      description: 'Bu butona tıklayarak yemeğinizin fotoğrafını çekin. AI otomatik olarak analiz edecek.',
      targetSelector: '[data-tutorial="camera-capture"]',
      position: 'top'
    },
    {
      id: 'manual-entry',
      title: 'Manuel Giriş',
      description: 'Yemek adını yazarak veya veritabanından arayarak manuel olarak da yemek ekleyebilirsiniz.',
      targetSelector: '[data-tutorial="manual-entry"]',
      position: 'top'
    }
  ],

  photo_recognition: [
    {
      id: 'camera-button',
      title: 'Fotoğraf Çek',
      description: 'Bu butona tıklayarak yemeğinizin fotoğrafını çekin.',
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom'
    },
    {
      id: 'analysis-quick',
      title: 'Hızlı Analiz',
      description: 'AI tarafından otomatik analiz edilecek ve kalori tahmininde bulunulacak.',
      targetSelector: '[data-tutorial="analysis-quick"]',
      position: 'top'
    },
    {
      id: 'analysis-detailed',
      title: 'Detaylı Analiz',
      description: 'Porsiyon ve pişirme yöntemi gibi ek bilgiler ekleyerek daha hassas analiz yapabilirsiniz.',
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
      description: 'Yaş, kilo, boy bilgilerinizi güncelleyerek daha doğru kalori hesabı alabilirsiniz.',
      targetSelector: '[data-tutorial="body-info"]',
      position: 'bottom'
    },
    {
      id: 'goal-settings',
      title: 'Hedef Ayarları',
      description: 'Kilo verme, koruma veya alma hedefinizi seçerek kalori hedefiniz otomatik hesaplanır.',
      targetSelector: '[data-tutorial="goal-settings"]',
      position: 'top'
    },
    {
      id: 'subscription-info',
      title: 'Abonelik Bilgileri',
      description: 'Premium özelliklerinizi ve abonelik durumunuzu buradan takip edebilirsiniz.',
      targetSelector: '[data-tutorial="subscription-info"]',
      position: 'top'
    }
  ]
}