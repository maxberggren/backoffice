# HVAC AI Backoffice Transformation

This document outlines the transformation of the shadcn-admin template into an HVAC AI Backoffice system.

## Overview

The repository has been successfully adapted from a general-purpose admin dashboard into a specialized backoffice system for managing AI-controlled HVAC systems across multiple buildings.

## Key Changes

### 1. Branding & Documentation

**Files Modified:**
- `package.json` - Updated project name to "hvac-ai-backoffice" (v1.0.0)
- `README.md` - Complete rewrite focusing on HVAC AI management features
- `index.html` - Updated title, meta tags, and descriptions

**New Features Described:**
- Multi-building management
- AI configuration and optimization
- Real-time monitoring (temperature, humidity, energy)
- Alert system for maintenance
- Energy analytics and insights
- Schedule management
- Remote operations

### 2. Navigation & Sidebar

**File:** `src/components/layout/data/sidebar-data.ts`

**Updated Structure:**
```
Monitoring
├── Dashboard
├── Buildings (formerly Users)
├── System Status (formerly Chats)
└── Alerts (formerly Tasks)

AI Configuration
├── AI Models (formerly Apps)
├── Schedules
├── Energy Analytics
└── Automation Rules

Administration
├── Operators
└── Secured by Clerk

System
├── Settings
│   ├── Profile
│   ├── AI Configuration (formerly Account)
│   ├── Appearance
│   ├── Notifications
│   └── Display
├── Documentation
├── Error Pages
└── Auth Pages
```

**Team Switcher Updated:**
- HVAC AI Control (AI-Powered)
- Building Portfolio A (12 Buildings)
- Building Portfolio B (8 Buildings)

### 3. Dashboard

**Files Modified:**
- `src/features/dashboard/index.tsx`
- `src/features/dashboard/components/recent-sales.tsx`

**Metrics Transformed:**
- Total Revenue → Avg Temperature (21.5°C)
- Subscriptions → Active Buildings (18/20)
- Sales → Energy Usage (1,234 kWh, -15% AI optimized)
- Active Now → Active Alerts (3)

**Overview Cards:**
- Overview → Temperature Trends (7-day chart)
- Recent Sales → Recent System Events (AI optimizations, temperature adjustments, alerts)

**Recent Events Include:**
- AI Optimization Applied
- Temperature Adjusted
- Maintenance Required
- Schedule Updated
- New Building Added

### 4. Buildings Management (formerly Users)

**Files Modified:**
- `src/features/users/index.tsx`
- `src/features/users/data/schema.ts`
- `src/features/users/data/users.ts`

**Schema Transformed:**
```typescript
Building {
  id: string
  name: string           // e.g., "Corporate Tower North"
  address: string
  city: string
  type: 'office' | 'residential' | 'retail' | 'industrial'
  status: 'operational' | 'maintenance' | 'offline' | 'warning'
  temperature: number    // Current temperature
  targetTemperature: number
  humidity: number       // Percentage
  energyUsage: number   // kWh
  floors: number
  createdAt: Date
  updatedAt: Date
}
```

**Generated Data:** 50 buildings with realistic HVAC data

### 5. Alerts & Maintenance (formerly Tasks)

**Files Modified:**
- `src/features/tasks/index.tsx`
- `src/features/tasks/data/schema.ts`
- `src/features/tasks/data/tasks.ts`

**Schema Transformed:**
```typescript
Alert/MaintenanceTask {
  id: string            // Format: ALERT-####
  title: string         // e.g., "Temperature deviation detected in Zone..."
  status: 'open' | 'in-progress' | 'resolved'
  label: 'maintenance' | 'temperature' | 'energy' | 'system-error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  building: string      // Building name
  location: string      // Floor and zone
  createdAt: Date
}
```

**Alert Types:**
- Temperature deviations
- Filter replacements
- High energy consumption
- System pressure abnormalities
- Humidity issues
- Scheduled maintenance
- Thermostat malfunctions
- Air quality sensor calibration
- Compressor issues
- Ventilation blockages
- Refrigerant levels
- Fan motor problems
- Control system errors
- Temperature sensor faults

### 6. AI Models Configuration (formerly Apps)

**Files Modified:**
- `src/features/apps/index.tsx`
- `src/features/apps/data/apps.tsx`

**AI Models Available:**

**Active Models:**
1. Temperature Optimization - Occupancy & weather-based temperature control
2. Energy Efficiency - Reduces consumption through pattern prediction
3. Predictive Maintenance - Predicts equipment failures
4. Occupancy Detection - Sensor-based occupancy adjustment
5. Weather Prediction - Integrates forecasts for pre-adjustment
6. Air Quality Monitor - Optimizes ventilation rates
7. Smart Scheduling - Creates optimal HVAC schedules
8. Anomaly Detection - Identifies unusual system behavior
9. Trend Analysis - Historical data analysis

**Inactive Models (Available to Activate):**
1. Load Balancing - Distributes HVAC load
2. Demand Response - Grid demand signal response
3. Comfort Optimization - Balances climate factors
4. Multi-Zone Control - Independent zone management
5. Reinforcement Learning - Advanced continuous learning

### 7. Settings - AI Configuration

**Files Modified:**
- `src/features/settings/account/index.tsx`
- `src/features/settings/account/account-form.tsx`

**Configuration Options:**
1. **Target Temperature** - Default temperature for all buildings (°C)
2. **AI Learning Start Date** - When AI started learning from building data
3. **Optimization Strategy:**
   - Energy Efficiency
   - Comfort Priority
   - Balanced
   - Cost Optimization
   - Peak Shaving

## Technical Details

### Technology Stack (Unchanged)
- React 19
- TypeScript
- Vite
- TanStack Router
- shadcn/ui (TailwindCSS + RadixUI)
- Zod for validation
- React Hook Form

### Data Generation
- Uses @faker-js/faker for realistic test data
- Fixed seeds for consistent data generation
- Realistic HVAC parameters and patterns

### Backwards Compatibility
- Old type aliases maintained during transition (e.g., `User` → `Building`)
- Component names kept consistent to minimize refactoring
- File structure preserved for easy navigation

## Running the Application

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm preview
```

## Next Steps & Recommendations

### Immediate Enhancements:
1. **Real-time Data Integration** - Connect to actual HVAC systems via API
2. **Advanced Analytics** - Implement energy consumption charts and predictions
3. **Building Details Page** - Create detailed view for individual buildings with zone-level controls
4. **Alert Management** - Add ability to acknowledge, assign, and resolve alerts
5. **Schedule Builder** - Create visual schedule editor for HVAC automation
6. **AI Model Configuration** - Add detailed settings pages for each AI model
7. **Historical Data Views** - Add time-series charts for temperature, energy, etc.
8. **Mobile Responsiveness** - Already responsive, but could optimize for mobile operators

### Advanced Features:
1. **Real-time Notifications** - WebSocket integration for live alerts
2. **Building Floor Plans** - Interactive floor plans showing zone temperatures
3. **Weather Integration** - Connect to weather APIs for predictions
4. **Cost Analytics** - Add energy cost tracking and billing integration
5. **Compliance Reports** - Generate reports for regulatory compliance
6. **Multi-user Permissions** - Role-based access for different operator levels
7. **Audit Logging** - Track all changes and AI decisions
8. **API Documentation** - Document endpoints for integration

### Backend Integration:
```typescript
// Example API structure needed
interface HVACAPI {
  buildings: {
    list: () => Promise<Building[]>
    get: (id: string) => Promise<Building>
    update: (id: string, data: Partial<Building>) => Promise<Building>
  }
  alerts: {
    list: () => Promise<Alert[]>
    resolve: (id: string) => Promise<void>
  }
  ai: {
    models: () => Promise<AIModel[]>
    configure: (modelId: string, config: AIConfig) => Promise<void>
  }
  analytics: {
    energy: (buildingId: string, range: DateRange) => Promise<EnergyData>
    temperature: (buildingId: string, range: DateRange) => Promise<TempData>
  }
}
```

## Credits

This boilerplate is built on the foundation of [shadcn-admin](https://github.com/satnaing/shadcn-admin) by [@satnaing](https://github.com/satnaing) and adapted for HVAC AI management.

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)


