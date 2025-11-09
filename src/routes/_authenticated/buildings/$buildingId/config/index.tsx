import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationSettings } from '@/features/configuration/settings'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/')({
  component: ConfigurationSettings,
})
