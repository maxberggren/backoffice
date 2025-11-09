import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type ModelMetrics, type TrainingConfig } from '../data/schema'
import { format } from 'date-fns'

interface ModelInfoProps {
  modelMetrics: ModelMetrics | undefined
  trainingConfig: TrainingConfig | undefined
  isLoading?: boolean
}

export function ModelInfo({ modelMetrics, trainingConfig, isLoading }: ModelInfoProps) {
  if (isLoading || !modelMetrics || !trainingConfig) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48 mt-2' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48 mt-2' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>Details about the trained model</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Model Name:</span>
            <span className='text-sm font-medium'>{modelMetrics.modelName}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Version:</span>
            <span className='text-sm font-medium'>{modelMetrics.modelVersion}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Training Period:</span>
            <span className='text-sm font-medium'>
              {format(new Date(modelMetrics.trainingStartDate), 'MMM d')} -{' '}
              {format(new Date(modelMetrics.trainingEndDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Dataset Size:</span>
            <span className='text-sm font-medium'>
              {modelMetrics.datasetSize.toLocaleString()} samples
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Validation Split:</span>
            <span className='text-sm font-medium'>
              {(modelMetrics.validationSplit * 100).toFixed(0)}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Configuration</CardTitle>
          <CardDescription>Hyperparameters used for training</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Learning Rate:</span>
            <span className='text-sm font-medium'>{trainingConfig.learningRate.toExponential(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Batch Size:</span>
            <span className='text-sm font-medium'>{trainingConfig.batchSize}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Optimizer:</span>
            <span className='text-sm font-medium'>{trainingConfig.optimizer}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Loss Function:</span>
            <span className='text-sm font-medium'>{trainingConfig.lossFunction}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground text-sm'>Metrics:</span>
            <span className='text-sm font-medium'>{trainingConfig.metrics.join(', ')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

