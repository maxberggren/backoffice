import {
  LayoutDashboard,
  HelpCircle,
  Bell,
  Thermometer,
  Palette,
  Settings,
  Wrench,
  Users,
  GalleryVerticalEnd,
  Building2,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  Sparkles,
  Table2,
  Layers,
  Gauge,
  FileText,
  Brain,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Max Berggren',
    email: 'max@myrspoven.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'HVAC AI Control',
      logo: Thermometer,
      plan: 'AI-Powered',
    },
    {
      name: 'Property Portfolio A',
      logo: Building2,
      plan: '12 Properties',
    },
    {
      name: 'Property Portfolio B',
      logo: GalleryVerticalEnd,
      plan: '8 Properties',
    },
  ],
  navGroups: [
    {
      title: 'Portfolio',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Process Viewer',
          url: '/process-viewer',
          icon: Table2,
        },
        {
          title: 'Alerts',
          url: '/tasks',
          badge: '3',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'Property',
      items: [
        {
          title: 'Signals',
          icon: Activity,
          items: [
            {
              title: 'Edit',
              url: '/signals/viewer',
              icon: Activity,
            },
            {
              title: 'Export',
              url: '/signals/export',
              icon: Download,
            },
            {
              title: 'Import',
              url: '/signals/import',
              icon: Upload,
            },
          ],
        },
        {
          title: 'Maintenance',
          url: '/maintenance',
          icon: Wrench,
        },
        {
          title: 'Configuration',
          icon: Building2,
          items: [
            {
              title: 'General',
              url: '/buildings/:propertyId/config',
              icon: Settings,
              dynamicUrl: true,
            },
            {
              title: 'AI Settings',
              url: '/buildings/:propertyId/config/ai-settings',
              icon: Sparkles,
              dynamicUrl: true,
            },
            {
              title: 'Features',
              url: '/buildings/:propertyId/config/features',
              icon: Layers,
              dynamicUrl: true,
            },
            {
              title: 'Processes',
              url: '/buildings/:propertyId/config/processes',
              icon: Table2,
              dynamicUrl: true,
            },
            {
              title: 'Blueprints',
              url: '/buildings/:propertyId/config/blueprints',
              icon: FileText,
              dynamicUrl: true,
            },
          ],
        },
        {
          title: 'AHU Schedule',
          url: '/ahu-schedule',
          icon: Calendar,
        },
      ],
    },
    {
      title: 'Insights',
      items: [
        {
          title: 'ON vs OFF',
          url: '/analysis/ai-on-vs-off',
          icon: TrendingUp,
        },
        {
          title: 'Group Comfort',
          url: '/analysis/comfort-groups',
          icon: Layers,
        },
        {
          title: 'AI vs Baseline',
          url: '/analysis/ai-vs-baseline',
          icon: TrendingUp,
        },
        {
          title: 'Read-Write Discrepancies',
          url: '/signals/discrepancies',
          icon: Gauge,
        },
      ],
    },
    {
      title: 'AI',
      items: [
        {
          title: 'Training Metrics',
          url: '/analysis/ai-training-metrics',
          icon: Brain,
        },
        {
          title: 'Output',
          url: '/signals/ai-output',
          icon: Sparkles,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Operators',
          url: '/clerk/user-management',
          icon: Users,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
          ],
        },
        {
          title: 'Documentation',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}

