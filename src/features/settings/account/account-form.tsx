import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/date-picker'

const optimizationStrategies = [
  { label: 'Energy Efficiency', value: 'energy' },
  { label: 'Comfort Priority', value: 'comfort' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Cost Optimization', value: 'cost' },
  { label: 'Peak Shaving', value: 'peak' },
] as const

const accountFormSchema = z.object({
  targetTemperature: z
    .string()
    .min(1, 'Please enter target temperature.')
    .regex(/^\d+(\.\d+)?$/, 'Please enter a valid number.'),
  temperatureTolerance: z.date().optional(),
  optimizationStrategy: z.string('Please select an optimization strategy.'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  targetTemperature: '22',
}

export function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  function onSubmit(data: AccountFormValues) {
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='targetTemperature'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Temperature (°C)</FormLabel>
              <FormControl>
                <Input placeholder='22' type='number' step='0.1' {...field} />
              </FormControl>
              <FormDescription>
                The default target temperature for all buildings. Can be overridden per building.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='temperatureTolerance'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>AI Learning Start Date</FormLabel>
              <DatePicker selected={field.value} onSelect={field.onChange} />
              <FormDescription>
                The date when AI started learning from your building data. Historical data before this date may be less accurate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='optimizationStrategy'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Optimization Strategy</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[250px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? optimizationStrategies.find(
                            (strategy) => strategy.value === field.value
                          )?.label
                        : 'Select strategy'}
                      <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[250px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search strategy...' />
                    <CommandEmpty>No strategy found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {optimizationStrategies.map((strategy) => (
                          <CommandItem
                            value={strategy.label}
                            key={strategy.value}
                            onSelect={() => {
                              form.setValue('optimizationStrategy', strategy.value)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'size-4',
                                strategy.value === field.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {strategy.label}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Choose the primary optimization strategy for the AI to follow.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Update AI Configuration</Button>
      </form>
    </Form>
  )
}
