import { createFileRoute } from '@tanstack/react-router'
import { ComfortGroups } from '@/features/comfort-groups'

export const Route = createFileRoute('/_authenticated/analysis/comfort-groups/')({
  component: ComfortGroups,
})
