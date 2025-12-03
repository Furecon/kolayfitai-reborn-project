import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { supabase } from '@/integrations/supabase/client'

export interface NotificationPreferences {
  meal_reminders: boolean
  water_reminders: boolean
  goal_notifications: boolean
  weekly_summary: boolean
}

export interface MealReminders {
  breakfast: boolean
  lunch: boolean
  dinner: boolean
}

export interface WaterReminderTime {
  id: string
  time: string
}

export interface ExtendedUserPreferences {
  notification_settings: NotificationPreferences
  reminder_times: ReminderTimes
  meal_reminders_enabled?: MealReminders
  water_reminder_times?: WaterReminderTime[]
  water_reminder_interval?: number
  quiet_hours_start: string
  quiet_hours_end: string
  weekend_notifications_enabled: boolean
  primary_meal_reminder?: 'breakfast' | 'lunch' | 'dinner' | 'none'
  notification_interaction_count?: Record<string, number>
  last_notification_sent?: Record<string, string>
}

export interface ReminderTimes {
  breakfast: string
  lunch: string
  dinner: string
  water_time?: string
}

interface NotificationHistory {
  user_id: string
  notification_type: string
  title: string
  body: string
  scheduled_at: Date
  sent_at?: Date
  interacted_at?: Date
  interaction_type?: string
  was_dismissed: boolean
}

// Constants
const MAX_DAILY_NOTIFICATIONS = 20
const NOTIFICATION_COOLDOWN_HOURS = 1

export class NotificationManager {
  private static instance: NotificationManager
  private isSupported: boolean = false
  private dailyNotificationCount: number = 0
  private lastResetDate: string = ''

  private constructor() {
    this.checkSupport()
    this.setupNotificationListeners()
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  private async checkSupport() {
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Running on native platform, checking notification support')
      this.isSupported = true
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        console.warn('⚠️ Notification permissions not granted. Notifications will not work.')
      }
    } else {
      console.log('🌐 Running on web platform, notifications not supported')
    }
  }

  private async requestPermissions() {
    try {
      console.log('🔔 Requesting notification permissions...')
      const permissionStatus = await LocalNotifications.requestPermissions()
      console.log('🔔 Permission status:', permissionStatus)

      if (permissionStatus.display === 'granted') {
        console.log('✅ Notification permissions granted')

        // Create notification channel with sound and vibration
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({
            id: 'kolayfit_default',
            name: 'KolayFit Bildirimleri',
            description: 'Öğün ve su hatırlatmaları',
            importance: 5, // IMPORTANCE_HIGH
            sound: 'default', // Use system default notification sound
            vibration: true,
            visibility: 1, // PUBLIC
            lights: true,
            lightColor: '#4CAF50',
          })
          console.log('✅ Notification channel created with sound and vibration')
        }

        return true
      } else {
        console.warn('⚠️ Notification permissions denied:', permissionStatus.display)
        return false
      }
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error)
      return false
    }
  }

  private setupNotificationListeners() {
    if (!this.isSupported) return

    LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
      const userId = notification.notification.extra?.userId
      const notificationType = notification.notification.extra?.type

      if (userId && notificationType) {
        await this.trackNotificationInteraction(
          userId,
          notificationType,
          notification.actionId,
          false
        )
      }
    })

    LocalNotifications.addListener('localNotificationReceived', async (notification) => {
      const userId = notification.extra?.userId
      const notificationType = notification.extra?.type

      if (userId && notificationType) {
        await this.logNotificationSent(
          userId,
          notificationType,
          notification.title,
          notification.body
        )
      }
    })
  }

  private resetDailyCountIfNeeded() {
    const today = new Date().toISOString().split('T')[0]
    if (this.lastResetDate !== today) {
      this.dailyNotificationCount = 0
      this.lastResetDate = today
    }
  }

  private canSendNotification(): boolean {
    this.resetDailyCountIfNeeded()
    return this.dailyNotificationCount < MAX_DAILY_NOTIFICATIONS
  }

  private async isInQuietHours(userId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('quiet_hours_start, quiet_hours_end')
        .eq('user_id', userId)
        .maybeSingle()

      if (!data) return false

      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      const quietStart = data.quiet_hours_start || '22:00'
      const quietEnd = data.quiet_hours_end || '07:00'

      if (quietStart < quietEnd) {
        return currentTime >= quietStart || currentTime < quietEnd
      } else {
        return currentTime >= quietStart && currentTime < quietEnd
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error)
      return false
    }
  }

  private async isUserInApp(): Promise<boolean> {
    try {
      const state = await App.getState()
      return state.isActive
    } catch {
      return false
    }
  }

  private async shouldSendNotification(
    userId: string,
    notificationType: string
  ): Promise<boolean> {
    if (!this.canSendNotification()) return false
    if (await this.isInQuietHours(userId)) return false
    if (await this.isUserInApp()) return false

    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('last_notification_sent, notification_interaction_count')
        .eq('user_id', userId)
        .maybeSingle()

      if (!data) return true

      const lastSent = data.last_notification_sent?.[notificationType]
      if (lastSent) {
        const hoursSinceLastSent = (Date.now() - new Date(lastSent).getTime()) / (1000 * 60 * 60)
        if (hoursSinceLastSent < NOTIFICATION_COOLDOWN_HOURS) return false
      }

      const interactionCount = data.notification_interaction_count?.[notificationType] || 0
      if (interactionCount < -2) return false

      return true
    } catch (error) {
      console.error('Error checking notification eligibility:', error)
      return true
    }
  }

  private async scheduleNotification(
    id: number,
    title: string,
    body: string,
    at: Date,
    userId: string,
    notificationType: string,
    extra?: any
  ) {
    if (!this.isSupported) {
      console.log('🚫 Notifications not supported on this platform')
      return
    }

    // Don't check conditions during scheduling
    // Scheduled notifications will be evaluated when they actually trigger

    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('⚠️ Not on native platform, skipping notification scheduling')
        return
      }

      // Get user notification alert style preference
      const { data } = await supabase
        .from('user_preferences')
        .select('notification_alert_style')
        .eq('user_id', userId)
        .maybeSingle()

      const alertStyle = data?.notification_alert_style || 'both'

      console.log(`📅 Scheduling notification: ${notificationType} at ${at.toISOString()}`)
      console.log(`   ID: ${id}`)
      console.log(`   Title: ${title}`)
      console.log(`   Body: ${body}`)
      console.log(`   Alert Style: ${alertStyle}`)

      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at },
            extra: { ...extra, userId, type: notificationType },
            actionTypeId: notificationType,
            channelId: 'kolayfit_default',
            sound: alertStyle === 'vibrate' ? undefined : 'default',
            silent: alertStyle === 'vibrate',
            smallIcon: 'ic_stat_notifications',
            largeIcon: 'ic_launcher',
          }
        ]
      })

      console.log(`✅ Notification scheduled successfully:`, JSON.stringify(result))
      console.log(`   Type: ${notificationType}, ID: ${id}`)
      this.dailyNotificationCount++

      await this.updateLastNotificationSent(userId, notificationType)

      await this.logNotificationScheduled(userId, notificationType, title, body, at)

    } catch (error) {
      console.error('❌ Error scheduling notification:', error)
      console.error('   Error details:', JSON.stringify(error))
    }
  }

  async setupPrimaryMealReminder(userId: string, preferences: ExtendedUserPreferences) {
    if (!preferences.notification_settings.meal_reminders) {
      console.log('🍽️ Meal reminders disabled globally')
      return
    }

    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    if (isWeekend && !preferences.weekend_notifications_enabled) {
      console.log('📅 Weekend notifications disabled')
      return
    }

    await this.cancelNotificationsRange(1000, 1099)

    const mealConfig = {
      breakfast: { time: preferences.reminder_times.breakfast, label: 'Kahvaltı', emoji: '🌅', id: 1001 },
      lunch: { time: preferences.reminder_times.lunch, label: 'Öğle Yemeği', emoji: '🍽️', id: 1002 },
      dinner: { time: preferences.reminder_times.dinner, label: 'Akşam Yemeği', emoji: '🌙', id: 1003 }
    }

    const mealRemindersEnabled = preferences.meal_reminders_enabled || {
      breakfast: true,
      lunch: true,
      dinner: true
    }

    console.log('🍽️ Setting up meal reminders:', JSON.stringify({
      enabled: mealRemindersEnabled,
      times: preferences.reminder_times
    }))

    for (const [mealType, config] of Object.entries(mealConfig)) {
      const isEnabled = mealRemindersEnabled[mealType as keyof MealReminders]

      if (!isEnabled) {
        console.log(`   ⏭️ Skipping ${mealType} - disabled by user`)
        continue
      }

      const [hours, minutes] = config.time.split(':').map(Number)
      const scheduleTime = new Date()
      scheduleTime.setHours(hours, minutes, 0, 0)

      if (scheduleTime <= new Date()) {
        scheduleTime.setDate(scheduleTime.getDate() + 1)
      }

      console.log(`   📅 Scheduling ${mealType} for ${config.time}`)

      await this.scheduleNotification(
        config.id,
        `${config.emoji} ${config.label} Zamanı`,
        'Öğününüzü kaydederek günlük takibinizi yapın',
        scheduleTime,
        userId,
        'meal_reminder',
        { meal: mealType }
      )
    }
  }

  async setupWaterReminders(userId: string, preferences: ExtendedUserPreferences) {
    if (!preferences.notification_settings.water_reminders) {
      console.log('💧 Water reminders disabled')
      return
    }

    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    if (isWeekend && !preferences.weekend_notifications_enabled) {
      console.log('💧 Weekend - water reminders disabled')
      return
    }

    // Cancel all water reminder notifications
    await this.cancelNotificationsRange(2000, 2099)

    const waterProgress = await this.getWaterProgress(userId)
    if (waterProgress >= 0.8) {
      console.log('💧 Water goal mostly achieved, skipping reminders')
      return
    }

    // Get water reminder times from preferences
    const waterTimes = preferences.water_reminder_times || []

    if (waterTimes.length === 0) {
      console.log('💧 No water reminder times configured')
      return
    }

    console.log(`💧 Setting up ${waterTimes.length} water reminders`)

    const now = new Date()
    let notificationId = 2001

    for (const waterTime of waterTimes) {
      try {
        const [hours, minutes] = waterTime.time.split(':').map(Number)
        const scheduleTime = new Date()
        scheduleTime.setHours(hours, minutes, 0, 0)

        // Only schedule if time is in the future (today)
        // If time has passed today, schedule for tomorrow
        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1)
        }

        await this.scheduleNotification(
          notificationId++,
          '💧 Su İçmeyi Unutma',
          'Günlük su hedefiniz için bir bardak su için',
          scheduleTime,
          userId,
          'water_reminder'
        )
      } catch (error) {
        console.error(`💧 Error scheduling water reminder for ${waterTime.time}:`, error)
      }
    }
  }

  async checkAndSendGoalNotification(userId: string, preferences: ExtendedUserPreferences) {
    if (!preferences.notification_settings.goal_notifications) return

    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    if (isWeekend && !preferences.weekend_notifications_enabled) return

    try {
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
          .maybeSingle()
      ])

      if (mealsResult.error || profileResult.error || !profileResult.data) return

      const totalCalories = mealsResult.data?.reduce((sum, meal) => sum + (meal.total_calories || 0), 0) || 0
      const calorieGoal = profileResult.data.daily_calorie_goal || 2000
      const caloriePercentage = (totalCalories / calorieGoal) * 100

      const now = new Date()

      if (now.getHours() >= 20 && caloriePercentage < 40) {
        const scheduleTime = new Date(now.getTime() + 5 * 60 * 1000)
        await this.scheduleNotification(
          3001,
          'Hedefine Yaklaş',
          `Bugün hedefinizin %${Math.round(caloriePercentage)}'ına ulaştınız`,
          scheduleTime,
          userId,
          'goal_notification',
          { percentage: caloriePercentage }
        )
      }
    } catch (error) {
      console.error('Error checking daily goals:', error)
    }
  }

  async sendWeeklySummary(userId: string, preferences: ExtendedUserPreferences) {
    if (!preferences.notification_settings.weekly_summary) return

    const now = new Date()
    if (now.getDay() !== 0 || now.getHours() !== 19) return

    const scheduleTime = new Date(now.getTime() + 5 * 60 * 1000)

    await this.scheduleNotification(
      4001,
      'Haftalık İlerleme Raporu Hazır',
      'Bu haftaki başarılarınızı görmek için tıklayın',
      scheduleTime,
      userId,
      'weekly_summary'
    )
  }

  private async checkIfMealLogged(userId: string, mealType: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('meal_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('meal_type', mealType)
        .maybeSingle()

      return !error && !!data
    } catch {
      return false
    }
  }

  private async getWaterProgress(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('water_intake')
        .select('manual_intake_ml, daily_goal_ml')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (!data || !data.daily_goal_ml) return 0

      return data.manual_intake_ml / data.daily_goal_ml
    } catch {
      return 0
    }
  }

  private async updateLastNotificationSent(userId: string, notificationType: string) {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('last_notification_sent')
        .eq('user_id', userId)
        .maybeSingle()

      const lastSent = data?.last_notification_sent || {}
      lastSent[notificationType] = new Date().toISOString()

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          last_notification_sent: lastSent
        })
    } catch (error) {
      console.error('Error updating last notification sent:', error)
    }
  }

  private async trackNotificationInteraction(
    userId: string,
    notificationType: string,
    actionId: string,
    wasDismissed: boolean
  ) {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('notification_interaction_count')
        .eq('user_id', userId)
        .maybeSingle()

      const interactionCount = data?.notification_interaction_count || {}
      const currentCount = interactionCount[notificationType] || 0

      if (wasDismissed) {
        interactionCount[notificationType] = currentCount - 1
      } else {
        interactionCount[notificationType] = currentCount + 1
      }

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notification_interaction_count: interactionCount
        })

      await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          notification_type: notificationType,
          title: '',
          body: '',
          scheduled_at: new Date().toISOString(),
          interacted_at: new Date().toISOString(),
          interaction_type: actionId,
          was_dismissed: wasDismissed
        })
    } catch (error) {
      console.error('Error tracking notification interaction:', error)
    }
  }

  private async logNotificationScheduled(
    userId: string,
    notificationType: string,
    title: string,
    body: string,
    scheduledAt: Date
  ) {
    try {
      await supabase
        .from('notification_history')
        .insert({
          user_id: userId,
          notification_type: notificationType,
          title,
          body,
          scheduled_at: scheduledAt.toISOString()
        })
    } catch (error) {
      console.error('Error logging notification:', error)
    }
  }

  private async logNotificationSent(
    userId: string,
    notificationType: string,
    title: string,
    body: string
  ) {
    try {
      const { data } = await supabase
        .from('notification_history')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', notificationType)
        .eq('title', title)
        .is('sent_at', null)
        .order('scheduled_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        await supabase
          .from('notification_history')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', data.id)
      }
    } catch (error) {
      console.error('Error logging notification sent:', error)
    }
  }

  async cancelNotification(id: number) {
    if (!this.isSupported) return

    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
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

  private async cancelNotificationsRange(startId: number, endId: number) {
    if (!this.isSupported) return

    try {
      const pending = await LocalNotifications.getPending()
      const toCancel = pending.notifications
        .filter(n => {
          const id = typeof n.id === 'string' ? parseInt(n.id) : n.id
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

  async sendTestNotification(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.log('🚫 Notifications not supported on this platform')
      return false
    }

    try {
      // Check permissions
      const permissionStatus = await LocalNotifications.checkPermissions()
      if (permissionStatus.display !== 'granted') {
        console.warn('⚠️ No notification permissions')
        return false
      }

      // Schedule a test notification 5 seconds from now
      const scheduleTime = new Date(Date.now() + 5000)

      console.log('🧪 Scheduling test notification...')
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999,
            title: 'Test Bildirimi ✅',
            body: 'Bildirimler başarıyla çalışıyor!',
            schedule: { at: scheduleTime },
            extra: { userId, type: 'test' },
            sound: 'default',
          }
        ]
      })

      console.log('✅ Test notification scheduled for:', scheduleTime.toISOString())
      return true
    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      return false
    }
  }

  async getUserPreferences(userId: string): Promise<ExtendedUserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data) return null

      return {
        notification_settings: data.notification_settings as NotificationPreferences,
        reminder_times: data.reminder_times as ReminderTimes,
        water_reminder_times: data.water_reminder_times || [{ id: '1', time: '14:30' }],
        quiet_hours_start: data.quiet_hours_start || '22:00',
        quiet_hours_end: data.quiet_hours_end || '07:00',
        primary_meal_reminder: data.primary_meal_reminder || 'lunch',
        weekend_notifications_enabled: data.weekend_notifications_enabled ?? true,
        notification_interaction_count: data.notification_interaction_count || {},
        last_notification_sent: data.last_notification_sent || {}
      }
    } catch (error) {
      console.error('Error getting user preferences:', error)
      return null
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<ExtendedUserPreferences>) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        })

      if (error) throw error

      const fullPreferences = await this.getUserPreferences(userId)
      if (fullPreferences) {
        await this.rescheduleAllNotifications(userId, fullPreferences)
      }
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  private async rescheduleAllNotifications(userId: string, preferences: ExtendedUserPreferences) {
    await this.cancelAllNotifications()

    await Promise.all([
      this.setupPrimaryMealReminder(userId, preferences),
      this.setupWaterReminders(userId, preferences),
    ])
  }

  async initializeNotifications(userId: string) {
    console.log('🔔 Initializing notifications for user:', userId)

    // Check permissions first
    if (Capacitor.isNativePlatform()) {
      const permissionStatus = await LocalNotifications.checkPermissions()
      console.log('📋 Current permission status:', permissionStatus)

      if (permissionStatus.display !== 'granted') {
        console.warn('⚠️ Notifications not granted. Requesting permissions...')
        const newStatus = await this.requestPermissions()
        if (!newStatus) {
          console.error('❌ User denied notification permissions')
          return
        }
      }
    }

    const preferences = await this.getUserPreferences(userId)
    if (!preferences) {
      console.log('📝 No preferences found, creating defaults')
      const defaultPreferences: ExtendedUserPreferences = {
        notification_settings: {
          meal_reminders: true,
          water_reminders: true,
          goal_notifications: true,
          weekly_summary: true
        },
        reminder_times: {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '19:00',
          water_time: '14:30'
        },
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00',
        primary_meal_reminder: 'lunch',
        weekend_notifications_enabled: true,
        notification_interaction_count: {},
        last_notification_sent: {}
      }

      await this.updateUserPreferences(userId, defaultPreferences)
      return
    }

    console.log('✅ User preferences loaded, scheduling notifications')
    await this.rescheduleAllNotifications(userId, preferences)

    // Log pending notifications
    if (Capacitor.isNativePlatform()) {
      const pending = await LocalNotifications.getPending()
      console.log(`📊 Total pending notifications: ${pending.notifications.length}`)
      pending.notifications.forEach(n => {
        console.log(`   - ID: ${n.id}, Title: ${n.title}, Schedule: ${JSON.stringify(n.schedule)}`)
      })
    }
  }
}

export const notificationManager = NotificationManager.getInstance()
