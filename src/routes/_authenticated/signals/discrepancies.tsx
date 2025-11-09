import { createFileRoute } from '@tanstack/react-router'
import { DiscrepanciesViewer } from '@/features/signals/discrepancies-viewer'

export const Route = createFileRoute('/_authenticated/signals/discrepancies')({
  component: DiscrepanciesViewer,
})
