import { create } from 'zustand'
import { setCookie } from '@/lib/cookies'
import { type Property } from '@/features/users/data/schema'

const PROPERTY_COOKIE_NAME = 'selected-property-id'
const PROPERTY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

interface PropertyState {
  selectedProperty: Property | null
  setSelectedProperty: (property: Property | null) => void
}

export const usePropertyStore = create<PropertyState>()((set) => {
  return {
    selectedProperty: null,
    setSelectedProperty: (property) => {
      if (property) {
        setCookie(PROPERTY_COOKIE_NAME, property.id, PROPERTY_COOKIE_MAX_AGE)
      }
      set({ selectedProperty: property })
    },
  }
})

