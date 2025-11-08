# Coolify/Nixpacks Deployment Guide

## Required Environment Variables

Set these in your Coolify application settings:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (or your Clerk publishable key)
```

**Note:** If you don't have Clerk set up, you can use a dummy key temporarily, but the app will show a warning message. Clerk is optional for basic functionality.

## Build Process

Nixpacks will automatically:
1. Install dependencies with `pnpm install`
2. Build the application with `pnpm run build`
3. Start the server with `pnpm start`

## Server Configuration

The `server.js` file serves the built static files from the `dist` directory and handles SPA routing by serving `index.html` for all routes.

## Troubleshooting

### Dark Screen Issues

1. **Check Browser Console**: Open browser dev tools (F12) and check for JavaScript errors
2. **Check Environment Variables**: Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in Coolify
3. **Check Build Output**: Verify that the `dist` folder contains built files
4. **Check Server Logs**: Look at Coolify logs to see if the server is running correctly

### Common Issues

- **Missing Clerk Key**: The app will show a warning page instead of a dark screen
- **SPA Routing**: The server.js handles this automatically
- **Port Configuration**: The server uses `PORT` environment variable (defaults to 3000)

## Testing Locally

To test the production build locally:

```bash
pnpm run build
pnpm start
```

Then visit `http://localhost:3000`

