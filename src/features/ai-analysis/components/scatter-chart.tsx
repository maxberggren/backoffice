import { Scatter, ScatterChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { type ScatterPoint } from '../data/schema'

interface ScatterChartProps {
  data: ScatterPoint[] | undefined
  signalName: string
  isLoading?: boolean
}

export function SignalTemperatureScatterChart({ data, signalName, isLoading }: ScatterChartProps) {
  if (isLoading || !data) {
    return (
      <div className='space-y-2'>
        <h3 className='font-semibold'>
          {signalName} vs Outdoor Temperature by Control State (After Filters)
        </h3>
        <Skeleton className='h-[150px] w-full' />
      </div>
    )
  }

  const onData = data.filter((p) => p.controlState === 1)
  const offData = data.filter((p) => p.controlState === 0)

  return (
    <div className='space-y-2'>
      <h3 className='font-semibold'>
        {signalName} vs Outdoor Temperature by Control State (After Filters)
      </h3>
      <ResponsiveContainer width='100%' height={150}>
        <ScatterChart>
          <XAxis
            type='number'
            dataKey='temperature'
            name='Outdoor Temperature'
            unit='°C'
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type='number'
            dataKey='signalValue'
            name={signalName}
            stroke='#888888'
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0].payload as ScatterPoint
              return (
                <div className='bg-background border rounded-lg p-2 shadow-lg'>
                  <p className='font-semibold'>
                    Temp: {point.temperature.toFixed(1)}°C
                  </p>
                  <p>
                    {signalName}: {point.signalValue.toFixed(2)}
                  </p>
                  <p className={point.controlState === 1 ? 'text-[#e2673b]' : 'text-[#c6cacc]'}>
                    Control = {point.controlState === 1 ? 'ON' : 'OFF'}
                  </p>
                </div>
              )
            }}
          />
          <Legend />
          <Scatter name='Control = OFF' data={offData} fill='#c6cacc' fillOpacity={0.6}>
            {offData.map((_entry, index) => (
              <Cell key={`off-${index}`} fill='#c6cacc' fillOpacity={0.6} />
            ))}
          </Scatter>
          <Scatter name='Control = ON' data={onData} fill='#e2673b' fillOpacity={0.6}>
            {onData.map((_entry, index) => (
              <Cell key={`on-${index}`} fill='#e2673b' fillOpacity={0.6} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

