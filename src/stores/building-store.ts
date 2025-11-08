import { create } from 'zustand'
import { setCookie } from '@/lib/cookies'
import { type Building } from '@/features/users/data/schema'

const BUILDING_COOKIE_NAME = 'selected-building-id'
const BUILDING_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

interface BuildingState {
  selectedBuilding: Building | null
  setSelectedBuilding: (building: Building | null) => void
}

export const useBuildingStore = create<BuildingState>()((set) => {
  return {
    selectedBuilding: null,
    setSelectedBuilding: (building) => {
      if (building) {
        setCookie(BUILDING_COOKIE_NAME, building.id, BUILDING_COOKIE_MAX_AGE)
      }
      set({ selectedBuilding: building })
    },
  }
})

