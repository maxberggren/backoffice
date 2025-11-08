import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type AnalysisConfig } from '../data/schema'

interface ConfigurationSectionProps {
  config: AnalysisConfig
  onConfigChange: (config: Partial<AnalysisConfig>) => void
  tempRange: [number, number]
}

export function ConfigurationSection({
  config,
  onConfigChange,
  tempRange,
}: ConfigurationSectionProps) {
  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CardHeader className='pb-3'>
          <CollapsibleTrigger className='flex items-center gap-2 w-full group'>
            <ChevronDown className='h-4 w-4 transition-transform group-data-[state=open]:rotate-180' />
            <CardTitle className='text-lg'>Configuration</CardTitle>
          </CollapsibleTrigger>
          <CardDescription>
            Configure analysis parameters and filters
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className='space-y-6 pt-0'>
            <div className='space-y-3'>
              <Label className='text-base font-medium'>Control Signal Type</Label>
              <RadioGroup
                value={config.controlSignalType}
                onValueChange={(value) =>
                  onConfigChange({ controlSignalType: value as AnalysisConfig['controlSignalType'] })
                }
                className='space-y-3'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='myrspoven_ds' id='myrspoven_ds' />
                  <Label htmlFor='myrspoven_ds' className='font-normal cursor-pointer'>
                    Myrspoven_DS
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='split_by_dates' id='split_by_dates' />
                  <Label htmlFor='split_by_dates' className='font-normal cursor-pointer'>
                    Split by date ranges
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {config.controlSignalType === 'myrspoven_ds' && (
              <>
                <Separator />
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-base font-medium'>ON State Threshold</Label>
                    <span className='text-sm text-muted-foreground'>
                      {config.onThreshold[0].toFixed(2)} - {config.onThreshold[1].toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={config.onThreshold}
                    onValueChange={(value) => onConfigChange({ onThreshold: value as [number, number] })}
                    min={0}
                    max={1}
                    step={0.05}
                    className='w-full'
                  />
                  <p className='text-sm text-muted-foreground'>
                    Range of values considered as AI control ON state
                  </p>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-base font-medium'>OFF State Threshold</Label>
                    <span className='text-sm text-muted-foreground'>
                      {config.offThreshold[0].toFixed(2)} - {config.offThreshold[1].toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={config.offThreshold}
                    onValueChange={(value) => onConfigChange({ offThreshold: value as [number, number] })}
                    min={0}
                    max={1}
                    step={0.05}
                    className='w-full'
                  />
                  <p className='text-sm text-muted-foreground'>
                    Range of values considered as AI control OFF state
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-medium'>Outdoor Temperature Range</Label>
                <span className='text-sm text-muted-foreground'>
                  {config.temperatureRange[0]}°C - {config.temperatureRange[1]}°C
                </span>
              </div>
              <Slider
                value={config.temperatureRange}
                onValueChange={(value) =>
                  onConfigChange({ temperatureRange: value as [number, number] })
                }
                min={tempRange[0]}
                max={tempRange[1]}
                step={1}
                className='w-full'
              />
              <p className='text-sm text-muted-foreground'>
                Filter data within this outdoor temperature range
              </p>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label className='text-base font-medium'>Hour of Day Filter</Label>
                <span className='text-sm text-muted-foreground'>
                  {config.hourRange[0]}:00 - {config.hourRange[1]}:00
                </span>
              </div>
              <Slider
                value={config.hourRange}
                onValueChange={(value) => onConfigChange({ hourRange: value as [number, number] })}
                min={0}
                max={24}
                step={1}
                className='w-full'
              />
              <p className='text-sm text-muted-foreground'>
                Filter data within these hours of the day
              </p>
            </div>

            <Separator />

            <div className='space-y-3'>
              <Label htmlFor='min-samples' className='text-base font-medium'>
                Minimum Samples Threshold
              </Label>
              <Input
                id='min-samples'
                type='number'
                value={config.minSamplesThreshold}
                onChange={(e) =>
                  onConfigChange({ minSamplesThreshold: parseInt(e.target.value) || 30 })
                }
                min={1}
                className='w-full max-w-[200px]'
              />
              <p className='text-sm text-muted-foreground'>
                Minimum number of samples required for valid analysis
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

