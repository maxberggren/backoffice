# HVAC AI Backoffice

A comprehensive backoffice system for managing AI-controlled HVAC systems across multiple buildings. Built with responsiveness and accessibility in mind.

![HVAC AI Backoffice](public/images/shadcn-admin.png)

This system enables operators to monitor and configure AI-driven HVAC systems, manage multiple buildings, track energy consumption, set temperature schedules, and receive real-time alerts for system issues.

## Features

- **Building Management**: Monitor and control multiple buildings from a single dashboard
- **AI Configuration**: Configure AI models and parameters for optimal HVAC performance
- **Real-time Monitoring**: Track temperature, humidity, energy consumption, and system status
- **Alert System**: Receive and manage maintenance alerts and system notifications
- **Energy Analytics**: Visualize energy consumption patterns and optimization opportunities
- **Schedule Management**: Create and manage temperature schedules and automation rules
- **User Management**: Manage operators and their building access permissions
- Light/dark mode support
- Fully responsive design
- Accessible UI components
- Global search command

<details>
<summary>Customized Components (click to expand)</summary>

This project uses Shadcn UI components, but some have been slightly modified for better RTL (Right-to-Left) support and other improvements. These customized components differ from the original Shadcn UI versions.

If you want to update components using the Shadcn CLI (e.g., `npx shadcn@latest add <component>`), it's generally safe for non-customized components. For the listed customized ones, you may need to manually merge changes to preserve the project's modifications and avoid overwriting RTL support or other updates.

> If you don't require RTL support, you can safely update the 'RTL Updated Components' via the Shadcn CLI, as these changes are primarily for RTL compatibility. The 'Modified Components' may have other customizations to consider.

### Modified Components

- scroll-area
- sonner
- separator

### RTL Updated Components

- alert-dialog
- calendar
- command
- dialog
- dropdown-menu
- select
- table
- sheet
- sidebar
- switch

**Notes:**

- **Modified Components**: These have general updates, potentially including RTL adjustments.
- **RTL Updated Components**: These have specific changes for RTL language support (e.g., layout, positioning).
- For implementation details, check the source files in `src/components/ui/`.
- All other Shadcn UI components in the project are standard and can be safely updated via the CLI.

</details>

## Tech Stack

**UI:** [ShadcnUI](https://ui.shadcn.com) (TailwindCSS + RadixUI)

**Build Tool:** [Vite](https://vitejs.dev/)

**Routing:** [TanStack Router](https://tanstack.com/router/latest)

**Type Checking:** [TypeScript](https://www.typescriptlang.org/)

**Linting/Formatting:** [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)

**Icons:** [Lucide Icons](https://lucide.dev/icons/), [Tabler Icons](https://tabler.io/icons) (Brand icons only)

**Auth (partial):** [Clerk](https://go.clerk.com/GttUAaK)

## Run Locally

Clone the project

```bash
  git clone https://github.com/yourusername/hvac-ai-backoffice.git
```

Go to the project directory

```bash
  cd hvac-ai-backoffice
```

Install dependencies

```bash
  pnpm install
```

Start the server

```bash
  pnpm run dev
```

## Use Cases

- **Multi-Building Management**: Perfect for facility managers overseeing HVAC systems across multiple properties
- **Energy Optimization**: Monitor and optimize energy consumption using AI-driven insights
- **Predictive Maintenance**: Track system performance and receive alerts before issues occur
- **Compliance Tracking**: Maintain records of temperature settings and system operations
- **Remote Operations**: Configure and monitor HVAC systems from anywhere

## Architecture

This boilerplate is built on the foundation of [shadcn-admin](https://github.com/satnaing/shadcn-admin) by [@satnaing](https://github.com/satnaing) and adapted for HVAC AI management.

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
