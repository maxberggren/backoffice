import { createFileRoute } from '@tanstack/react-router'
import { Configuration } from '@/features/configuration'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config')({
  component: Configuration,
})
