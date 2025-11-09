import { createFileRoute } from '@tanstack/react-router'
import { AITrainingMetrics } from '@/features/ai-training-metrics'

export const Route = createFileRoute('/_authenticated/analysis/ai-training-metrics/')({
  component: AITrainingMetrics,
})
