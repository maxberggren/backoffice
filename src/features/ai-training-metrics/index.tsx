import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Brain } from 'lucide-react'
import { LossCurveChart } from './components/loss-curve-chart'
import { AccuracyChart } from './components/accuracy-chart'
import { LearningRateChart } from './components/learning-rate-chart'
import { MetricsSummary } from './components/metrics-summary'
import { ModelInfo } from './components/model-info'
import {
  useTrainingMetrics,
  useModelMetrics,
  useTrainingConfig,
} from './data/api-service'

export function AITrainingMetrics() {
  const { data: trainingMetrics, isLoading: metricsLoading } = useTrainingMetrics()
  const { data: modelMetrics, isLoading: modelLoading } = useModelMetrics()
  const { data: trainingConfig, isLoading: configLoading } = useTrainingConfig()

  const isLoading = metricsLoading || modelLoading || configLoading

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
              <Brain className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>AI Training Metrics</h2>
              <p className='text-muted-foreground text-sm'>
                Monitor model training performance, loss curves, and accuracy metrics
              </p>
            </div>
          </div>
        </div>

        <MetricsSummary
          modelMetrics={modelMetrics}
          trainingConfig={trainingConfig}
          isLoading={isLoading}
        />

        <ModelInfo
          modelMetrics={modelMetrics}
          trainingConfig={trainingConfig}
          isLoading={isLoading}
        />

        <LossCurveChart data={trainingMetrics || []} isLoading={isLoading} />

        {trainingMetrics && trainingMetrics.some((m) => m.trainAccuracy !== undefined) && (
          <AccuracyChart data={trainingMetrics} isLoading={isLoading} />
        )}

        <LearningRateChart data={trainingMetrics || []} isLoading={isLoading} />
      </Main>
    </>
  )
}

