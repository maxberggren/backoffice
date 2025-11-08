import { createFileRoute } from '@tanstack/react-router'
import { AIAnalysis } from '@/features/ai-analysis'

export const Route = createFileRoute('/_authenticated/analysis/ai-on-vs-off/')({
  component: AIAnalysis,
})
