import { supabase } from '@/integrations/supabase/client'
import { simpleImageHash, isSimilarImage } from '@/lib/imageHash'

interface CachedAnalysis {
  id: string
  image_hash: string
  detected_foods: any[]
  confidence: number
  suggestions: string
  hit_count: number
}

interface AnalysisResult {
  detectedFoods: any[]
  confidence: number
  suggestions: string
  fromCache?: boolean
  cacheId?: string
}

export class AnalysisCacheService {
  static async findSimilarAnalysis(
    imageDataUrl: string,
    analysisType: 'quick' | 'detailed',
    imageSize: number
  ): Promise<AnalysisResult | null> {
    try {
      const imageHash = await simpleImageHash(imageDataUrl)

      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) return null

      const { data: cacheEntries, error } = await supabase
        .from('analysis_cache')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('analysis_type', analysisType)
        .eq('image_size', imageSize)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (error || !cacheEntries || cacheEntries.length === 0) {
        return null
      }

      for (const entry of cacheEntries) {
        if (isSimilarImage(imageHash, entry.image_hash, 5)) {
          await this.incrementHitCount(entry.id)

          return {
            detectedFoods: entry.detected_foods,
            confidence: entry.confidence,
            suggestions: entry.suggestions || '',
            fromCache: true,
            cacheId: entry.id
          }
        }
      }

      return null
    } catch (error) {
      console.error('Error finding similar analysis:', error)
      return null
    }
  }

  static async saveAnalysis(
    imageDataUrl: string,
    analysisType: 'quick' | 'detailed',
    imageSize: number,
    result: {
      detectedFoods: any[]
      confidence: number
      suggestions: string
    }
  ): Promise<void> {
    try {
      const imageHash = await simpleImageHash(imageDataUrl)

      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) return

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const { error } = await supabase.from('analysis_cache').insert({
        user_id: user.user.id,
        image_hash: imageHash,
        image_size: imageSize,
        analysis_type: analysisType,
        detected_foods: result.detectedFoods,
        confidence: result.confidence,
        suggestions: result.suggestions,
        expires_at: expiresAt.toISOString()
      })

      if (error) {
        console.error('Error saving analysis to cache:', error)
      }
    } catch (error) {
      console.error('Error in saveAnalysis:', error)
    }
  }

  static async incrementHitCount(cacheId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_cache_hit', {
        cache_id: cacheId
      })

      if (error) {
        const { error: updateError } = await supabase
          .from('analysis_cache')
          .update({
            hit_count: supabase.raw('hit_count + 1'),
            last_used_at: new Date().toISOString()
          })
          .eq('id', cacheId)

        if (updateError) {
          console.error('Error incrementing hit count:', updateError)
        }
      }
    } catch (error) {
      console.error('Error in incrementHitCount:', error)
    }
  }

  static async clearExpiredCache(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) return

      await supabase
        .from('analysis_cache')
        .delete()
        .eq('user_id', user.user.id)
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Error clearing expired cache:', error)
    }
  }
}
