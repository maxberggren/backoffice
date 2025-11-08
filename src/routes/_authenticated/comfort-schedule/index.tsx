import { createFileRoute } from '@tanstack/react-router'
import { ComfortSchedule } from '@/features/comfort-schedule'

export const Route = createFileRoute('/_authenticated/comfort-schedule/')({
  component: ComfortSchedule,
})
