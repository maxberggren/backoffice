import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationAIBaseline } from '@/features/configuration/ai-baseline'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/ai-baseline')({
  component: ConfigurationAIBaseline,
})
