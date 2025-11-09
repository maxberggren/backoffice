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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef, useState } from 'react'
import { type TrainingMetrics } from '../data/schema'

interface AccuracyChartProps {
  data: TrainingMetrics[]
  isLoading?: boolean
}

export function AccuracyChart({ data, isLoading }: AccuracyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [axisColor, setAxisColor] = useState('#888888')
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setAxisColor(isDark ? '#a0a0a0' : '#666666')
    }

    updateColor()

    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
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

  // Filter out data points without accuracy values
  const chartData = data.filter((d) => d.trainAccuracy !== undefined && d.valAccuracy !== undefined)

  if (isLoading || !data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Accuracy</CardTitle>
          <CardDescription>Accuracy values over training epochs</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[400px] w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Training Accuracy</CardTitle>
        <CardDescription>Accuracy values over training epochs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' stroke={axisColor} opacity={0.2} />
            <XAxis
              dataKey='epoch'
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fill: axisColor }}
            />
            <YAxis
              stroke={axisColor}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              label={{ value: 'Accuracy', angle: -90, position: 'insideLeft', fill: axisColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelFormatter={(value) => `Epoch ${value}`}
              formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, '']}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType='line'
              onClick={(e) => {
                const value = e.dataKey as string
                if (value) {
                  toggleLine(value)
                }
              }}
              formatter={(value, entry) => {
                const isHidden = hiddenLines.has(entry.dataKey as string)
                return (
                  <span
                    style={{
                      color: isHidden ? '#888' : undefined,
                      cursor: 'pointer',
                      textDecoration: isHidden ? 'line-through' : undefined,
                    }}
                  >
                    {value}
                  </span>
                )
              }}
            />
            <Line
              type='monotone'
              dataKey='trainAccuracy'
              stroke='hsl(var(--primary))'
              strokeWidth={2}
              dot={false}
              name='Training Accuracy'
              hide={hiddenLines.has('trainAccuracy')}
            />
            <Line
              type='monotone'
              dataKey='valAccuracy'
              stroke='hsl(var(--chart-2))'
              strokeWidth={2}
              dot={false}
              name='Validation Accuracy'
              hide={hiddenLines.has('valAccuracy')}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

