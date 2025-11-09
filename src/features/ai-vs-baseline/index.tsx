import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import { useAIAnalysisData } from '@/features/ai-analysis/data/api-service'
import {
  useAIVsBaseline,
  getDefaultAIVsBaselineConfig,
  getAvailableVariables,
} from './data/api-service'
import { type AIVsBaselineConfig } from './data/schema'
import { DateRangePicker } from './components/date-range-picker'
import { VariableSelector } from './components/variable-selector'
import { AIVsBaselineChart } from './components/ai-vs-baseline-chart'

export function AIVsBaseline() {
  const { data: rawData, isLoading: dataLoading } = useAIAnalysisData()
  const [config, setConfig] = useState<AIVsBaselineConfig>(
    getDefaultAIVsBaselineConfig(rawData)
  )

  const { data: baselineData, isLoading: baselineLoading } = useAIVsBaseline(config)

  // Get available variables
  const availableVariables = useMemo(() => {
    return getAvailableVariables(rawData)
  }, [rawData])

  // Update config when raw data loads
  useEffect(() => {
    if (rawData && !config.startDate) {
      const defaultConfig = getDefaultAIVsBaselineConfig(rawData)
      setConfig(defaultConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData])

  // Update selected variable if current one is not available
  useEffect(() => {
    if (availableVariables.length > 0 && config.selectedVariable) {
      if (!availableVariables.includes(config.selectedVariable)) {
        setConfig({ ...config, selectedVariable: availableVariables[0] })
      }
    } else if (availableVariables.length > 0 && !config.selectedVariable) {
      setConfig({ ...config, selectedVariable: availableVariables[0] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableVariables])

  const isLoading = dataLoading || baselineLoading

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
              <TrendingUp className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>AI vs Baseline</h2>
              <p className='text-muted-foreground text-sm'>
                Compare AI-controlled signal values with baseline (assumed off-state) values
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <VariableSelector
              selectedVariable={config.selectedVariable}
              availableVariables={availableVariables}
              onVariableChange={(variable) => setConfig({ ...config, selectedVariable: variable })}
            />
            <DateRangePicker
              config={config}
              onConfigChange={(updates) => setConfig({ ...config, ...updates })}
            />
          </div>
        </div>

        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-[400px] w-full' />
          </div>
        ) : (
          baselineData && (
            <Card className='p-0'>
              <CardContent className='p-0'>
                <AIVsBaselineChart
                  data={baselineData.timeSeriesData}
                  offlinePeriods={baselineData.offlinePeriods}
                  signalName={config.selectedVariable || 'Signal'}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          )
        )}
      </Main>
    </>
  )
}

