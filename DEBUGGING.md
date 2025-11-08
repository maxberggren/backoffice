# Debugging Black Screen Issue

## Quick Checks

1. **Check Coolify Logs** - Look for:
   - Server startup messages
   - Any errors about missing files
   - Port binding issues

2. **Check Browser Console** (F12):
   - Open DevTools → Console tab
   - Look for JavaScript errors
   - Check Network tab to see if assets are loading (404s?)

3. **Verify Environment Variables**:
   - `VITE_CLERK_PUBLISHABLE_KEY` should be set (even if dummy)
   - `PORT` should be set by Coolify automatically

4. **Check if HTML is loading**:
   - Right-click → View Page Source
   - Should see HTML with script tags
   - If you see HTML but black screen = JavaScript error

## Common Causes

### 1. JavaScript Error Preventing Render
- Check browser console for errors
- Common: Missing environment variables causing runtime errors
- Common: Module loading errors

### 2. Assets Not Loading
- Check Network tab in DevTools
- Look for 404s on JS/CSS files
- Server might not be serving assets correctly

### 3. Server Not Running
- Check Coolify logs
- Should see "🚀 Server running on port X"
- Should see "✅ Found dist directory"

### 4. Build Issues
- Check if `dist` folder exists in container
- Check if `index.html` exists in dist
- Verify build completed successfully

## Enable Debug Mode

Add to Coolify environment variables:
```
DEBUG=1
NODE_ENV=production
```

This will enable request logging in server.js

## Test Locally First

```bash
# Build
pnpm run build

# Start server
PORT=3000 node server.js

# Visit http://localhost:3000
# Check browser console for errors
```

## If Still Black Screen

1. Check browser console - share any errors
2. Check Coolify logs - share startup messages
3. Check Network tab - are assets loading?
4. Try accessing `/index.html` directly in browser

