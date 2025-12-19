export type TutorialTrigger = 'first_login' | 'first_time_feature' | 'manual'
export type PointerType = 'finger' | 'arrow' | 'none'
export type PlacementType = 'top' | 'bottom' | 'left' | 'right'
export type TutorialStatus = 'never_shown' | 'shown' | 'completed' | 'skipped' | 'disabled'

export interface TutorialStep {
  stepId: string
  targetKey: string
  pointer: PointerType
  placement: PlacementType
  title: string
  bodyTr: string
  bodyEn: string
}

export interface Tutorial {
  featureId: string
  title: string
  trigger: TutorialTrigger
  steps: TutorialStep[]
}

export interface TutorialSettings {
  overlayOpacity: number
  animation: {
    tooltip: string
    pointer: string
    spotlight: string
  }
  controls: {
    showSkip: boolean
    showDontShowAgain: boolean
    primaryNext: string
    primaryDone: string
    skip: string
  }
  storageKey: string
}

export interface TutorialConfig {
  settings: TutorialSettings
  tutorials: Tutorial[]
}

export const tutorialConfig: TutorialConfig = {
  settings: {
    overlayOpacity: 0.65,
    animation: {
      tooltip: 'fade-slide-up',
      pointer: 'pulse',
      spotlight: 'smooth'
    },
    controls: {
      showSkip: true,
      showDontShowAgain: true,
      primaryNext: 'Devam',
      primaryDone: 'Başla',
      skip: 'Atla'
    },
    storageKey: 'tutorial_state_v1'
  },
  tutorials: [
    {
      featureId: 'first_login_walkthrough',
      title: 'Hoş geldin',
      trigger: 'first_login',
      steps: [
        {
          stepId: 's1',
          targetKey: 'AddMealButton',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Yemek ekleyerek başla',
          bodyTr: 'Fotoğraf çek veya galeriden yükle.',
          bodyEn: 'Take a photo or upload from gallery.'
        },
        {
          stepId: 's2',
          targetKey: 'MacroRings',
          pointer: 'arrow',
          placement: 'top',
          title: 'Makrolarını takip et',
          bodyTr: 'Protein/karb/yağ durumunu burada görürsün.',
          bodyEn: 'Track your protein/carbs/fat status here.'
        },
        {
          stepId: 's3',
          targetKey: 'WaterWidget',
          pointer: 'arrow',
          placement: 'top',
          title: 'Su hedefini unutma',
          bodyTr: 'Günlük su takibini buradan yap.',
          bodyEn: 'Track your daily water intake here.'
        },
        {
          stepId: 's4',
          targetKey: 'HistoryTab',
          pointer: 'finger',
          placement: 'top',
          title: 'Geçmiş öğünler',
          bodyTr: 'Eski kayıtlarına hızlıca dön.',
          bodyEn: 'Quickly access your past records.'
        },
        {
          stepId: 's5',
          targetKey: 'SettingsButton',
          pointer: 'finger',
          placement: 'left',
          title: 'Ayarlar & hedefler',
          bodyTr: 'Profilini ve hedeflerini düzenle.',
          bodyEn: 'Edit your profile and goals.'
        }
      ]
    },
    {
      featureId: 'add_meal',
      title: 'Yemek Ekleme',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'AddMealButton',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Yemeğini ekle',
          bodyTr: 'Fotoğraf çek veya galeriden yükle.',
          bodyEn: 'Take a photo or upload from gallery.'
        },
        {
          stepId: 's2',
          targetKey: 'ManualEntryLink',
          pointer: 'arrow',
          placement: 'top',
          title: 'Manuel giriş',
          bodyTr: 'Tanıma olmazsa elle ekleyebilirsin.',
          bodyEn: 'If recognition fails, you can add manually.'
        }
      ]
    },
    {
      featureId: 'analysis_choice',
      title: 'Analiz Seçimi',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'NormalAnalysisCard',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Normal Analiz',
          bodyTr: 'Hızlı sonuç için bunu seç.',
          bodyEn: 'Choose this for quick results.'
        },
        {
          stepId: 's2',
          targetKey: 'DetailedAnalysisCard',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Detaylı Analiz',
          bodyTr: 'Daha ayrıntılı makrolar için bunu seç.',
          bodyEn: 'Choose this for detailed macros.'
        }
      ]
    },
    {
      featureId: 'macro_screen',
      title: 'Makro Ekranı',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'MacroRings',
          pointer: 'arrow',
          placement: 'top',
          title: 'Makrolar burada',
          bodyTr: 'Günlük hedef ve tüketimini takip et.',
          bodyEn: 'Track your daily goal and consumption.'
        },
        {
          stepId: 's2',
          targetKey: 'RemainingCalories',
          pointer: 'arrow',
          placement: 'top',
          title: 'Kalan kalori',
          bodyTr: 'Gün içinde ne kadar hakkın kaldığını gör.',
          bodyEn: 'See how much you have left for the day.'
        }
      ]
    },
    {
      featureId: 'meal_history',
      title: 'Geçmiş Öğünler',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'HistoryTab',
          pointer: 'finger',
          placement: 'top',
          title: 'Geçmiş öğünler',
          bodyTr: 'Daha önce eklediklerini burada gör.',
          bodyEn: 'See what you added before.'
        },
        {
          stepId: 's2',
          targetKey: 'HistoryFilter',
          pointer: 'arrow',
          placement: 'bottom',
          title: 'Filtrele',
          bodyTr: 'Tarihe veya öğüne göre hızlıca bul.',
          bodyEn: 'Quickly find by date or meal type.'
        },
        {
          stepId: 's3',
          targetKey: 'HistoryMealItem',
          pointer: 'arrow',
          placement: 'top',
          title: 'Detaya gir',
          bodyTr: 'Bir öğüne dokun, detayları incele.',
          bodyEn: 'Tap a meal to view details.'
        }
      ]
    },
    {
      featureId: 'settings_profile',
      title: 'Ayarlar',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'SettingsButton',
          pointer: 'finger',
          placement: 'left',
          title: 'Ayarlar',
          bodyTr: 'Profilini ve hedeflerini yönet.',
          bodyEn: 'Manage your profile and goals.'
        },
        {
          stepId: 's2',
          targetKey: 'BodyInfoSection',
          pointer: 'arrow',
          placement: 'top',
          title: 'Vücut bilgileri',
          bodyTr: 'Kilo, boy, yaş ve hedeflerini güncelle.',
          bodyEn: 'Update weight, height, age and goals.'
        }
      ]
    },
    {
      featureId: 'subscription',
      title: 'Abonelik',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'PremiumBenefitsList',
          pointer: 'arrow',
          placement: 'top',
          title: 'Premium neler veriyor?',
          bodyTr: 'Detaylı analiz ve gelişmiş raporlar burada.',
          bodyEn: 'Detailed analysis and advanced reports here.'
        },
        {
          stepId: 's2',
          targetKey: 'SubscribeButton',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Abone ol',
          bodyTr: 'Planını seçip premium\'a geçebilirsin.',
          bodyEn: 'Choose your plan and go premium.'
        },
        {
          stepId: 's3',
          targetKey: 'RestorePurchases',
          pointer: 'arrow',
          placement: 'bottom',
          title: 'Satın almayı geri yükle',
          bodyTr: 'Cihaz değiştiyse buradan geri al.',
          bodyEn: 'Restore from here if you changed device.'
        }
      ]
    },
    {
      featureId: 'diet_plan',
      title: 'Diyet Planı',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'CreatePlanButton',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Plan oluştur',
          bodyTr: 'Hedefine göre kişisel plan başlat.',
          bodyEn: 'Start a personalized plan based on your goal.'
        },
        {
          stepId: 's2',
          targetKey: 'GoalSelector',
          pointer: 'arrow',
          placement: 'top',
          title: 'Hedef seç',
          bodyTr: 'Kilo verme, koruma veya alma hedefini belirle.',
          bodyEn: 'Set your weight loss, maintenance or gain goal.'
        },
        {
          stepId: 's3',
          targetKey: 'GeneratePlanCTA',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Planı üret',
          bodyTr: 'Seçimlerine göre planın hazırlansın.',
          bodyEn: 'Generate your plan based on selections.'
        }
      ]
    },
    {
      featureId: 'water_tracking',
      title: 'Su Takibi',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'WaterWidget',
          pointer: 'arrow',
          placement: 'top',
          title: 'Su takibi',
          bodyTr: 'Günlük su hedefini burada gör.',
          bodyEn: 'See your daily water goal here.'
        },
        {
          stepId: 's2',
          targetKey: 'AddWaterButton',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Su ekle',
          bodyTr: 'Bir bardak eklemek için dokun.',
          bodyEn: 'Tap to add a glass.'
        },
        {
          stepId: 's3',
          targetKey: 'WaterGoalSettings',
          pointer: 'arrow',
          placement: 'top',
          title: 'Hedefini ayarla',
          bodyTr: 'Günlük su hedefini kişiselleştir.',
          bodyEn: 'Customize your daily water goal.'
        }
      ]
    },
    {
      featureId: 'notifications',
      title: 'Bildirimler',
      trigger: 'first_time_feature',
      steps: [
        {
          stepId: 's1',
          targetKey: 'EnableNotificationsCTA',
          pointer: 'finger',
          placement: 'bottom',
          title: 'Bildirimleri aç',
          bodyTr: 'Su ve öğün hatırlatmalarını kaçırma.',
          bodyEn: 'Don\'t miss water and meal reminders.'
        },
        {
          stepId: 's2',
          targetKey: 'NotificationSchedule',
          pointer: 'arrow',
          placement: 'top',
          title: 'Saatleri seç',
          bodyTr: 'Hatırlatma saatlerini kendine göre ayarla.',
          bodyEn: 'Set reminder times for yourself.'
        },
        {
          stepId: 's3',
          targetKey: 'NotificationTypes',
          pointer: 'arrow',
          placement: 'top',
          title: 'Ne için bildirim?',
          bodyTr: 'Su, öğün ve hedef bildirimlerini seç.',
          bodyEn: 'Choose water, meal and goal notifications.'
        }
      ]
    }
  ]
}

export function getTutorialByFeatureId(featureId: string): Tutorial | undefined {
  return tutorialConfig.tutorials.find(t => t.featureId === featureId)
}

export function getAllTutorials(): Tutorial[] {
  return tutorialConfig.tutorials
}
