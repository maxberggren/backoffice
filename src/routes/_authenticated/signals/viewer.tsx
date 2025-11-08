import { createFileRoute } from '@tanstack/react-router'
import { SignalViewer } from '@/features/signals/signal-viewer'

export const Route = createFileRoute('/_authenticated/signals/viewer')({
  component: SignalViewer,
})
