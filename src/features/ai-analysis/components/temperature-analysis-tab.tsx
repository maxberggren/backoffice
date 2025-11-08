import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { type TemperatureBin, type ImpactMetrics } from '../data/schema'

interface TemperatureAnalysisTabProps {
  bins: TemperatureBin[] | undefined
  metrics: ImpactMetrics | undefined
  signalName: string
  dayFilter: string
  onDayFilterChange: (filter: string) => void
  isLoading?: boolean
}

const DAY_FILTERS = [
  { value: 'all', label: 'All Days' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

export function TemperatureAnalysisTab({
  bins,
  metrics,
  signalName,
  dayFilter,
  onDayFilterChange,
  isLoading,
}: TemperatureAnalysisTabProps) {
  if (isLoading || !bins || !metrics) {
    return (
      <div className='space-y-6'>
        <Tabs value={dayFilter} onValueChange={onDayFilterChange}>
          <TabsList className='w-full overflow-x-auto'>
            {DAY_FILTERS.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={dayFilter} className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='font-semibold text-lg'>
                {signalName} by Outdoor Temperature - {DAY_FILTERS.find((f) => f.value === dayFilter)?.label}
              </h3>
              <Skeleton className='h-[500px] w-full' />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const chartData = bins.map((bin) => ({
    bin: bin.bin,
    onMean: bin.onMean,
    onP25: bin.onP25,
    onP975: bin.onP975,
    offMean: bin.offMean,
    offP25: bin.offP25,
    offP975: bin.offP975,
    isReliable: bin.isReliable,
    onCount: bin.onCount,
    offCount: bin.offCount,
  }))

  return (
    <div className='space-y-6'>
      <Tabs value={dayFilter} onValueChange={onDayFilterChange}>
        <TabsList className='w-full overflow-x-auto'>
          {DAY_FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={dayFilter} className='space-y-6'>
          <div className='space-y-2'>
            <h3 className='font-semibold text-lg'>
              {signalName} by Outdoor Temperature - {DAY_FILTERS.find((f) => f.value === dayFilter)?.label}
            </h3>
            <ResponsiveContainer width='100%' height={500}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey='bin'
                  name='Outdoor Temperature'
                  unit='°C'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  name={signalName}
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className='bg-background border rounded-lg p-2 shadow-lg'>
                        <p className='font-semibold'>Temp Bin: {data.bin}°C</p>
                        {data.isReliable ? (
                          <>
                            <p className='text-[#e2673b]'>
                              ON: {data.onMean.toFixed(2)} (Range: {data.onP25.toFixed(2)} - {data.onP975.toFixed(2)})
                            </p>
                            <p className='text-[#c6cacc]'>
                              OFF: {data.offMean.toFixed(2)} (Range: {data.offP25.toFixed(2)} - {data.offP975.toFixed(2)})
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              Samples: ON={data.onCount}, OFF={data.offCount}
                            </p>
                          </>
                        ) : (
                          <p className='text-sm text-muted-foreground'>Not in analysis (insufficient samples)</p>
                        )}
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar
                  dataKey='onMean'
                  name='Myrspoven Control = ON'
                  fill='#e2673b'
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`on-cell-${index}`}
                      fill='#e2673b'
                      fillOpacity={entry.isReliable ? 1 : 0.3}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey='offMean'
                  name='Myrspoven Control = OFF'
                  fill='#c6cacc'
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`off-cell-${index}`}
                      fill='#c6cacc'
                      fillOpacity={entry.isReliable ? 1 : 0.3}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Simple Average Difference</CardTitle>
                <CardDescription>(reliable bins only)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='text-3xl font-bold'>
                    {metrics.simpleAverageDiff > 0 ? '+' : ''}
                    {metrics.simpleAverageDiff.toFixed(2)}
                  </div>
                  <div className={`text-lg ${metrics.simpleAveragePctDiff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.simpleAveragePctDiff > 0 ? '↑' : '↓'}
                    {Math.abs(metrics.simpleAveragePctDiff).toFixed(1)}%
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Uptime corrected: {metrics.uptimeCorrectedDiff.toFixed(2)} ({metrics.uptimeCorrectedPctDiff.toFixed(1)}%) since uptime has been {metrics.uptime.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            {metrics.weightedAverageDiff !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Temperature-Occurrence-Weighted Difference</CardTitle>
                  <CardDescription>(reliable bins only)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='text-3xl font-bold'>
                      {metrics.weightedAverageDiff > 0 ? '+' : ''}
                      {metrics.weightedAverageDiff.toFixed(2)}
                    </div>
                    <div className={`text-lg ${metrics.weightedAveragePctDiff && metrics.weightedAveragePctDiff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metrics.weightedAveragePctDiff && metrics.weightedAveragePctDiff > 0 ? '↑' : '↓'}
                      {metrics.weightedAveragePctDiff ? Math.abs(metrics.weightedAveragePctDiff).toFixed(1) : '0'}%
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      Weighted by temp occurrence. Uptime corrected: {(metrics.weightedAverageDiff * (metrics.uptime / 100)).toFixed(2)} ({metrics.weightedAveragePctDiff ? (metrics.weightedAveragePctDiff * (metrics.uptime / 100)).toFixed(1) : '0'}%) since uptime has been {metrics.uptime.toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

