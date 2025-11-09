import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { type Property } from '@/features/users/data/schema'
import { usePropertyStore } from '@/stores/property-store'
import { cn } from '@/lib/utils'

type PropertySwitcherProps = {
  properties: Property[]
}

export function PropertySwitcher({ properties }: PropertySwitcherProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = React.useState(false)
  const { selectedProperty, setSelectedProperty } = usePropertyStore()
  
  // Initialize with first property if none selected
  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0])
    }
  }, [selectedProperty, properties, setSelectedProperty])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-9 items-center justify-center rounded-lg overflow-hidden'>
                <img 
                  src='/images/bird.png' 
                  alt='Myrspoven Logo' 
                  className='size-[108%] object-cover invert dark:invert-0'
                />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>Myrspoven</span>
                <span className='truncate text-xs'>
                  {selectedProperty?.name || 'Select property'}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            className='w-[var(--radix-popover-trigger-width)] min-w-56 p-0'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder='Search properties...' />
              <CommandList>
                <CommandEmpty>No property found.</CommandEmpty>
                <CommandGroup>
                  {properties.map((property) => (
                    <CommandItem
                      key={property.id}
                      value={`${property.name} ${property.company}`}
                      onSelect={() => {
                        setSelectedProperty(property)
                        setOpen(false)
                      }}
                      className={cn(
                        'p-2',
                        selectedProperty?.id === property.id &&
                          'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>{property.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {property.company}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}


