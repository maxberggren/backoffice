# HVAC AI Backoffice - Quick Reference

## What Changed: At a Glance

### Navigation Menu Mapping

| Original | New HVAC Context | Description |
|----------|------------------|-------------|
| Dashboard | Dashboard | Now shows HVAC metrics (temp, energy, buildings) |
| Tasks | Alerts & Maintenance | HVAC system alerts and maintenance tasks |
| Apps | AI Models | AI model configuration and management |
| Chats | System Status | Real-time system monitoring |
| Users | Buildings | Building management (was user management) |
| Settings → Account | Settings → AI Configuration | AI model parameters and preferences |

### Data Models

#### Building (was User)
```typescript
{
  name: "Corporate Tower North"
  address: "123 Main St"
  city: "New York"
  type: "office" | "residential" | "retail" | "industrial"
  status: "operational" | "maintenance" | "offline" | "warning"
  temperature: 21.5        // Current °C
  targetTemperature: 22.0  // Target °C
  humidity: 45             // Percentage
  energyUsage: 1234        // kWh
  floors: 15
}
```

#### Alert (was Task)
```typescript
{
  id: "ALERT-1234"
  title: "Temperature deviation detected in Zone Floor 5, Zone A"
  status: "open" | "in-progress" | "resolved"
  label: "maintenance" | "temperature" | "energy" | "system-error"
  priority: "low" | "medium" | "high" | "critical"
  building: "Corporate Tower North"
  location: "Floor 5, Zone A"
}
```

### Dashboard Metrics

| Metric Card | Value | Description |
|-------------|-------|-------------|
| Avg Temperature | 21.5°C | Average across all buildings |
| Active Buildings | 18/20 | 90% operational, 2 in maintenance |
| Energy Usage | 1,234 kWh | -15% vs last month (AI optimized) |
| Active Alerts | 3 | 2 maintenance, 1 high temperature |

### AI Models

**Active (9 models):**
- Temperature Optimization
- Energy Efficiency
- Predictive Maintenance
- Occupancy Detection
- Weather Prediction
- Air Quality Monitor
- Smart Scheduling
- Anomaly Detection
- Trend Analysis

**Inactive (5 models):**
- Load Balancing
- Demand Response
- Comfort Optimization
- Multi-Zone Control
- Reinforcement Learning

### AI Configuration Settings

1. **Target Temperature**: Default temperature for all buildings (°C)
2. **AI Learning Start Date**: When AI started learning from building data
3. **Optimization Strategy**: Energy | Comfort | Balanced | Cost | Peak Shaving

## File Structure

```
src/
├── features/
│   ├── dashboard/         # HVAC metrics dashboard
│   ├── users/            # → Buildings management
│   ├── tasks/            # → Alerts & maintenance
│   ├── apps/             # → AI models configuration
│   └── settings/
│       └── account/      # → AI configuration
├── components/
│   └── layout/
│       └── data/
│           └── sidebar-data.ts  # Navigation structure
└── ...
```

## Key Files Modified

### Core Changes
- `package.json` - Project renamed to hvac-ai-backoffice
- `README.md` - Complete documentation rewrite
- `index.html` - Title and meta tags updated

### Features
- `src/features/dashboard/` - HVAC metrics
- `src/features/users/` - Buildings (50 buildings with HVAC data)
- `src/features/tasks/` - Alerts (100 HVAC alerts)
- `src/features/apps/` - AI Models (14 AI models)
- `src/features/settings/account/` - AI Configuration

### Navigation
- `src/components/layout/data/sidebar-data.ts` - Menu structure

## Demo Data

- **50 Buildings** - Varied types, statuses, and HVAC readings
- **100 Alerts** - Different priorities and types
- **14 AI Models** - 9 active, 5 inactive
- **Sample Buildings**: Corporate Tower, Executive Plaza, Tech Hub, etc.
- **Alert Types**: Temperature, maintenance, energy, system errors

## Color Coding

- **Green**: Active/Operational/Good
- **Blue**: Temperature-related
- **Amber**: Warning/Attention needed
- **Red**: Critical/Error
- **Purple**: System/Configuration
- **Cyan**: New/Info

## Quick Start Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview
pnpm preview

# Lint
pnpm lint

# Format
pnpm format
```

## Next Steps

1. Connect to real HVAC API
2. Add real-time WebSocket updates
3. Create detailed building views
4. Implement alert resolution workflow
5. Add visual schedule builder
6. Integrate weather API
7. Add energy cost tracking
8. Build analytics charts

## Support

For questions about the original template:
- Original: https://github.com/satnaing/shadcn-admin
- shadcn/ui: https://ui.shadcn.com


