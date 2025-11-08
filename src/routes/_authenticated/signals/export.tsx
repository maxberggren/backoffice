import { createFileRoute } from '@tanstack/react-router'
import { SignalExport } from '@/features/signals/signal-export'

export const Route = createFileRoute('/_authenticated/signals/export')({
  component: SignalExport,
})
