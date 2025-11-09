import { useParams } from '@tanstack/react-router'
import { ConfigurationGeneral } from '@/features/configuration/general'

export function ConfigurationSettings() {
  const { buildingId } = useParams({ from: '/_authenticated/buildings/$buildingId/config' })
  return <ConfigurationGeneral propertyId={buildingId} />
}
