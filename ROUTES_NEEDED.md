# Routes to Add for New Pages

To integrate the new Signal Export, Signal Viewer, and Building Detail pages, you need to create the following TanStack Router route files:

## Required Route Files

### 1. Signal Export Route
**File:** `src/routes/_authenticated/signals/export.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignalExport } from '@/features/signals'

export const Route = createFileRoute('/_authenticated/signals/export')({
  component: SignalExport,
})
```

### 2. Signal Viewer Route
**File:** `src/routes/_authenticated/signals/viewer.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignalViewer } from '@/features/signals/signal-viewer'

export const Route = createFileRoute('/_authenticated/signals/viewer')({
  component: SignalViewer,
})
```

### 3. Building Detail Route
**File:** `src/routes/_authenticated/users/$buildingId.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BuildingDetailForm } from '@/features/users/components/building-detail'

export const Route = createFileRoute('/_authenticated/users/$buildingId')({
  component: BuildingDetail,
})

function BuildingDetail() {
  const { buildingId } = Route.useParams()

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Building Configuration
          </h2>
          <p className='text-muted-foreground'>
            Configure building settings and AI parameters
          </p>
        </div>
        <BuildingDetailForm buildingId={buildingId} />
      </Main>
    </>
  )
}
```

## Directory Structure to Create

```
src/routes/_authenticated/
├── signals/
│   ├── export.tsx     # Signal Export page
│   └── viewer.tsx     # Signal Viewer page
└── users/
    └── $buildingId.tsx # Building Detail page (dynamic route)
```

## Update Sidebar Navigation URLs

After creating the routes, update `src/components/layout/data/sidebar-data.ts`:

```typescript
{
  title: 'Signals',
  icon: Radio,
  items: [
    {
      title: 'Signal Viewer',
      url: '/signals/viewer',  // Update this
    },
    {
      title: 'Export to Excel',
      url: '/signals/export',  // Update this
    },
  ],
},
```

## Create Index Export Files

### Signal Features Index
**File:** `src/features/signals/index.ts`

```typescript
export { SignalExport } from './index'
export { SignalViewer } from './signal-viewer'
```

## Steps to Complete Integration

1. **Create Route Directories:**
   ```bash
   mkdir -p src/routes/_authenticated/signals
   ```

2. **Create Route Files:**
   - Create `src/routes/_authenticated/signals/export.tsx`
   - Create `src/routes/_authenticated/signals/viewer.tsx`
   - Create `src/routes/_authenticated/users/$buildingId.tsx`

3. **Update Navigation:**
   - Update URLs in `sidebar-data.ts` as shown above

4. **Test Routes:**
   - Navigate to `/signals/export`
   - Navigate to `/signals/viewer`
   - Navigate to `/users/1126` (or any building ID)

5. **Link Building List to Detail:**
   In the Buildings table, add click handlers to navigate to building detail:
   ```tsx
   onClick={() => navigate({ to: `/users/${building.id}` })}
   ```

## Example: Adding Building Detail Link

Update the Buildings table to link to detail page:

**File:** `src/features/users/components/users-table.tsx`

```tsx
// Add import
import { useNavigate } from '@tanstack/react-router'

// In the component
const navigate = useNavigate()

// On table row
<TableRow 
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => navigate({ to: `/users/${building.id}` })}
>
  {/* ... table cells ... */}
</TableRow>
```

## Verification Checklist

After implementing the routes:

- [ ] `/signals/export` loads Signal Export page
- [ ] `/signals/viewer` loads Signal Viewer page
- [ ] `/users/:id` loads Building Detail page with correct ID
- [ ] Sidebar navigation links work correctly
- [ ] Building list links to detail pages
- [ ] Browser back/forward buttons work
- [ ] Page titles update correctly
- [ ] No console errors
- [ ] Routes are type-safe (TypeScript)

## Optional: Add Search Params

For Signal Viewer with filters:

```tsx
export const Route = createFileRoute('/_authenticated/signals/viewer')({
  component: SignalViewer,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page ?? 1),
      search: (search.search as string) ?? '',
      type: (search.type as string) ?? 'all',
    }
  },
})
```

Then use in component:
```tsx
const search = Route.useSearch()
const navigate = Route.useNavigate()

// Update URL when filters change
navigate({ search: { ...search, page: newPage } })
```

---

**Note:** After creating these routes, run `pnpm dev` and test all navigation paths. The router will automatically pick up the new routes.


