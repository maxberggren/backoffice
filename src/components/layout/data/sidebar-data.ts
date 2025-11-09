import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Thermometer,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  ShieldCheck,
  GalleryVerticalEnd,
  Building2,
  AlertTriangle,
  Cpu,
  Activity,
  TrendingUp,
  Calendar,
  Download,
  Sparkles,
  Table2,
  Layers,
  Gauge,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
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
      name: 'Building Portfolio A',
      logo: Building2,
      plan: '12 Buildings',
    },
    {
      name: 'Building Portfolio B',
      logo: GalleryVerticalEnd,
      plan: '8 Buildings',
    },
  ],
  navGroups: [
    {
      title: 'Monitoring',
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
      title: 'Signals',
      items: [
        {
          title: 'Signal Viewer',
          url: '/signals/viewer',
          icon: Activity,
        },
        {
          title: 'Export to Excel',
          url: '/signals/export',
          icon: Download,
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
          title: 'AI Output',
          url: '/signals/ai-output',
          icon: Sparkles,
        },
        {
          title: 'AI ON vs OFF',
          url: '/analysis/ai-on-vs-off',
          icon: TrendingUp,
        },
        {
          title: 'Comfort Groups',
          url: '/analysis/comfort-groups',
          icon: Layers,
        },
        {
          title: 'Maintenance',
          url: '/maintenance',
          icon: Wrench,
        },
        {
          title: 'AI Models',
          url: '/apps',
          icon: Cpu,
        },
        {
          title: 'Configuration',
          url: '/buildings/:buildingId/config',
          icon: Building2,
          dynamicUrl: true,
        },
        {
          title: 'AHU Schedule',
          url: '/ahu-schedule',
          icon: Calendar,
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
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          items: [
            {
              title: 'Sign In',
              url: '/clerk/sign-in',
            },
            {
              title: 'Sign Up',
              url: '/clerk/sign-up',
            },
            {
              title: 'User Management',
              url: '/clerk/user-management',
            },
          ],
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
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'AI Configuration',
              url: '/settings/account',
              icon: Cpu,
            },
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
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Documentation',
          url: '/help-center',
          icon: HelpCircle,
        },
        {
          title: 'Error Pages',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
        {
          title: 'Auth Pages',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
      ],
    },
  ],
}

