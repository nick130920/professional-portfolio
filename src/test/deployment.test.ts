/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(path, 'utf8')

describe('Production container contract', () => {
  it('builds locked dependencies with Node 22 and ships only dist to unprivileged nginx', () => {
    const dockerfile = read('Dockerfile')
    expect(dockerfile).toMatch(/^FROM node:22-alpine AS build$/m)
    expect(dockerfile).toContain('COPY package.json package-lock.json ./')
    expect(dockerfile).toContain('RUN npm ci')
    expect(dockerfile).toContain('RUN npm run build')
    const runtime = dockerfile.split(/^FROM nginxinc\/nginx-unprivileged:/m)[1]
    expect(runtime).toMatch(/^1\.28\.2-alpine\n/)
    expect(runtime).toContain('COPY --from=build /app/dist/ /srv/portfolio/')
    expect(runtime).toContain('COPY nginx.conf /etc/nginx/nginx.conf')
    expect(runtime).toContain('USER 101:101')
    expect(runtime).toContain('EXPOSE 8080')
    expect(runtime).toMatch(/HEALTHCHECK .*\n\s*CMD wget .*http:\/\/127\.0\.0\.1:8080\/health.*exit 1/)
    expect(runtime).not.toMatch(/npm|COPY \.|\/app\/src/)
  })

  it('serves real assets with correct MIME and keeps missing files out of SPA fallback', () => {
    const nginx = read('nginx.conf')
    expect(nginx).toContain('listen 8080;')
    expect(nginx).toContain('root /srv/portfolio;')
    expect(nginx).toContain('include /etc/nginx/mime.types;')
    expect(nginx).toContain('pid /tmp/nginx.pid;')
    expect(nginx).toMatch(/location = \/health\s*\{[^}]*return 200 "ok\\n";/)
    expect(nginx).toMatch(/location \^~ \/assets\/\s*\{\s*try_files \$uri =404;/)
    expect(nginx).toMatch(/location ~\* \\.\[\^\/\]\+\$\s*\{\s*try_files \$uri =404;/)
    expect(nginx).toMatch(/location \/\s*\{\s*try_files \$uri \$uri\/ \/index.html;/)
  })

  it('revalidates HTML, caches only hashed assets immutably, and applies headers uniformly', () => {
    const nginx = read('nginx.conf')
    for (const header of [
      'Cache-Control $cache_control',
      'X-Content-Type-Options "nosniff"',
      'X-Frame-Options "DENY"',
      'Referrer-Policy "strict-origin-when-cross-origin"',
    ]) {
      expect(nginx).toContain(`add_header ${header} always;`)
    }
    // Location-level add_header would silently drop inherited security headers.
    expect(nginx.match(/add_header /g)).toHaveLength(4)
    expect(nginx).toContain('server_tokens off;')
  })

  it('gates immutable caching on successful hashed-asset responses, never hash-shaped errors', () => {
    const nginx = read('nginx.conf')
    expect(nginx).toMatch(/map "\$status:\$uri" \$cache_control\s*\{\s*default "no-cache";/)
    expect(nginx).toContain('"~^[0-9]{3}:/health$" "no-store";')
    const rules = [...nginx.matchAll(/"~([^"]+)" "public, max-age=31536000, immutable";/g)]
    expect(rules).toHaveLength(1)
    const immutable = new RegExp(rules[0][1])
    // Config-contract check only: real nginx status/header behavior is verified with curl.
    for (const status of [200, 206, 304]) {
      for (const asset of ['/assets/index-DKuqgkQW.js', '/assets/index-Dju8_WHM.css']) {
        expect(immutable.test(`${status}:${asset}`)).toBe(true)
      }
    }
    for (const status of [301, 400, 403, 404, 500, 503]) {
      expect(immutable.test(`${status}:/assets/independent-missing-AbCd1234.js`)).toBe(false)
    }
    for (const path of ['/', '/index.html', '/favicon.svg', '/health', '/assets/unhashed.js']) {
      expect(immutable.test(`200:${path}`)).toBe(false)
    }
  })

  it('excludes local outputs, repository metadata, and secrets from the build context', () => {
    const ignored = read('.dockerignore').split('\n')
    for (const path of ['node_modules', 'dist', '.git', '.env', '.env.*', '*.pem', '*.key', 'test-results', 'playwright-report']) {
      expect(ignored).toContain(path)
    }
  })
})
