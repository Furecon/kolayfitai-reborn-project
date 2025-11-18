import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { tutorials, TutorialScreen } from '@/components/Tutorial/tutorials'

interface TutorialContextType {
  isVisible: boolean
  currentScreen: TutorialScreen | null
  showTutorial: (screen: TutorialScreen) => void
  hideTutorial: () => void
  completeTutorial: (screen: TutorialScreen) => void
  isTutorialCompleted: (screen: TutorialScreen) => boolean
  tutorialsCompleted: Record<TutorialScreen, boolean>
  isTutorialSeen: boolean
  markTutorialAsSeen: () => void
  showTutorialManually: (screen: TutorialScreen) => void
  disableTutorialsPermanently: () => void
  areTutorialsDisabled: boolean
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

interface TutorialProviderProps {
  children: ReactNode
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<TutorialScreen | null>(null)
  const [tutorialsCompleted, setTutorialsCompleted] = useState<Record<TutorialScreen, boolean>>({
    dashboard: false,
    home: false,
    'ai-insights': false,
    progress: false,
    meals: false,
    settings: false,
    food_analysis: false,
    photo_recognition: false,
    detailed_analysis: false,
    profile_setup: false
  })
  const [isTutorialSeen, setIsTutorialSeen] = useState(false)
  const [areTutorialsDisabled, setAreTutorialsDisabled] = useState(false)

  // Fetch user's tutorial completion status
  useEffect(() => {
    if (user) {
      fetchTutorialStatus()
    }
  }, [user])

  const fetchTutorialStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tutorials_completed, tutorial_seen, tutorials_disabled')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      // Set tutorial seen status
      setIsTutorialSeen(data?.tutorial_seen || false)
      setAreTutorialsDisabled(data?.tutorials_disabled || false)

      if (data?.tutorials_completed && typeof data.tutorials_completed === 'object' && !Array.isArray(data.tutorials_completed)) {
        const tutorials = data.tutorials_completed as Record<string, any>
        setTutorialsCompleted({
          dashboard: tutorials.dashboard || false,
          home: tutorials.home || false,
          'ai-insights': tutorials['ai-insights'] || false,
          progress: tutorials.progress || false,
          meals: tutorials.meals || false,
          settings: tutorials.settings || false,
          food_analysis: tutorials.food_analysis || false,
          photo_recognition: tutorials.photo_recognition || false,
          detailed_analysis: tutorials.detailed_analysis || false,
          profile_setup: tutorials.profile_setup || false
        })
      }
    } catch (error) {
      console.error('Error fetching tutorial status:', error)
    }
  }

  const showTutorial = (screen: TutorialScreen) => {
    setCurrentScreen(screen)
    setIsVisible(true)
  }

  const hideTutorial = async () => {
    setIsVisible(false)
    setCurrentScreen(null)
    // Mark tutorial as seen when user closes/skips it
    if (!isTutorialSeen) {
      await markTutorialAsSeen()
    }
  }

  const markTutorialAsSeen = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tutorial_seen: true })
        .eq('user_id', user.id)

      if (error) throw error

      setIsTutorialSeen(true)
    } catch (error) {
      console.error('Error marking tutorial as seen:', error)
    }
  }

  const completeTutorial = async (screen: TutorialScreen) => {
    if (!user) return

    const updatedTutorials = {
      ...tutorialsCompleted,
      [screen]: true
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          tutorials_completed: updatedTutorials,
          tutorial_seen: true 
        })
        .eq('user_id', user.id)

      if (error) throw error

      setTutorialsCompleted(updatedTutorials)
      setIsTutorialSeen(true)
      hideTutorial()
    } catch (error) {
      console.error('Error updating tutorial status:', error)
    }
  }

  const isTutorialCompleted = (screen: TutorialScreen) => {
    return tutorialsCompleted[screen] || false
  }

  const showTutorialManually = (screen: TutorialScreen) => {
    setCurrentScreen(screen)
    setIsVisible(true)
  }

  const disableTutorialsPermanently = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          tutorials_disabled: true,
          tutorial_seen: true
        })
        .eq('user_id', user.id)

      if (error) throw error

      setAreTutorialsDisabled(true)
      setIsTutorialSeen(true)
      hideTutorial()
    } catch (error) {
      console.error('Error disabling tutorials:', error)
    }
  }

  // Auto-show tutorial for new users on specific screens (only if not completed, not seen, and not disabled)
  const autoShowTutorial = (screen: TutorialScreen) => {
    if (!isTutorialCompleted(screen) && !isTutorialSeen && !areTutorialsDisabled && user && !isVisible) {
      // Small delay to ensure DOM is ready and components are rendered
      setTimeout(() => {
        // Check if target elements exist before showing tutorial
        const tutorialSteps = tutorials[screen] || []
        const hasValidTargets = tutorialSteps.some(step => {
          const target = document.querySelector(step.targetSelector)
          return target !== null
        })
        
        if (hasValidTargets) {
          showTutorial(screen)
        }
      }, 1000)
    }
  }

  const value: TutorialContextType = {
    isVisible,
    currentScreen,
    showTutorial,
    hideTutorial,
    completeTutorial,
    isTutorialCompleted,
    tutorialsCompleted,
    isTutorialSeen,
    markTutorialAsSeen,
    showTutorialManually,
    disableTutorialsPermanently,
    areTutorialsDisabled
  }

  // Expose autoShowTutorial to the context
  const contextWithAutoShow = {
    ...value,
    autoShowTutorial
  }

  return (
    <TutorialContext.Provider value={contextWithAutoShow as TutorialContextType}>
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

// Extended hook for auto-showing tutorials
export const useTutorialAutoShow = () => {
  const context = useContext(TutorialContext) as any
  if (!context) {
    throw new Error('useTutorialAutoShow must be used within a TutorialProvider')
  }
  return {
    ...context,
    autoShowTutorial: context.autoShowTutorial
  }
}