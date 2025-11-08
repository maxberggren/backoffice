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
import { type Building } from '@/features/users/data/schema'
import { useBuildingStore } from '@/stores/building-store'
import { cn } from '@/lib/utils'

type BuildingSwitcherProps = {
  buildings: Building[]
}

export function BuildingSwitcher({ buildings }: BuildingSwitcherProps) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = React.useState(false)
  const { selectedBuilding, setSelectedBuilding } = useBuildingStore()
  
  // Initialize with first building if none selected
  React.useEffect(() => {
    if (!selectedBuilding && buildings.length > 0) {
      setSelectedBuilding(buildings[0])
    }
  }, [selectedBuilding, buildings, setSelectedBuilding])

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
                  {selectedBuilding?.name || 'Select building'}
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
              <CommandInput placeholder='Search buildings...' />
              <CommandList>
                <CommandEmpty>No building found.</CommandEmpty>
                <CommandGroup>
                  {buildings.map((building) => (
                    <CommandItem
                      key={building.id}
                      value={`${building.name} ${building.company}`}
                      onSelect={() => {
                        setSelectedBuilding(building)
                        setOpen(false)
                      }}
                      className={cn(
                        'p-2',
                        selectedBuilding?.id === building.id &&
                          'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>{building.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {building.company}
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


