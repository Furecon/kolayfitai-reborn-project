import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { notificationManager, ExtendedUserPreferences } from '@/lib/notificationManager'
import { Bell, Clock, Moon, Calendar } from 'lucide-react'

export function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<ExtendedUserPreferences | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const prefs = await notificationManager.getUserPreferences(user.id)

      if (!prefs) {
        const defaultPrefs: ExtendedUserPreferences = {
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
        setPreferences(defaultPrefs)
      } else {
        setPreferences(prefs)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast({
        title: 'Hata',
        description: 'Bildirim ayarları yüklenemedi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await notificationManager.updateUserPreferences(user.id, preferences)

      toast({
        title: 'Başarılı',
        description: 'Bildirim ayarlarınız kaydedildi'
      })
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationSetting = (key: keyof typeof preferences.notification_settings, value: boolean) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        [key]: value
      }
    })
  }

  const updateReminderTime = (meal: keyof typeof preferences.reminder_times, time: string) => {
    if (!preferences) return
    setPreferences({
      ...preferences,
      reminder_times: {
        ...preferences.reminder_times,
        [meal]: time
      }
    })
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(time)
      }
    }
    return options
  }

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bildirim Ayarları</CardTitle>
          <CardDescription>Yükleniyor...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Bildirim Tercihleri</CardTitle>
          </div>
          <CardDescription>
            Günde maksimum 3-4 bildirim alacaksınız
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="meal-reminders">Öğün Hatırlatmaları</Label>
              <p className="text-sm text-muted-foreground">
                Seçtiğiniz öğün için günde 1 hatırlatma
              </p>
            </div>
            <Switch
              id="meal-reminders"
              checked={preferences.notification_settings.meal_reminders}
              onCheckedChange={(checked) => updateNotificationSetting('meal_reminders', checked)}
            />
          </div>

          {preferences.notification_settings.meal_reminders && (
            <div className="ml-6 space-y-4 border-l-2 pl-4">
              <div className="space-y-2">
                <Label>Hangi öğün için hatırlatma istiyorsunuz?</Label>
                <Select
                  value={preferences.primary_meal_reminder}
                  onValueChange={(value: any) => setPreferences({ ...preferences, primary_meal_reminder: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Kahvaltı ({preferences.reminder_times.breakfast})</SelectItem>
                    <SelectItem value="lunch">Öğle Yemeği ({preferences.reminder_times.lunch})</SelectItem>
                    <SelectItem value="dinner">Akşam Yemeği ({preferences.reminder_times.dinner})</SelectItem>
                    <SelectItem value="none">Hiçbiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Öğün Saatleri</Label>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kahvaltı</span>
                    <Select
                      value={preferences.reminder_times.breakfast}
                      onValueChange={(value) => updateReminderTime('breakfast', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Öğle</span>
                    <Select
                      value={preferences.reminder_times.lunch}
                      onValueChange={(value) => updateReminderTime('lunch', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Akşam</span>
                    <Select
                      value={preferences.reminder_times.dinner}
                      onValueChange={(value) => updateReminderTime('dinner', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {generateTimeOptions().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="water-reminders">Su İçme Hatırlatması</Label>
              <p className="text-sm text-muted-foreground">
                Öğleden sonra tek bir hatırlatma
              </p>
            </div>
            <Switch
              id="water-reminders"
              checked={preferences.notification_settings.water_reminders}
              onCheckedChange={(checked) => updateNotificationSetting('water_reminders', checked)}
            />
          </div>

          {preferences.notification_settings.water_reminders && (
            <div className="ml-6 space-y-2 border-l-2 pl-4">
              <Label>Su hatırlatma saati</Label>
              <Select
                value={preferences.reminder_times.water_time}
                onValueChange={(value) => updateReminderTime('water_time', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="goal-notifications">Hedef Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Kalori hedeflerinde önemli durumlar
              </p>
            </div>
            <Switch
              id="goal-notifications"
              checked={preferences.notification_settings.goal_notifications}
              onCheckedChange={(checked) => updateNotificationSetting('goal_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-summary">Haftalık Özet</Label>
              <p className="text-sm text-muted-foreground">
                Pazar akşamları ilerleme raporu
              </p>
            </div>
            <Switch
              id="weekly-summary"
              checked={preferences.notification_settings.weekly_summary}
              onCheckedChange={(checked) => updateNotificationSetting('weekly_summary', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Sessiz Saatler</CardTitle>
          </div>
          <CardDescription>
            Bu saatler arasında bildirim almayacaksınız
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Başlangıç</Label>
            <Select
              value={preferences.quiet_hours_start}
              onValueChange={(value) => setPreferences({ ...preferences, quiet_hours_start: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateTimeOptions().map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Bitiş</Label>
            <Select
              value={preferences.quiet_hours_end}
              onValueChange={(value) => setPreferences({ ...preferences, quiet_hours_end: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateTimeOptions().map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Hafta Sonu Ayarları</CardTitle>
          </div>
          <CardDescription>
            Cumartesi ve Pazar için bildirim tercihleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekend-notifications">Hafta Sonu Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Hafta sonları da bildirim almak istiyorum
              </p>
            </div>
            <Switch
              id="weekend-notifications"
              checked={preferences.weekend_notifications_enabled}
              onCheckedChange={(checked) => setPreferences({ ...preferences, weekend_notifications_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={loadPreferences} disabled={saving}>
          İptal
        </Button>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
