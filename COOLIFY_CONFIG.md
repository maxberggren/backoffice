# Coolify Build Pack Configuration

## Recommended: Node.js Application with Nixpacks

**Build Pack**: `nixpacks` (auto-detected)

**Settings**:
- **Is it a static site?**: ❌ **NO** (unchecked)
- **Build Command**: `pnpm run build`
- **Start Command**: `pnpm start` (runs `node server.js`)
- **Port**: Auto-detected (usually 3000)

This runs your Node.js server (`server.js`) which properly:
- Serves files with correct MIME types (`application/javascript` for JS modules)
- Handles SPA routing (serves `index.html` for all routes)
- Provides health check endpoint at `/health`

## Alternative: Static Site Mode

If you prefer static site mode:

**Build Pack**: `nixpacks`

**Settings**:
- **Is it a static site?**: ✅ **YES** (checked)
- **Build Command**: `pnpm run build`
- **Output/Publish Directory**: `dist`

**Note**: You'll need a `Caddyfile` (provided) to handle SPA routing and MIME types.

## Current Issue

Your logs show Caddy is serving the **source** `index.html` instead of the built one. This means:

1. Either the Node.js server isn't running (check for startup logs)
2. Or Coolify is configured as a static site but serving from the wrong directory

## Verify Configuration

After setting up, check Coolify logs for:

**Node.js Mode** (should see):
```
✅ Found dist directory
✅ Found index.html
🚀 Server running on port X
```

**Static Site Mode** (should see):
- Caddy serving files from `/app/dist`
- No Node.js server logs

## Quick Fix

1. Go to your Coolify application settings
2. Check "Build Pack" - should be `nixpacks`
3. **Uncheck** "Is it a static site?" (to use Node.js server)
4. Set Start Command: `pnpm start`
5. Redeploy

The Node.js server will serve the correct built files with proper MIME types.

