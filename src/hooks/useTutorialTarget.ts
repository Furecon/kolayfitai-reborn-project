import { useEffect, useRef } from 'react'
import { useTutorial } from '@/components/Tutorial/TutorialProvider'

export function useTutorialTarget(targetKey: string) {
  const ref = useRef<HTMLElement>(null)
  const { registerTarget, unregisterTarget } = useTutorial()

  useEffect(() => {
    if (ref.current) {
      registerTarget(targetKey, ref.current)
    }

    return () => {
      unregisterTarget(targetKey)
    }
  }, [targetKey, registerTarget, unregisterTarget])

  return ref
}
