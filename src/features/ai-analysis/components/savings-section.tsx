import { useState, useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { DatePicker } from '@/components/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parseISO, startOfWeek, startOfMonth } from 'date-fns'
import { type SavingsData, type AnalysisConfig } from '../data/schema'
import { useFilteredData } from '../data/api-service'
import { createTemperatureHistogram, calculateDailySavings } from '../utils/savings-calculations'
import { calculateAverageSignal } from '../utils/data-processing'
import { getSignalsForCategory } from '../data/signal-categories'

interface SavingsSectionProps {
  config: AnalysisConfig
  signalName: string | null
  minSamples: number
  categorySignals?: string[]
  buildingArea?: number // m²
}

export function SavingsSection({ config, signalName, minSamples, categorySignals, buildingArea = 25000 }: SavingsSectionProps) {
  const [pricePerUnit, setPricePerUnit] = useState(1.0)
  const [savingsStartDate, setSavingsStartDate] = useState<Date | null>(config.onStartDate)
  const [savingsEndDate, setSavingsEndDate] = useState<Date | null>(config.onEndDate)
  const [tableTab, setTableTab] = useState('daily')
  const { data: filteredData } = useFilteredData(config)

  // Calculate average signal if needed
  const processedData = filteredData && signalName === 'average_signal' && categorySignals
    ? calculateAverageSignal(filteredData, categorySignals)
    : filteredData
  const actualSignalName = signalName === 'average_signal' ? 'average_signal' : signalName

  const histogram = processedData && actualSignalName
    ? createTemperatureHistogram(processedData, actualSignalName, minSamples)
    : null

  const savingsData =
    histogram && savingsStartDate && savingsEndDate && processedData && actualSignalName
      ? calculateDailySavings(processedData, actualSignalName, histogram, savingsStartDate, savingsEndDate)
      : []

  const totalSavings = savingsData.reduce((sum, d) => sum + d.actualSavings, 0)
  const totalPotential = savingsData.reduce((sum, d) => sum + d.potentialSavings, 0)
  const totalForfeited = savingsData.reduce((sum, d) => sum + d.forfeitedSavings, 0)
  const days = savingsData.length
  const avgUptime = savingsData.length > 0
    ? savingsData.reduce((sum, d) => sum + d.uptime, 0) / savingsData.length
    : 0

  // Calculate weekly and monthly aggregations
  const weeklyData = useMemo(() => {
    if (!savingsStartDate || !savingsEndDate || savingsData.length === 0) return []
    const weeklyMap = new Map<string, { actual: number; potential: number; forfeited: number; uptime: number[]; days: number }>()
    
    for (const day of savingsData) {
      const date = parseISO(day.date)
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      
      const existing = weeklyMap.get(weekKey)
      if (existing) {
        existing.actual += day.actualSavings
        existing.potential += day.potentialSavings
        existing.forfeited += day.forfeitedSavings
        existing.uptime.push(day.uptime)
        existing.days++
      } else {
        weeklyMap.set(weekKey, {
          actual: day.actualSavings,
          potential: day.potentialSavings,
          forfeited: day.forfeitedSavings,
          uptime: [day.uptime],
          days: 1,
        })
      }
    }
    
    return Array.from(weeklyMap.entries()).map(([week, data]) => ({
      week: format(parseISO(week), 'yyyy-\'W\'ww'),
      fullWeek: week,
      actual: data.actual,
      potential: data.potential,
      forfeited: data.forfeited,
      uptime: data.uptime.reduce((a, b) => a + b, 0) / data.uptime.length,
      days: data.days,
    })).sort((a, b) => a.fullWeek.localeCompare(b.fullWeek))
  }, [savingsData, savingsStartDate, savingsEndDate])

  const monthlyData = useMemo(() => {
    if (!savingsStartDate || !savingsEndDate || savingsData.length === 0) return []
    const monthlyMap = new Map<string, { actual: number; potential: number; forfeited: number; uptime: number[]; days: number }>()
    
    for (const day of savingsData) {
      const date = parseISO(day.date)
      const monthStart = startOfMonth(date)
      const monthKey = format(monthStart, 'yyyy-MM-dd')
      
      const existing = monthlyMap.get(monthKey)
      if (existing) {
        existing.actual += day.actualSavings
        existing.potential += day.potentialSavings
        existing.forfeited += day.forfeitedSavings
        existing.uptime.push(day.uptime)
        existing.days++
      } else {
        monthlyMap.set(monthKey, {
          actual: day.actualSavings,
          potential: day.potentialSavings,
          forfeited: day.forfeitedSavings,
          uptime: [day.uptime],
          days: 1,
        })
      }
    }
    
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month: format(parseISO(month), 'yyyy-MM'),
      fullMonth: month,
      actual: data.actual,
      potential: data.potential,
      forfeited: data.forfeited,
      uptime: data.uptime.reduce((a, b) => a + b, 0) / data.uptime.length,
      days: data.days,
    })).sort((a, b) => a.fullMonth.localeCompare(b.fullMonth))
  }, [savingsData, savingsStartDate, savingsEndDate])

  const chartData = savingsData.map((d) => ({
    date: format(parseISO(d.date), 'MMM dd'),
    fullDate: d.date,
    actual: d.actualSavings,
    forfeited: d.forfeitedSavings,
    potential: d.potentialSavings,
    uptime: d.uptime,
  }))

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Savings Calculation</h2>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='price-per-unit'>Cost per unit (SEK/{signalName || 'unit'})</Label>
          <Input
            id='price-per-unit'
            type='number'
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
            step={0.01}
            min={0}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <h3 className='font-semibold'>Savings Calculation Period</h3>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Start date for savings calculation</Label>
            <DatePicker
              selected={savingsStartDate ?? undefined}
              onSelect={(date) => setSavingsStartDate(date ?? null)}
              placeholder='Select start date'
            />
          </div>
          <div className='space-y-2'>
            <Label>End date for savings calculation</Label>
            <DatePicker
              selected={savingsEndDate ?? undefined}
              onSelect={(date) => setSavingsEndDate(date ?? null)}
              placeholder='Select end date'
            />
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <>
          <div className='space-y-2'>
            <h3 className='font-semibold'>Daily Total Savings (Sum of Temperature Bin Diffs)</h3>
            <ResponsiveContainer width='100%' height={385}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey='date'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  name='Savings'
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className='bg-background border rounded-lg p-2 shadow-lg'>
                        <p className='font-semibold'>{data.fullDate}</p>
                        <p className='text-green-500'>Actual Savings: {data.actual.toFixed(2)}</p>
                        <p className='text-blue-500'>Forfeited Savings: {data.forfeited.toFixed(2)}</p>
                        <p className='text-sm text-muted-foreground'>Uptime: {data.uptime.toFixed(1)}%</p>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar dataKey='forfeited' stackId='a' fill='#5DADE2' fillOpacity={0.6} name='Forfeited Savings due to downtime' />
                <Bar dataKey='actual' stackId='a' fill='#5cb85c' name='Actual Savings' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Energy Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>{totalSavings.toFixed(0)}</div>
                <p className='text-sm text-green-500'>↑ {signalName || 'unit'} over {days} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monetary Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold'>{(totalSavings * pricePerUnit).toFixed(0)} SEK</div>
                <p className='text-sm text-green-500'>↑ Over {days} days</p>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>Normalized Savings</h3>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Energy Savings per m²</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>{(totalSavings / buildingArea).toFixed(2)}</div>
                  <p className='text-sm text-green-500'>↑ {signalName || 'unit'}/m²</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monetary Savings per m²</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>
                    {((totalSavings * pricePerUnit) / buildingArea).toFixed(2)} SEK/m²
                  </div>
                  <p className='text-sm text-green-500'>↑ Building area: {buildingArea.toLocaleString()} m²</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>Potential Savings with 100% Uptime</h3>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Potential Energy Savings (100% Uptime)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>{totalPotential.toFixed(0)}</div>
                  <p className='text-sm text-green-500 mt-1'>
                    ↑ {signalName || 'unit'} over {days} days (vs. {totalSavings.toFixed(0)}...)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Potential Monetary Savings (100% Uptime)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold'>{(totalPotential * pricePerUnit).toFixed(0)} SEK</div>
                  <p className='text-sm text-green-500 mt-1'>
                    ↑ Actual uptime: {avgUptime.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className='border-t pt-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Energy Savings per m² (100% Uptime)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold'>{(totalPotential / buildingArea).toFixed(2)}</div>
                    <p className='text-sm text-green-500 mt-1'>
                      ↑ {signalName || 'unit'}/m²
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potential Monetary Savings per m² (100% Uptime)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold'>
                      {((totalPotential * pricePerUnit) / buildingArea).toFixed(2)} SEK/m²
                    </div>
                    <p className='text-sm text-green-500 mt-1'>
                      ↑ Building area: {buildingArea.toLocaleString()} m²
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-xl font-bold'>Savings Data Tables</h3>
            <Tabs value={tableTab} onValueChange={setTableTab}>
              <TabsList>
                <TabsTrigger value='daily'>Daily</TabsTrigger>
                <TabsTrigger value='weekly'>Weekly</TabsTrigger>
                <TabsTrigger value='monthly'>Monthly</TabsTrigger>
              </TabsList>

              <TabsContent value='daily' className='space-y-4'>
                <ScrollArea className='h-[400px] rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Actual Savings</TableHead>
                        <TableHead>Potential Savings (100% Uptime)</TableHead>
                        <TableHead>Forfeited Savings</TableHead>
                        <TableHead>Uptime</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savingsData.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{day.date}</TableCell>
                          <TableCell>{day.actualSavings.toFixed(2)}</TableCell>
                          <TableCell>{day.potentialSavings.toFixed(2)}</TableCell>
                          <TableCell>{day.forfeitedSavings.toFixed(2)}</TableCell>
                          <TableCell>{day.uptime.toFixed(1)}%</TableCell>
                          <TableCell>{signalName || 'unit'}/day</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='weekly' className='space-y-4'>
                <ScrollArea className='h-[400px] rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Week</TableHead>
                        <TableHead>Actual Savings</TableHead>
                        <TableHead>Potential Savings (100% Uptime)</TableHead>
                        <TableHead>Forfeited Savings</TableHead>
                        <TableHead>Days in Week</TableHead>
                        <TableHead>Uptime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyData.map((week) => (
                        <TableRow key={week.fullWeek}>
                          <TableCell>{week.week}</TableCell>
                          <TableCell>{week.actual.toFixed(2)}</TableCell>
                          <TableCell>{week.potential.toFixed(2)}</TableCell>
                          <TableCell>{week.forfeited.toFixed(2)}</TableCell>
                          <TableCell>{week.days}</TableCell>
                          <TableCell>{week.uptime.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='monthly' className='space-y-4'>
                <ScrollArea className='h-[400px] rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Actual Savings</TableHead>
                        <TableHead>Potential Savings (100% Uptime)</TableHead>
                        <TableHead>Forfeited Savings</TableHead>
                        <TableHead>Days in Month</TableHead>
                        <TableHead>Uptime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((month) => (
                        <TableRow key={month.fullMonth}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell>{month.actual.toFixed(2)}</TableCell>
                          <TableCell>{month.potential.toFixed(2)}</TableCell>
                          <TableCell>{month.forfeited.toFixed(2)}</TableCell>
                          <TableCell>{month.days}</TableCell>
                          <TableCell>{month.uptime.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}

