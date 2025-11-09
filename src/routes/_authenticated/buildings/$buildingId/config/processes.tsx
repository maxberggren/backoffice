import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationProcesses } from '@/features/configuration/processes'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/processes')({
  component: ConfigurationProcesses,
})
