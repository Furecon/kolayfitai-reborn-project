import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import { supabase } from '@/integrations/supabase/client'

export interface NotificationPreferences {
  meal_reminders: boolean
  water_reminders: boolean
  calorie_notifications: boolean
  exercise_suggestions: boolean
}

export interface ReminderTimes {
  breakfast: string
  lunch: string
  dinner: string
  water_intervals: number // hours
}

export class NotificationManager {
  private static instance: NotificationManager
  private isSupported: boolean = false

  private constructor() {
    this.checkSupport()
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private async checkSupport() {
    if (Capacitor.isNativePlatform()) {
      this.isSupported = true
      await this.requestPermissions()
    }
  }

  private async requestPermissions() {
    try {
      const permissionStatus = await LocalNotifications.requestPermissions()
      return permissionStatus.display === 'granted'
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      return false
    }
  }

  async scheduleNotification(
    id: number,
    title: string,
    body: string,
    at: Date,
    extra?: any
  ) {
    if (!this.isSupported) {
      console.log('Notifications not supported on this platform')
      return
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: id.toString(),
            title,
            body,
            schedule: { at },
            extra,
            actionTypeId: 'meal_reminder',
            attachments: [],
            sound: 'default',
          }
        ]
      })
    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  async cancelNotification(id: number) {
    if (!this.isSupported) return

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: id.toString() }]
      })
    } catch (error) {
      console.error('Error canceling notification:', error)
    }
  }

  async cancelAllNotifications() {
    if (!this.isSupported) return

    try {
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id }))
        })
      }
    } catch (error) {
      console.error('Error canceling all notifications:', error)
    }
  }

  async setupMealReminders(userId: string, preferences: NotificationPreferences, times: ReminderTimes) {
    if (!preferences.meal_reminders) return

    // Cancel existing meal reminders
    await this.cancelNotificationsRange(1000, 1099)

    const mealTimes = [
      { time: times.breakfast, meal: 'Kahvaltı', id: 1001 },
      { time: times.lunch, meal: 'Öğle Yemeği', id: 1002 },
      { time: times.dinner, meal: 'Akşam Yemeği', id: 1003 }
    ]

    for (const meal of mealTimes) {
      const [hours, minutes] = meal.time.split(':').map(Number)
      
      // Schedule for today and next 7 days
      for (let day = 0; day < 7; day++) {
        const scheduleTime = new Date()
        scheduleTime.setDate(scheduleTime.getDate() + day)
        scheduleTime.setHours(hours, minutes, 0, 0)

        // Skip if time has already passed today
        if (day === 0 && scheduleTime < new Date()) continue

        await this.scheduleNotification(
          meal.id + day,
          `${meal.meal} Zamanı! 🍽️`,
          'Öğününüzü kaydederek kalori takibinizi sürdürün',
          scheduleTime,
          { type: 'meal_reminder', meal: meal.meal.toLowerCase() }
        )
      }
    }
  }

  async setupWaterReminders(userId: string, preferences: NotificationPreferences, times: ReminderTimes) {
    if (!preferences.water_reminders) return

    // Cancel existing water reminders
    await this.cancelNotificationsRange(2000, 2099)

    const intervalHours = times.water_intervals
    const startHour = 8 // Start at 8 AM
    const endHour = 22 // End at 10 PM
    
    let notificationId = 2000

    for (let day = 0; day < 7; day++) {
      for (let hour = startHour; hour <= endHour; hour += intervalHours) {
        const scheduleTime = new Date()
        scheduleTime.setDate(scheduleTime.getDate() + day)
        scheduleTime.setHours(hour, 0, 0, 0)

        // Skip if time has already passed today
        if (day === 0 && scheduleTime < new Date()) continue

        await this.scheduleNotification(
          notificationId++,
          'Su İçme Zamanı! 💧',
          'Günlük su hedefine ulaşmak için bir bardak su için',
          scheduleTime,
          { type: 'water_reminder' }
        )
      }
    }
  }

  async checkDailyGoals(userId: string, preferences: NotificationPreferences) {
    if (!preferences.calorie_notifications) return

    try {
      // Get today's meals and user profile
      const today = new Date().toISOString().split('T')[0]
      
      const [mealsResult, profileResult] = await Promise.all([
        supabase
          .from('meal_logs')
          .select('total_calories')
          .eq('user_id', userId)
          .eq('date', today),
        supabase
          .from('profiles')
          .select('daily_calorie_goal')
          .eq('user_id', userId)
          .single()
      ])

      if (mealsResult.error || profileResult.error) return

      const totalCalories = mealsResult.data.reduce((sum, meal) => sum + meal.total_calories, 0)
      const calorieGoal = profileResult.data.daily_calorie_goal || 2000

      const caloriePercentage = (totalCalories / calorieGoal) * 100

      // Check if significantly under goal (less than 50% by 8 PM)
      const now = new Date()
      if (now.getHours() >= 20 && caloriePercentage < 50) {
        await this.scheduleNotification(
          3001,
          'Kalori Hedefinden Geride Kalıyorsunuz! ⚠️',
          `Günlük hedefinizin sadece %${Math.round(caloriePercentage)}'ına ulaştınız`,
          new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes from now
          { type: 'calorie_alert', percentage: caloriePercentage }
        )
      }

      // Check if over goal
      if (caloriePercentage > 120) {
        await this.scheduleNotification(
          3002,
          'Kalori Hedefini Aştınız! 🎯',
          'Yarın daha dikkatli olarak hedefine uyabilirsin',
          new Date(now.getTime() + 5 * 60 * 1000),
          { type: 'calorie_alert', percentage: caloriePercentage }
        )
      }

    } catch (error) {
      console.error('Error checking daily goals:', error)
    }
  }

  async scheduleExerciseSuggestion(userId: string, preferences: NotificationPreferences) {
    if (!preferences.exercise_suggestions) return

    try {
      // Get user's activity level
      const { data: profile } = await supabase
        .from('profiles')
        .select('activity_level')
        .eq('user_id', userId)
        .single()

      if (!profile) return

      const exerciseSuggestions = [
        '10 dakika yürüyüş yapın 🚶‍♀️',
        '5 dakika stretching yapın 🧘‍♀️',
        'Merdiven çıkın asansör yerine 🏃‍♀️',
        '10 squat yapın 💪',
        'Derin nefes egzersizi yapın 🌬️'
      ]

      const randomSuggestion = exerciseSuggestions[Math.floor(Math.random() * exerciseSuggestions.length)]

      // Schedule for tomorrow at 3 PM
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(15, 0, 0, 0)

      await this.scheduleNotification(
        4001,
        'Egzersiz Önerisi! 🏃‍♀️',
        randomSuggestion,
        tomorrow,
        { type: 'exercise_suggestion' }
      )

    } catch (error) {
      console.error('Error scheduling exercise suggestion:', error)
    }
  }

  private async cancelNotificationsRange(startId: number, endId: number) {
    if (!this.isSupported) return

    try {
      const pending = await LocalNotifications.getPending()
      const toCancel = pending.notifications
        .filter(n => {
          const id = parseInt(n.id)
          return id >= startId && id <= endId
        })
        .map(n => ({ id: n.id }))

      if (toCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: toCancel })
      }
    } catch (error) {
      console.error('Error canceling notification range:', error)
    }
  }

  async getUserPreferences(userId: string): Promise<{ preferences: NotificationPreferences, times: ReminderTimes } | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_settings, reminder_times')
        .eq('user_id', userId)
        .single()

      if (error || !data) return null

      return {
        preferences: data.notification_settings as unknown as NotificationPreferences,
        times: data.reminder_times as unknown as ReminderTimes
      }
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  async updateUserPreferences(
    userId: string, 
    preferences: NotificationPreferences, 
    times: ReminderTimes
  ) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert([{
          user_id: userId,
          notification_settings: preferences as any,
          reminder_times: times as any
        }])

      if (error) throw error

      // Reschedule notifications based on new preferences
      await this.rescheduleAllNotifications(userId, preferences, times)

    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  private async rescheduleAllNotifications(
    userId: string, 
    preferences: NotificationPreferences, 
    times: ReminderTimes
  ) {
    // Cancel all existing notifications
    await this.cancelAllNotifications()

    // Setup new notifications based on preferences
    await Promise.all([
      this.setupMealReminders(userId, preferences, times),
      this.setupWaterReminders(userId, preferences, times),
      this.scheduleExerciseSuggestion(userId, preferences)
    ])
  }
}

export const notificationManager = NotificationManager.getInstance()