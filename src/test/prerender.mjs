import { readFile, writeFile } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

// Build-time only: reuse App as the single source of CV content.
// Disable dependency discovery and filesystem watching; keep cache out of deployable dist/.
const server = await createServer({
  configFile: false,
  plugins: [react()],
  cacheDir: 'node_modules/.vite-prerender',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
})

try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx')
  const { createElement } = await import('react')
  const html = await readFile('dist/index.html', 'utf8')
  const root = '<div id="root"></div>'
  if (!html.includes(root)) throw new Error('Expected an empty root in the Vite build')
  await writeFile('dist/index.html', html.replace(root, `<div id="root">${renderToString(createElement(App))}</div>`))
  console.log('Prerendered portfolio HTML for JavaScript-free reading.')
} finally {
  await server.close()
}
