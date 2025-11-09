import { createFileRoute } from '@tanstack/react-router'
import { SignalImport } from '@/features/signals/signal-import'

export const Route = createFileRoute('/_authenticated/signals/import')({
  component: SignalImport,
})
