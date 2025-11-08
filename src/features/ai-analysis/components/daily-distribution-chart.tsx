import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { type DailyDistribution } from '../data/schema'
import { format, parseISO } from 'date-fns'

interface DailyDistributionChartProps {
  data: DailyDistribution[] | undefined
  isLoading?: boolean
}

export function DailyDistributionChart({ data, isLoading }: DailyDistributionChartProps) {
  if (isLoading || !data) {
    return (
      <div className='space-y-2'>
        <h3 className='font-semibold'>Daily ON/OFF Sample Distribution (After Date/Control Filter)</h3>
        <Skeleton className='h-[150px] w-full' />
      </div>
    )
  }

  const chartData = data.map((d) => ({
    date: format(parseISO(d.date), 'MMM dd'),
    fullDate: d.date,
    on: d.onCount,
    off: d.offCount,
  }))

  return (
    <div className='space-y-2'>
      <h3 className='font-semibold'>Daily ON/OFF Sample Distribution (After Date/Control Filter)</h3>
      <ResponsiveContainer width='100%' height={150}>
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
          <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload
              return (
                <div className='bg-background border rounded-lg p-2 shadow-lg'>
                  <p className='font-semibold'>{data.fullDate}</p>
                  <p className='text-[#e2673b]'>Control = ON: {data.on}</p>
                  <p className='text-[#c6cacc]'>Control = OFF: {data.off}</p>
                </div>
              )
            }}
          />
          <Legend />
          <Bar dataKey='on' stackId='a' fill='#e2673b' name='Control = ON' />
          <Bar dataKey='off' stackId='a' fill='#c6cacc' name='Control = OFF' />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

