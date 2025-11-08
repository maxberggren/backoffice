import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { type TimeSeriesPoint } from '../data/schema'
import { type GroupData } from '../data/schema'

interface ComfortGroupsChartProps {
  data: TimeSeriesPoint[]
  groups: GroupData[]
  isLoading?: boolean
}

// Color palette for the groups - distinct colors that work in light/dark mode
const GROUP_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#15803d', // Dark green
  '#eab308', // Yellow
  '#f97316', // Orange
  '#8b5cf6', // Purple
]

/**
 * Check if a timestamp is during night hours (22:00 - 06:00)
 */
function isNightTime(timestamp: string): boolean {
  const date = new Date(timestamp)
  const hour = date.getHours()
  return hour >= 22 || hour < 6
}

/**
 * Check if a timestamp is during weekend (Saturday or Sunday)
 */
function isWeekend(timestamp: string): boolean {
  const date = new Date(timestamp)
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Calculate fixed comfort limits with wider bounds during night and weekends
 */
function calculateComfortLimits(timestamp: string): { minLimit: number; maxLimit: number } {
  const isNight = isNightTime(timestamp)
  const isWeekendDay = isWeekend(timestamp)

  // Fixed base comfort range (typical indoor temperature range)
  const baseMin = 20.0 // °C
  const baseMax = 24.0 // °C

  if (isWeekendDay && isNight) {
    // Weekend night: most liberal limits (widest range)
    return {
      minLimit: baseMin - 4.0, // 16°C
      maxLimit: baseMax + 4.0, // 28°C
    }
  } else if (isWeekendDay) {
    // Weekend day: very liberal limits (wider range)
    return {
      minLimit: baseMin - 3.0, // 17°C
      maxLimit: baseMax + 3.0, // 27°C
    }
  } else if (isNight) {
    // Weekday night: very liberal limits (wider range)
    return {
      minLimit: baseMin - 2.5, // 17.5°C
      maxLimit: baseMax + 2.5, // 26.5°C
    }
  } else {
    // Weekday day: standard limits
    return {
      minLimit: baseMin - 0.5, // 19.5°C
      maxLimit: baseMax + 0.5, // 24.5°C
    }
  }
}

export function ComfortGroupsChart({
  data,
  groups,
  isLoading,
}: ComfortGroupsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [foregroundColor, setForegroundColor] = useState('#ffffff')
  const [axisColor, setAxisColor] = useState('#888888')
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get computed foreground color from CSS variable and update on theme change
  useEffect(() => {
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setForegroundColor(isDark ? '#ffffff' : '#000000')
      setAxisColor(isDark ? '#a0a0a0' : '#666666') // Lighter gray for dark mode
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

  const showOnlyGroup = (groupName: string) => {
    // Hide all groups except the selected one, keep reference lines visible
    const allGroupNames = groups.map((g) => g.category.name)
    const hidden = new Set<string>()
    
    // Hide all groups that are not the selected one
    for (const name of allGroupNames) {
      if (name !== groupName) {
        hidden.add(name)
      }
    }
    
    setHiddenLines(hidden)
  }

  if (isLoading || !data || data.length === 0) {
    return (
      <div>
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  // Prepare data with fixed comfort limits
  const chartData = data.map((point) => {
    const limits = calculateComfortLimits(point.timestamp)
    return {
      ...point,
      minComfortLimit: limits.minLimit,
      maxComfortLimit: limits.maxLimit,
    }
  })

  // Determine if we should show hours (if range is less than a day)
  const shouldShowHours = (() => {
    if (data.length < 2) return false
    const firstDate = new Date(data[0].timestamp)
    const lastDate = new Date(data[data.length - 1].timestamp)
    const diffInHours = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60)
    return diffInHours < 24
  })()

  // Format timestamp for X-axis
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem)
      if (shouldShowHours) {
        return format(date, 'HH:mm')
      }
      return format(date, 'MMM d')
    } catch {
      return tickItem
    }
  }

  return (
    <div ref={containerRef}>
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} isAnimationActive={false}>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--muted))' opacity={0.3} />
          <XAxis
            dataKey='timestamp'
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxis}
            angle={-45}
            textAnchor='end'
            height={60}
          />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={35}
            padding={{ left: 0, right: 0 }}
            domain={[10, 30]}
            tickFormatter={(value) => {
              const num = Number(value)
              if (isNaN(num)) return ''
              return num.toFixed(0)
            }}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null

              return (
                <div className='bg-background border rounded-lg p-3 shadow-lg'>
                  <p className='font-semibold mb-2'>
                    {format(new Date(label), 'MMM d, yyyy HH:mm')}
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
                  {payload?.map((entry, index) => {
                    const isHidden = hiddenLines.has(entry.value as string)
                    const isGroup = groups.some((g) => g.category.name === entry.value)
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
                        onDoubleClick={() => {
                          // Clear the single click timeout
                          if (clickTimeoutRef.current) {
                            clearTimeout(clickTimeoutRef.current)
                            clickTimeoutRef.current = null
                          }
                          if (isGroup) {
                            showOnlyGroup(entry.value as string)
                          }
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
                            backgroundColor: entry.value?.includes('Limit') ? 'transparent' : (entry.color as string),
                            borderTop: entry.value?.includes('Limit') 
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
          {/* 6 groups in different colors */}
          {groups.slice(0, 6).map((group, index) => {
            const color = GROUP_COLORS[index % GROUP_COLORS.length]
            const isHidden = hiddenLines.has(group.category.name)
            return (
              <Line
                key={group.category.id}
                type='stepAfter'
                dataKey={group.category.name}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.5}
                dot={false}
                activeDot={{ r: 4 }}
                name={group.category.name}
                connectNulls={false}
                hide={isHidden}
                isAnimationActive={false}
              />
            )
          })}
          {/* Min comfort limit - dashed line */}
          <Line
            type='stepAfter'
            dataKey='minComfortLimit'
            stroke={foregroundColor}
            strokeWidth={1.5}
            strokeDasharray='5 5'
            dot={false}
            activeDot={{ r: 3 }}
            name='Min Comfort Limit'
            strokeOpacity={0.7}
            connectNulls={false}
            hide={hiddenLines.has('Min Comfort Limit')}
            isAnimationActive={false}
          />
          {/* Max comfort limit - dashed line (on top) */}
          <Line
            type='stepAfter'
            dataKey='maxComfortLimit'
            stroke={foregroundColor}
            strokeWidth={1.5}
            strokeDasharray='5 5'
            dot={false}
            activeDot={{ r: 3 }}
            name='Max Comfort Limit'
            strokeOpacity={0.7}
            connectNulls={false}
            hide={hiddenLines.has('Max Comfort Limit')}
            isAnimationActive={false}
          />
          {/* Overall average - bold line (on top) */}
          <Line
            type='stepAfter'
            dataKey='overallAverage'
            stroke={foregroundColor}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
            name='Overall Average'
            connectNulls={false}
            hide={hiddenLines.has('Overall Average')}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

