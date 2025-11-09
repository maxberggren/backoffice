import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type ModelMetrics, type TrainingConfig } from '../data/schema'
import { format } from 'date-fns'

interface MetricsSummaryProps {
  modelMetrics: ModelMetrics | undefined
  trainingConfig: TrainingConfig | undefined
  isLoading?: boolean
}

export function MetricsSummary({ modelMetrics, trainingConfig, isLoading }: MetricsSummaryProps) {
  if (isLoading || !modelMetrics || !trainingConfig) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-20 mb-2' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Final Training Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{modelMetrics.finalTrainLoss.toFixed(4)}</div>
          <p className='text-muted-foreground text-xs'>
            Validation: {modelMetrics.finalValLoss.toFixed(4)}
          </p>
        </CardContent>
      </Card>

      {modelMetrics.finalTrainAccuracy !== undefined && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Final Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(modelMetrics.finalTrainAccuracy * 100).toFixed(1)}%
            </div>
            <p className='text-muted-foreground text-xs'>
              Validation: {(modelMetrics.finalValAccuracy! * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Best Epoch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{modelMetrics.bestEpoch}</div>
          <p className='text-muted-foreground text-xs'>
            of {modelMetrics.totalEpochs} total epochs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Training Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatDuration(modelMetrics.trainingTime)}</div>
          <p className='text-muted-foreground text-xs'>
            Started: {format(new Date(modelMetrics.trainingStartDate), 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

