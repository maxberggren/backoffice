import { createServer } from 'http'
import { existsSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { createReadStream } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3000
const distDir = join(__dirname, 'dist')

// Verify dist directory exists
if (!existsSync(distDir)) {
  console.error(`❌ Error: dist directory not found at ${distDir}`)
  console.error('   Make sure you run "pnpm run build" before starting the server')
  process.exit(1)
}

console.log(`✅ Found dist directory at ${distDir}`)

// Verify index.html exists
const indexPath = join(distDir, 'index.html')
if (!existsSync(indexPath)) {
  console.error(`❌ Error: index.html not found at ${indexPath}`)
  process.exit(1)
}

console.log(`✅ Found index.html`)

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp',
}

function getMimeType(path) {
  const ext = extname(path).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function serveFile(res, filePath) {
  if (!existsSync(filePath)) {
    return false
  }

  try {
    const mimeType = getMimeType(filePath)
    
    // Ensure JavaScript files get the correct MIME type
    if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    } else {
      res.setHeader('Content-Type', mimeType)
    }
    
    // Add cache headers for assets
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
    
    const stream = createReadStream(filePath)
    stream.on('error', (err) => {
      console.error('Stream error:', err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    })
    stream.pipe(res)
    return true
  } catch (error) {
    console.error('Error serving file:', error)
    return false
  }
}

const server = createServer((req, res) => {
  // Handle CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  let path = req.url.split('?')[0] // Remove query string
  
  // Health check endpoint
  if (path === '/health' || path === '/healthz') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: 'ok', distDir, port: PORT }))
    return
  }
  
  // Log requests in development/debug mode
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
    console.log(`${req.method} ${path}`)
  }
  
  // Default to index.html
  if (path === '/' || path === '') {
    path = '/index.html'
  }
  
  // Try to serve the requested file
  const filePath = join(distDir, path)
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(distDir)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }
  
  if (serveFile(res, filePath)) {
    return
  }
  
  // If file doesn't exist and it's not an asset, serve index.html (SPA routing)
  // This handles client-side routing for React Router
  const ext = extname(path)
  if (!ext || ext === '.html') {
    const indexPath = join(distDir, 'index.html')
    if (serveFile(res, indexPath)) {
      return
    }
  }
  
  // Log 404s for debugging
  if (process.env.DEBUG) {
    console.log(`⚠️  404: ${path} (file not found: ${filePath})`)
  }
  
  // 404
  res.statusCode = 404
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>The requested resource was not found.</p></body></html>')
})

server.on('error', (error) => {
  console.error('Server error:', error)
  process.exit(1)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📁 Serving files from ${distDir}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
  console.log(`🌐 App: http://localhost:${PORT}`)
  
  // List some files in dist for debugging
  if (process.env.DEBUG) {
    try {
      const files = readdirSync(distDir)
      console.log(`📦 Files in dist: ${files.slice(0, 10).join(', ')}...`)
    } catch (e) {
      // Ignore
    }
  }
})


