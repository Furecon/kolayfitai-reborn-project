import { tutorialConfig } from './tutorialConfig'
import type { TutorialStatus } from './tutorialConfig'

export interface TutorialStateItem {
  status: TutorialStatus
  lastShown?: string
  currentStep?: number
}

export type TutorialState = Record<string, TutorialStateItem>

const STORAGE_KEY = tutorialConfig.settings.storageKey

export class TutorialStorage {
  private static instance: TutorialStorage
  private state: TutorialState = {}

  private constructor() {
    this.loadState()
  }

  static getInstance(): TutorialStorage {
    if (!TutorialStorage.instance) {
      TutorialStorage.instance = new TutorialStorage()
    }
    return TutorialStorage.instance
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.state = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load tutorial state:', error)
      this.state = {}
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save tutorial state:', error)
    }
  }

  getState(featureId: string): TutorialStateItem {
    return this.state[featureId] || { status: 'never_shown' }
  }

  getAllStates(): TutorialState {
    return { ...this.state }
  }

  updateState(featureId: string, update: Partial<TutorialStateItem>): void {
    this.state[featureId] = {
      ...this.getState(featureId),
      ...update
    }
    this.saveState()
  }

  markAsShown(featureId: string, currentStep: number = 0): void {
    this.updateState(featureId, {
      status: 'shown',
      lastShown: new Date().toISOString(),
      currentStep
    })
  }

  markAsCompleted(featureId: string): void {
    this.updateState(featureId, {
      status: 'completed',
      lastShown: new Date().toISOString(),
      currentStep: undefined
    })
  }

  markAsSkipped(featureId: string): void {
    this.updateState(featureId, {
      status: 'skipped',
      lastShown: new Date().toISOString(),
      currentStep: undefined
    })
  }

  markAsDisabled(featureId: string): void {
    this.updateState(featureId, {
      status: 'disabled',
      lastShown: new Date().toISOString(),
      currentStep: undefined
    })
  }

  shouldShowTutorial(featureId: string): boolean {
    const state = this.getState(featureId)
    return state.status === 'never_shown' || state.status === 'shown'
  }

  isDisabled(featureId: string): boolean {
    return this.getState(featureId).status === 'disabled'
  }

  resetTutorial(featureId: string): void {
    this.updateState(featureId, {
      status: 'never_shown',
      lastShown: undefined,
      currentStep: undefined
    })
  }

  resetAllTutorials(): void {
    this.state = {}
    this.saveState()
  }

  exportState(): TutorialState {
    return { ...this.state }
  }

  importState(state: TutorialState): void {
    this.state = { ...state }
    this.saveState()
  }
}

export const tutorialStorage = TutorialStorage.getInstance()
