import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SIGNAL_CATEGORIES, getSignalsForCategory } from '../data/signal-categories'
import { type SignalCategory } from '../data/schema'

interface SignalSelectorProps {
  selectedCategory: SignalCategory | null
  selectedSignal: string | null
  availableSignals: string[]
  onCategoryChange: (category: SignalCategory | null) => void
  onSignalChange: (signal: string | null) => void
  normalize20C: boolean
  onNormalize20CChange: (value: boolean) => void
  affinityLaw: boolean
  onAffinityLawChange: (value: boolean) => void
  temperatureDiff: boolean
  onTemperatureDiffChange: (value: boolean) => void
}

export function SignalSelector({
  selectedCategory,
  selectedSignal,
  availableSignals,
  onCategoryChange,
  onSignalChange,
  normalize20C,
  onNormalize20CChange,
  affinityLaw,
  onAffinityLawChange,
  temperatureDiff,
  onTemperatureDiffChange,
}: SignalSelectorProps) {
  const categorySignals =
    selectedCategory ? getSignalsForCategory(selectedCategory, availableSignals) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Selection</CardTitle>
        <CardDescription>
          Choose the signal category and specific signal to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label className='text-base font-medium'>Signal Category</Label>
          <Select
            value={selectedCategory?.id ?? ''}
            onValueChange={(value) => {
              const category = SIGNAL_CATEGORIES.find((c) => c.id === value) ?? null
              onCategoryChange(category)
              onSignalChange(null)
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select category' />
            </SelectTrigger>
            <SelectContent>
              {SIGNAL_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && (
          <>
            <Separator />
            <div className='space-y-2'>
              <Label className='text-base font-medium'>Signal</Label>
              <Select
                value={selectedSignal ?? ''}
                onValueChange={(value) => {
                  if (value === 'average') {
                    onSignalChange('average')
                  } else {
                    onSignalChange(value)
                  }
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select signal' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='average'>Average of all signals</SelectItem>
                  {categorySignals.map((signal) => (
                    <SelectItem key={signal} value={signal}>
                      {signal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedCategory.hasNormalization ||
              selectedCategory.hasAffinityLaw ||
              selectedCategory.hasTemperatureDiff) && (
              <>
                <Separator />
                <div className='space-y-4'>
                  <Label className='text-base font-medium'>Analysis Options</Label>
                  {selectedCategory.hasNormalization && (
                    <div className='flex items-start space-x-3'>
                      <Checkbox
                        id='normalize-20c'
                        checked={normalize20C}
                        onCheckedChange={(checked) => onNormalize20CChange(checked === true)}
                        className='mt-0.5'
                      />
                      <div className='space-y-0.5'>
                        <Label htmlFor='normalize-20c' className='cursor-pointer font-normal'>
                          Normalize to 20°C baseline
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          Normalize percentage savings calculations against 20°C baseline
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCategory.hasAffinityLaw && (
                    <div className='flex items-start space-x-3'>
                      <Checkbox
                        id='affinity-law'
                        checked={affinityLaw}
                        onCheckedChange={(checked) => onAffinityLawChange(checked === true)}
                        className='mt-0.5'
                      />
                      <div className='space-y-0.5'>
                        <Label htmlFor='affinity-law' className='cursor-pointer font-normal'>
                          Apply affinity law correction
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          Apply affinity law correction to estimate power impact
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedCategory.hasTemperatureDiff && (
                    <div className='flex items-start space-x-3'>
                      <Checkbox
                        id='temp-diff'
                        checked={temperatureDiff}
                        onCheckedChange={(checked) => onTemperatureDiffChange(checked === true)}
                        className='mt-0.5'
                      />
                      <div className='space-y-0.5'>
                        <Label htmlFor='temp-diff' className='cursor-pointer font-normal'>
                          Temperature difference analysis
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          Analyze absolute difference from outdoor temperature (|Signal - t|)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

