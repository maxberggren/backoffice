import { useState, useMemo, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { ConfigurationSection } from './components/configuration-section'
import { DateRangeSelectors } from './components/date-range-selectors'
import { DailyDistributionChart } from './components/daily-distribution-chart'
import { SignalSelector } from './components/signal-selector'
import { SignalTemperatureScatterChart } from './components/scatter-chart'
import { TemperatureAnalysisTab } from './components/temperature-analysis-tab'
import { SavingsSection } from './components/savings-section'
import {
  useAIAnalysisData,
  useFilteredData,
  useDailyDistribution,
  useTemperatureAnalysis,
  useScatterData,
  useSignalAvailability,
  getDefaultConfig,
} from './data/api-service'
import { SIGNAL_CATEGORIES, getSignalsForCategory } from './data/signal-categories'
import { type AnalysisConfig, type SignalCategory } from './data/schema'

export function AIAnalysis() {
  const { data: rawData, isLoading: dataLoading } = useAIAnalysisData()
  const [config, setConfig] = useState<AnalysisConfig>(
    getDefaultConfig(rawData)
  )
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | null>(SIGNAL_CATEGORIES[0])
  const [selectedSignal, setSelectedSignal] = useState<string | null>('average')
  const [dayFilter, setDayFilter] = useState('all')
  const [normalize20C, setNormalize20C] = useState(false)
  const [affinityLaw, setAffinityLaw] = useState(false)
  const [temperatureDiff, setTemperatureDiff] = useState(false)
  const [activeTab, setActiveTab] = useState('temperature')
  const initializedRef = useRef(false)

  const { data: filteredData } = useFilteredData(config)
  const { data: dailyDistribution, isLoading: dailyDistributionLoading } = useDailyDistribution(config)

  // Get available signal columns
  const availableSignals = useMemo(() => {
    if (!rawData || rawData.length === 0) return []
    return Object.keys(rawData[0]).filter(
      (key) => !['timestamp', 'control_state', 't', 'MYRSPOVEN_DS'].includes(key)
    )
  }, [rawData])

  // Get category signals for average calculation
  const categorySignals = useMemo(() => {
    if (!selectedCategory) return []
    return getSignalsForCategory(selectedCategory, availableSignals)
  }, [selectedCategory, availableSignals])

  // Calculate signal name for analysis
  const analysisSignalName = useMemo(() => {
    if (!selectedCategory || !selectedSignal) return null
    if (selectedSignal === 'average') {
      return `Average of all ${selectedCategory.name} signals`
    }
    return selectedSignal
  }, [selectedCategory, selectedSignal])

  // Calculate actual signal values for average case
  const processedSignalName = useMemo(() => {
    if (!selectedCategory || !selectedSignal) return null
    if (selectedSignal === 'average') {
      return 'average_signal'
    }
    return selectedSignal
  }, [selectedCategory, selectedSignal])

  const { data: temperatureAnalysis, isLoading: temperatureAnalysisLoading } = useTemperatureAnalysis(
    config,
    processedSignalName,
    dayFilter,
    selectedSignal === 'average' ? categorySignals : undefined
  )
  const { data: scatterData, isLoading: scatterDataLoading } = useScatterData(
    config,
    processedSignalName,
    selectedSignal === 'average' ? categorySignals : undefined
  )
  const { data: signalAvailability } = useSignalAvailability(
    config,
    processedSignalName,
    selectedSignal === 'average' ? categorySignals : undefined
  )

  // Update config when raw data loads (only once, using ref to avoid synchronous setState)
  useEffect(() => {
    if (rawData && !initializedRef.current && !config.onStartDate) {
      initializedRef.current = true
      // Use setTimeout to defer setState and avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setConfig(getDefaultConfig(rawData))
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [rawData, config.onStartDate])

  // Get temperature range for slider
  const tempRange = useMemo(() => {
    if (!rawData) return [-20, 40] as [number, number]
    const temps = rawData.map((r) => r.t).filter((t): t is number => t !== null)
    return temps.length > 0
      ? ([Math.min(...temps), Math.max(...temps)] as [number, number])
      : ([-20, 40] as [number, number])
  }, [rawData])

  // Calculate control signal distribution
  const controlDistribution = useMemo(() => {
    if (!filteredData) return null
    const onCount = filteredData.filter((r) => r.control_state === 1).length
    const offCount = filteredData.filter((r) => r.control_state === 0).length
    const total = onCount + offCount
    return {
      onCount,
      offCount,
      onPercent: total > 0 ? (onCount / total) * 100 : 0,
      offPercent: total > 0 ? (offCount / total) * 100 : 0,
    }
  }, [filteredData])

  if (dataLoading) {
    return (
      <>
        <Header fixed>
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div>Loading data...</div>
        </Main>
      </>
    )
  }

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
              <h2 className='text-2xl font-bold tracking-tight'>AI ON vs. OFF</h2>
              <p className='text-muted-foreground text-sm'>
                Analyze the impact of AI control systems by comparing ON vs OFF states under
                temperature-normalized conditions
              </p>
            </div>
          </div>
        </div>

        <ConfigurationSection
          config={config}
          onConfigChange={(updates) => setConfig({ ...config, ...updates })}
          tempRange={tempRange}
        />

        <DateRangeSelectors
          config={config}
          onConfigChange={(updates) => setConfig({ ...config, ...updates })}
        />

        <DailyDistributionChart 
          data={dailyDistribution} 
          isLoading={dailyDistributionLoading || !dailyDistribution} 
        />

        {controlDistribution && (
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm'>
                Myrspoven Control = ON ({controlDistribution.onCount} hours from selected 'ON Days',{' '}
                {controlDistribution.onPercent.toFixed(1)}%)
              </p>
            </div>
            <div className='text-right'>
              <p className='text-sm'>
                Myrspoven Control = OFF ({controlDistribution.offCount} hours meeting 'OFF' criteria,{' '}
                {controlDistribution.offPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        <SignalSelector
          selectedCategory={selectedCategory}
          selectedSignal={selectedSignal}
          availableSignals={availableSignals}
          onCategoryChange={setSelectedCategory}
          onSignalChange={setSelectedSignal}
          normalize20C={normalize20C}
          onNormalize20CChange={setNormalize20C}
          affinityLaw={affinityLaw}
          onAffinityLawChange={setAffinityLaw}
          temperatureDiff={temperatureDiff}
          onTemperatureDiffChange={setTemperatureDiff}
        />

        {signalAvailability && signalAvailability.percentage < 90 && (
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Signal availability is {signalAvailability.percentage.toFixed(1)}% (below 90% threshold)
            </AlertDescription>
          </Alert>
        )}

        {analysisSignalName && (
          <SignalTemperatureScatterChart
            data={scatterData}
            signalName={analysisSignalName}
            isLoading={scatterDataLoading || !scatterData}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='temperature'>Temperature Analysis</TabsTrigger>
            <TabsTrigger value='system-impact' disabled>
              System Impact Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value='temperature' className='space-y-6'>
            {analysisSignalName && (
              <TemperatureAnalysisTab
                bins={temperatureAnalysis?.bins}
                metrics={temperatureAnalysis?.metrics}
                signalName={analysisSignalName}
                dayFilter={dayFilter}
                onDayFilterChange={setDayFilter}
                isLoading={temperatureAnalysisLoading}
              />
            )}
          </TabsContent>

          <TabsContent value='system-impact'>
            <div className='text-muted-foreground'>
              System Impact Analysis coming soon...
            </div>
          </TabsContent>
        </Tabs>

        {analysisSignalName && (
          <SavingsSection
            config={config}
            signalName={processedSignalName}
            minSamples={config.minSamplesThreshold}
            categorySignals={selectedSignal === 'average' ? categorySignals : undefined}
          />
        )}
      </Main>
    </>
  )
}

