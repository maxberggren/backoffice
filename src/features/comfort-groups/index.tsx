import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAIAnalysisData } from '@/features/ai-analysis/data/api-service'
import { useComfortGroups, getDefaultComfortGroupConfig } from './data/api-service'
import { type ComfortGroupConfig } from './data/schema'
import { DateRangePicker } from './components/date-range-picker'
import { ComfortGroupsChart } from './components/comfort-groups-chart'

export function ComfortGroups() {
  const { data: rawData, isLoading: dataLoading } = useAIAnalysisData()
  const [config, setConfig] = useState<ComfortGroupConfig>(
    getDefaultComfortGroupConfig(rawData)
  )

  const { data: groupsData, isLoading: groupsLoading } = useComfortGroups(config)

  // Update config when raw data loads
  useEffect(() => {
    if (rawData && !config.startDate) {
      setConfig(getDefaultComfortGroupConfig(rawData))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData])

  const isLoading = dataLoading || groupsLoading

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex-1 min-w-0'>
            <h1 className='text-2xl font-bold tracking-tight'>Comfort Groups</h1>
            <p className='text-muted-foreground'>
              View time-series averages of temperature sensor groups representing average indoor temperature
            </p>
          </div>
          <DateRangePicker
            config={config}
            onConfigChange={(updates) => setConfig({ ...config, ...updates })}
          />
        </div>

        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-[400px] w-full' />
          </div>
        ) : (
          groupsData && (
            <Card className='p-0'>
              <CardContent className='p-0'>
                <ComfortGroupsChart
                  data={groupsData.timeSeriesData}
                  groups={groupsData.groups}
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

