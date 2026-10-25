/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const html = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html')
const title = 'Nicolás Muñoz | Ingeniero de Software Full-Stack y Arquitecto Desarrollador'
const description = 'Portafolio de Nicolás Andrés Muñoz Coronado: experiencia en desarrollo full-stack, Golang, Java y arquitectura de software. Trayectoria, habilidades y contacto.'

describe('Build output hygiene', () => {
  it('keeps Vite output cleaning enabled without running recursive builds', () => {
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(scripts.build).toContain('vite build && node src/test/prerender.mjs')
    expect(scripts.build).not.toMatch(/--(?:emptyOutDir|empty-out-dir)\s*(?:=\s*)?false|--no-emptyOutDir/)
    expect(readFileSync('vite.config.ts', 'utf8')).not.toMatch(/emptyOutDir\s*:\s*false/)
  })

  it('keeps the prerender cache in an ignored non-deployment directory', () => {
    const helper = readFileSync('src/test/prerender.mjs', 'utf8')
    const cacheDir = helper.match(/cacheDir:\s*['"]([^'"]+)['"]/)?.[1]
    expect(cacheDir).toBe('node_modules/.vite-prerender')
    expect(cacheDir).not.toMatch(/^(?:\.\/)?dist(?:\/|$)/)
    expect(readFileSync('.gitignore', 'utf8').split('\n')).toContain('node_modules/')
  })
})

describe('Production metadata', () => {
  it('publishes truthful Spanish SEO and image-free social cards for the canonical domain', () => {
    expect(html.documentElement.lang).toBe('es')
    expect(html.title).toBe(title)
    expect(html.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://nicolasm.pro/')
    const metadata = {
      description,
      'theme-color': '#15243b',
      'og:type': 'website',
      'og:locale': 'es_CO',
      'og:site_name': 'Nicolás Muñoz',
      'og:url': 'https://nicolasm.pro/',
      'og:title': title,
      'og:description': description,
      'twitter:card': 'summary',
      'twitter:title': title,
      'twitter:description': description,
    }
    for (const [key, content] of Object.entries(metadata)) {
      const selector = key.startsWith('og:') ? `meta[property="${key}"]` : `meta[name="${key}"]`
      expect(html.querySelector(selector)?.getAttribute('content'), key).toBe(content)
    }
    expect(html.querySelector('meta[property="og:image"], meta[name="twitter:image"], meta[name="twitter:site"]')).toBeNull()
  })

  it('links an authored, scalable nm. favicon without external dependencies', () => {
    const icon = html.querySelector('link[rel="icon"]')
    expect(icon?.getAttribute('href')).toBe('/favicon.svg')
    expect(icon?.getAttribute('type')).toBe('image/svg+xml')
    expect(icon?.getAttribute('sizes')).toBe('any')
    const source = readFileSync('public/favicon.svg', 'utf8')
    const svg = new DOMParser().parseFromString(source, 'image/svg+xml')
    expect(svg.querySelector('parsererror')).toBeNull()
    expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 64 64')
    expect(svg.querySelector('title')?.textContent).toBe('nm.')
    expect(svg.querySelectorAll('path').length).toBeGreaterThanOrEqual(2)
    expect(svg.querySelector('circle')?.getAttribute('fill')).toBe('#2457cf')
    expect(svg.querySelector('script, image, use, foreignObject')).toBeNull()
  })
})
