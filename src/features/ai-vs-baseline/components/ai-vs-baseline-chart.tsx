import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  ReferenceArea,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { type TimeSeriesPoint, type OfflinePeriod } from '../data/schema'
import { DEFAULT_LINE_TYPE } from '@/lib/chart-defaults'

interface AIVsBaselineChartProps {
  data: TimeSeriesPoint[]
  offlinePeriods?: OfflinePeriod[]
  signalName?: string
  isLoading?: boolean
}

export function AIVsBaselineChart({
  data,
  offlinePeriods = [],
  signalName = 'Signal',
  isLoading,
}: AIVsBaselineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [foregroundColor, setForegroundColor] = useState('#ffffff')
  const [axisColor, setAxisColor] = useState('#888888')
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())
  const [isDark, setIsDark] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get computed foreground color from CSS variable and update on theme change
  useEffect(() => {
    const updateColor = () => {
      const dark = document.documentElement.classList.contains('dark')
      setIsDark(dark)
      setForegroundColor(dark ? '#ffffff' : '#000000')
      setAxisColor(dark ? '#a0a0a0' : '#666666')
    }

    updateColor()

    // Listen for theme changes
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  const toggleLine = (lineName: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev)
      if (next.has(lineName)) {
        next.delete(lineName)
      } else {
        next.add(lineName)
      }
      return next
    })
  }

  if (isLoading || !data || data.length === 0) {
    return (
      <div>
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  // Calculate Y-axis domain from data
  const allValues: number[] = []
  data.forEach((point) => {
    if (point.signal !== null) allValues.push(point.signal)
    if (point.baseline !== null) allValues.push(point.baseline)
    if (point.signalMin !== null) allValues.push(point.signalMin)
    if (point.signalMax !== null) allValues.push(point.signalMax)
  })

  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100
  const padding = (maxValue - minValue) * 0.1 // 10% padding
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding]

  // Custom tick component to render hour on top and date beneath
  const CustomTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
    try {
      const date = new Date(payload.value)
      const hour = format(date, 'HH:mm')
      const dateStr = format(date, 'MMM d')
      
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={-5}
            textAnchor='middle'
            fill={axisColor}
            fontSize={10}
          >
            {hour}
          </text>
          <text
            x={0}
            y={0}
            dy={10}
            textAnchor='middle'
            fill={axisColor}
            fontSize={9}
          >
            {dateStr}
          </text>
        </g>
      )
    } catch {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} textAnchor='middle' fill={axisColor} fontSize={10}>
            {payload.value}
          </text>
        </g>
      )
    }
  }

  return (
    <div ref={containerRef}>
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--muted))' opacity={0.3} />
          <XAxis
            dataKey='timestamp'
            stroke={axisColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={CustomTick}
            height={50}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={35}
            padding={{ top: 0, bottom: 0 }}
            domain={yDomain}
            tickFormatter={(value) => {
              const num = Number(value)
              if (isNaN(num)) return ''
              return num.toFixed(1)
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null

              return (
                <div className='bg-background border rounded-lg p-3 shadow-lg'>
                  <p className='font-semibold mb-2'>
                    {label ? format(new Date(label), 'MMM d, yyyy HH:mm') : ''}
                  </p>
                  {payload.map((entry, index) => {
                    const value = entry.value as number | null
                    return (
                      <p
                        key={index}
                        style={{ color: entry.color }}
                        className='text-sm'
                      >
                        {entry.name}: {value !== null ? value.toFixed(2) : 'N/A'}
                      </p>
                    )
                  })}
                </div>
              )
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px', paddingBottom: '10px' }}
            iconType='line'
            content={({ payload }) => {
              return (
                <div className='flex flex-wrap justify-center gap-4 px-4'>
                  {/* Add AI Offline legend entry */}
                  {offlinePeriods.length > 0 && (
                    <div className='flex items-center gap-2'>
                      <div
                        style={{
                          width: '20px',
                          height: '12px',
                          backgroundColor: isDark ? '#808080' : '#999999',
                          opacity: 0.12,
                        }}
                      />
                      <span className='text-sm text-muted-foreground'>AI Offline</span>
                    </div>
                  )}
                  {payload?.map((entry, index) => {
                    const isHidden = hiddenLines.has(entry.value as string)
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          // Clear any pending timeout
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current)
                            clickTimeoutRef.current = null
                            return
                          }
                          // Set a timeout for single click
                          clickTimeoutRef.current = setTimeout(() => {
                            toggleLine(entry.value as string)
                            clickTimeoutRef.current = null
                          }, 250)
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.cursor = 'pointer'
                          e.currentTarget.style.opacity = '0.7'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                        style={{
                          opacity: isHidden ? 0.5 : 1,
                          textDecoration: isHidden ? 'line-through' : 'none',
                        }}
                        className='flex items-center gap-2'
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '2px',
                            backgroundColor: entry.value?.includes('Min') || entry.value?.includes('Max')
                              ? 'transparent'
                              : (entry.color as string),
                            borderTop: entry.value === 'Min' || entry.value === 'Max'
                              ? `2px dashed ${entry.color as string}`
                              : 'none',
                          }}
                        />
                        <span className='text-sm'>{entry.value}</span>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          />
          {/* AI Offline periods - grey overlay */}
          {offlinePeriods.map((period, index) => (
            <ReferenceArea
              key={`offline-${index}`}
              x1={period.start}
              x2={period.end}
              y1={yDomain[0]}
              y2={yDomain[1]}
              fill={isDark ? '#808080' : '#999999'}
              fillOpacity={0.12}
              stroke='none'
            />
          ))}
          {/* Signal Min - dashed line */}
          <Line
            type={DEFAULT_LINE_TYPE}
            dataKey='signalMin'
            stroke={isDark ? '#a0a0a0' : '#808080'}
            strokeWidth={1.5}
            strokeDasharray='5 5'
            dot={false}
            activeDot={{ r: 3 }}
            name='Min'
            strokeOpacity={0.4}
            connectNulls={false}
            hide={hiddenLines.has('Min')}
            isAnimationActive={false}
          />
          {/* Signal Max - dashed line */}
          <Line
            type={DEFAULT_LINE_TYPE}
            dataKey='signalMax'
            stroke={isDark ? '#a0a0a0' : '#808080'}
            strokeWidth={1.5}
            strokeDasharray='5 5'
            dot={false}
            activeDot={{ r: 3 }}
            name='Max'
            strokeOpacity={0.4}
            connectNulls={false}
            hide={hiddenLines.has('Max')}
            isAnimationActive={false}
          />
          {/* Baseline - using default line type for consistency */}
          <Line
            type={DEFAULT_LINE_TYPE}
            dataKey='baseline'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name='Baseline'
            connectNulls={false}
            hide={hiddenLines.has('Baseline')}
            isAnimationActive={false}
          />
          {/* Signal - bold line */}
          <Line
            type={DEFAULT_LINE_TYPE}
            dataKey='signal'
            stroke={foregroundColor}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            name={signalName}
            connectNulls={false}
            hide={hiddenLines.has(signalName)}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

