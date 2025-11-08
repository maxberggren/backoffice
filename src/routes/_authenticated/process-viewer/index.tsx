import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ProcessViewer } from '@/features/process-viewer'

const processViewerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(25),
  // Global search
  search: z.string().optional().catch(''),
  // Facet filters
  isOnline: z
    .array(z.union([z.literal('true'), z.literal('false')]))
    .optional()
    .catch([]),
  client: z.array(z.string()).optional().catch([]),
  country: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/process-viewer/')({
  validateSearch: processViewerSearchSchema,
  component: ProcessViewer,
})
