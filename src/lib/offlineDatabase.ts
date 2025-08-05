import Dexie, { type EntityTable } from 'dexie'

// Define interfaces for offline data
interface OfflineMealLog {
  id: string
  user_id: string
  meal_type: string
  date: string
  food_items: any[]
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  photo_url?: string
  notes?: string
  created_at: string
  synced: boolean
}

interface OfflineFood {
  id: string
  name: string
  name_en?: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  category?: string
}

interface OfflineProfile {
  id: string
  user_id: string
  name?: string
  age?: number
  weight?: number
  height?: number
  gender?: string
  activity_level?: string
  daily_calorie_goal?: number
  daily_protein_goal?: number
  daily_carbs_goal?: number
  daily_fat_goal?: number
  onboarding_completed: boolean
  synced: boolean
}

interface SyncAction {
  id?: string
  table_name: string
  action_type: 'insert' | 'update' | 'delete'
  data: any
  created_at: string
}

// Define the offline database
class OfflineDatabase extends Dexie {
  meal_logs!: EntityTable<OfflineMealLog, 'id'>
  foods!: EntityTable<OfflineFood, 'id'>
  profiles!: EntityTable<OfflineProfile, 'id'>
  sync_actions!: EntityTable<SyncAction, 'id'>

  constructor() {
    super('KolayFitOfflineDB')

    this.version(1).stores({
      meal_logs: 'id, user_id, date, meal_type, synced',
      foods: 'id, name, name_en, category',
      profiles: 'id, user_id, synced',
      sync_actions: '++id, table_name, action_type, created_at'
    })
  }
}

export const offlineDB = new OfflineDatabase()

// Offline manager class
export class OfflineManager {
  private static instance: OfflineManager
  private isOnline: boolean = navigator.onLine

  private constructor() {
    this.setupOnlineStatusListeners()
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  private setupOnlineStatusListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingActions()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Cache data when online
  async cacheFoods(foods: any[]) {
    await offlineDB.foods.bulkPut(foods.map(food => ({
      ...food,
      id: food.id
    })))
  }

  async cacheProfile(profile: any) {
    await offlineDB.profiles.put({
      ...profile,
      synced: true
    })
  }

  async cacheMealLogs(mealLogs: any[]) {
    await offlineDB.meal_logs.bulkPut(mealLogs.map(log => ({
      ...log,
      synced: true
    })))
  }

  // Get cached data when offline
  async getCachedFoods(searchTerm?: string): Promise<OfflineFood[]> {
    if (searchTerm) {
      return await offlineDB.foods
        .filter(food => 
          food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (food.name_en && food.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .limit(20)
        .toArray()
    }
    return await offlineDB.foods.limit(100).toArray()
  }

  async getCachedProfile(userId: string): Promise<OfflineProfile | undefined> {
    return await offlineDB.profiles.where('user_id').equals(userId).first()
  }

  async getCachedMealLogs(userId: string, date?: string): Promise<OfflineMealLog[]> {
    let query = offlineDB.meal_logs.where('user_id').equals(userId)
    
    if (date) {
      query = query.and(log => log.date === date)
    }
    
    return await query.toArray()
  }

  // Add offline actions for later sync
  async addOfflineAction(tableName: string, actionType: 'insert' | 'update' | 'delete', data: any) {
    await offlineDB.sync_actions.add({
      table_name: tableName,
      action_type: actionType,
      data,
      created_at: new Date().toISOString()
    })

    // If it's a meal log, add to offline storage immediately
    if (tableName === 'meal_logs') {
      await offlineDB.meal_logs.put({
        ...data,
        synced: false
      })
    } else if (tableName === 'profiles') {
      await offlineDB.profiles.put({
        ...data,
        synced: false
      })
    }
  }

  // Sync pending actions when back online
  async syncPendingActions() {
    if (!this.isOnline) return

    const pendingActions = await offlineDB.sync_actions.toArray()
    
    for (const action of pendingActions) {
      try {
        // Import supabase client here to avoid circular imports
        const { supabase } = await import('@/integrations/supabase/client')
        
        switch (action.action_type) {
          case 'insert':
            if (action.table_name === 'meal_logs') {
              await supabase.from('meal_logs').insert(action.data)
            } else if (action.table_name === 'profiles') {
              await supabase.from('profiles').insert(action.data)
            }
            break
          case 'update':
            if (action.table_name === 'meal_logs') {
              await supabase.from('meal_logs')
                .update(action.data)
                .eq('id', action.data.id)
            } else if (action.table_name === 'profiles') {
              await supabase.from('profiles')
                .update(action.data)
                .eq('id', action.data.id)
            }
            break
          case 'delete':
            if (action.table_name === 'meal_logs') {
              await supabase.from('meal_logs')
                .delete()
                .eq('id', action.data.id)
            } else if (action.table_name === 'profiles') {
              await supabase.from('profiles')
                .delete()
                .eq('id', action.data.id)
            }
            break
        }

        // Mark as synced in offline storage
        if (action.table_name === 'meal_logs') {
          await offlineDB.meal_logs.update(action.data.id, { synced: true })
        } else if (action.table_name === 'profiles') {
          await offlineDB.profiles.update(action.data.id, { synced: true })
        }

        // Remove from sync queue
        await offlineDB.sync_actions.delete(action.id!)
        
      } catch (error) {
        console.error('Sync failed for action:', action, error)
      }
    }

    // Show sync notification
    this.showSyncNotification()
  }

  private showSyncNotification() {
    // Import toast here to avoid circular imports
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: "Veriler senkronize edildi",
        description: "Çevrimdışı değişiklikler başarıyla kaydedildi",
      })
    })
  }

  isOffline(): boolean {
    return !this.isOnline
  }

  async clearCache() {
    await offlineDB.delete()
    await offlineDB.open()
  }
}

export const offlineManager = OfflineManager.getInstance()