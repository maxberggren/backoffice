import { createFileRoute } from '@tanstack/react-router'
import { AiOutputViewer } from '@/features/signals/ai-output-viewer'

export const Route = createFileRoute('/_authenticated/signals/ai-output')({
  component: AiOutputViewer,
})
