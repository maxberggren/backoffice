import { createFileRoute } from '@tanstack/react-router'
import { AIVsBaseline } from '@/features/ai-vs-baseline'

export const Route = createFileRoute('/_authenticated/analysis/ai-vs-baseline/')({
  component: AIVsBaseline,
})
