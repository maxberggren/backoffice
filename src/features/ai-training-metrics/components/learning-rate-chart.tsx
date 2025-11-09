import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef, useState } from 'react'
import { type TrainingMetrics } from '../data/schema'

interface LearningRateChartProps {
  data: TrainingMetrics[]
  isLoading?: boolean
}

export function LearningRateChart({ data, isLoading }: LearningRateChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [axisColor, setAxisColor] = useState('#888888')

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

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Rate Schedule</CardTitle>
          <CardDescription>Learning rate decay over training epochs</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[300px] w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={containerRef}>
      <CardHeader>
        <CardTitle>Learning Rate Schedule</CardTitle>
        <CardDescription>Learning rate decay over training epochs</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
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
              tickFormatter={(value) => value.toExponential(1)}
              label={{ value: 'Learning Rate', angle: -90, position: 'insideLeft', fill: axisColor }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelFormatter={(value) => `Epoch ${value}`}
              formatter={(value: number) => [value.toExponential(4), 'Learning Rate']}
            />
            <Line
              type='monotone'
              dataKey='learningRate'
              stroke='hsl(var(--chart-3))'
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

