import { createFileRoute } from '@tanstack/react-router'
import { ConfigurationAISettings } from '@/features/configuration/ai-settings'

export const Route = createFileRoute('/_authenticated/buildings/$buildingId/config/ai-settings')({
  component: ConfigurationAISettingsRoute,
})

function ConfigurationAISettingsRoute() {
  const { buildingId } = Route.useParams()
  return <ConfigurationAISettings propertyId={buildingId} />
}
