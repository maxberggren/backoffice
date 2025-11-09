import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { DatePicker } from '@/components/date-picker'
import { InfoIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePropertyStore } from '@/stores/property-store'

const generalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  lat: z.string(),
  long: z.string(),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  squareMeters: z.string(),
  dataSetStartDate: z.date(),
  rmsThreshold: z.string(),
  editSignalsExternal: z.boolean(),
  externalLink: z.string().optional(),
})

type GeneralValues = z.infer<typeof generalSchema>

interface GeneralFormProps {
  propertyId?: string
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex items-center'
          onClick={(e) => e.preventDefault()}
        >
          <InfoIcon className='ml-1.5 size-4 text-muted-foreground' />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className='max-w-xs'>{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function ConfigurationGeneral({ propertyId = '1126' }: GeneralFormProps) {
  const { selectedProperty } = usePropertyStore()

  const form = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      id: propertyId,
      name: selectedProperty?.name || '',
      lat: '50.07965',
      long: '14.45357',
      city: selectedProperty?.city || '',
      country: 'Czechia',
      timezone: 'Europe/Prague',
      squareMeters: '36800',
      dataSetStartDate: new Date('2021-12-14T06:00:00'),
      rmsThreshold: '1.700',
      editSignalsExternal: true,
      externalLink: 'https://portal.myrspoven.se/EditSignalsWithToken/EditSignalsToken?webNum',
    },
  })

  // Update form when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      form.setValue('name', selectedProperty.name)
      form.setValue('city', selectedProperty.city)
      form.setValue('id', selectedProperty.id)
    }
  }, [selectedProperty, form])

  function onSubmit(data: GeneralValues) {
    showSubmittedData(data)
  }

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* General Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic property details and location information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property ID</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className='bg-muted' />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this property
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter property name' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='lat'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center'>
                          Latitude
                          <InfoTooltip content='Geographic latitude coordinate' />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='number'
                            step='0.00001'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='long'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center'>
                          Longitude
                          <InfoTooltip content='Geographic longitude coordinate' />
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='number'
                            step='0.00001'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='country'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='timezone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Europe/Prague' />
                      </FormControl>
                      <FormDescription>
                        IANA timezone identifier (e.g., Europe/Prague)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='squareMeters'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Meters</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          placeholder='36800'
                        />
                      </FormControl>
                      <FormDescription>
                        Total floor area in square meters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* System Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  HVAC system settings and thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='dataSetStartDate'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Dataset Start Date</FormLabel>
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                      <FormDescription>
                        Date when data collection began for this property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='rmsThreshold'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center'>
                        RMS Degree Threshold to Close Property
                        <InfoTooltip content='Temperature threshold for automatic property closure' />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='number'
                          step='0.001'
                          placeholder='1.700'
                          value={field.value ? parseFloat(field.value).toFixed(3) : ''}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange('')
                            } else {
                              const numValue = parseFloat(value)
                              if (!isNaN(numValue)) {
                                field.onChange(numValue.toFixed(3))
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Root mean square temperature deviation threshold
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className='my-4' />

                <FormField
                  control={form.control}
                  name='editSignalsExternal'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Enable External Signal Editing
                        </FormLabel>
                        <FormDescription>
                          Allow external systems to edit signals via API
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('editSignalsExternal') && (
                  <FormField
                    control={form.control}
                    name='externalLink'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Link</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='url'
                            placeholder='https://portal.myrspoven.se/...'
                          />
                        </FormControl>
                        <FormDescription>
                          URL for external signal editing portal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className='flex justify-end'>
            <Button type='submit' size='lg'>
              Update Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

