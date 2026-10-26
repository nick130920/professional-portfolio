import { readFile } from 'node:fs/promises'
import { expect, test, type Locator } from '@playwright/test'

const contactHrefs = [
  'mailto:namc1309@gmail.com',
  'tel:+573103850396',
  'https://www.linkedin.com/in/nicolas-munoz-coronado/',
  'https://github.com/nick130920',
  'https://nicolasm.pro',
]

async function expectVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused()
  const outline = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      focusVisible: element.matches(':focus-visible'),
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
      color: style.outlineColor,
      offset: parseFloat(style.outlineOffset),
    }
  })
  expect(outline.focusVisible).toBe(true)
  expect(outline.style).toBe('solid')
  expect(outline.width).toBeGreaterThanOrEqual(2)
  expect(outline.offset).toBeGreaterThanOrEqual(0)
  expect(outline.color).not.toBe('rgba(0, 0, 0, 0)')
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('production HTML stays readable and navigable with JavaScript disabled', async ({ browser, baseURL, page: testPage }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testPage.viewportSize()! })
  // Serve only the built document and its CSS: this tests the deployable HTML,
  // not Vite's client-rendered development shell, without another HTTP server.
  await context.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/') {
      await route.fulfill({ contentType: 'text/html', body: await readFile('dist/index.html') })
    } else if (/^\/assets\/[\w.-]+\.css$/.test(path)) {
      await route.fulfill({ contentType: 'text/css', body: await readFile(`dist${path}`) })
    } else {
      await route.abort()
    }
  })
  try {
    const page = await context.newPage()
    await page.goto(baseURL!)
    await expect(page).toHaveTitle('Nicolás Muñoz | Ingeniero de Software Full-Stack y Arquitecto Desarrollador')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nicolasm.pro/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('[data-reveal]')).toHaveCount(6)
    for (const section of await page.locator('main > section').all()) {
      await expect(section).toBeVisible()
      await expect(section).toHaveCSS('opacity', '1')
      await expect(section).toHaveCSS('animation-name', 'none')
    }
    await page.getByRole('navigation').getByRole('link', { name: 'Contacto', exact: true }).click()
    await expect(page.locator('#contact-title')).toBeInViewport()
    await expect(page.locator('#contacto a')).toHaveCount(5)
  } finally {
    await context.close()
  }
})

test('production HTML hydrates without errors and enhances native navigation', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/' || /^\/assets\/[\w.-]+\.(css|js)$/.test(path)) {
      const contentType = path.endsWith('.js') ? 'text/javascript' : path.endsWith('.css') ? 'text/css' : 'text/html'
      await route.fulfill({ contentType, body: await readFile(path === '/' ? 'dist/index.html' : `dist${path}`) })
    } else {
      await route.continue()
    }
  })
  await page.goto('/')
  const contactLink = page.getByRole('navigation').getByRole('link', { name: 'Contacto', exact: true })
  await contactLink.click()
  await expect(contactLink).toHaveAttribute('aria-current', 'location')
  await expect(page.locator('#contact-title')).toBeInViewport()
  expect(errors).toEqual([])
})

test('editorial identity keeps the current role factual and the hero composition responsive', async ({ page }) => {
  const hero = page.getByRole('region', { name: 'Nicolás Andrés Muñoz Coronado', exact: true })
  const currentRole = hero.getByRole('complementary', { name: 'Actividad actual' })
  await expect(hero.getByText('Portafolio profesional', { exact: true })).toBeVisible()
  await expect(hero.getByText('04 experiencias', { exact: true })).toBeVisible()
  await expect(currentRole.getByText('Arquitecto Desarrollador Golang', { exact: true })).toBeVisible()
  await expect(currentRole.getByText('Ceiba Software - Mercado Libre', { exact: true })).toBeVisible()
  await expect(currentRole.locator('time')).toHaveAttribute('datetime', '2025-06')
  await expect(currentRole).toContainText('Jun 2025 – presente')

  for (const width of [1440, 850, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    const copy = (await hero.locator('.hero-copy').boundingBox())!
    const note = (await currentRole.boundingBox())!
    if (width > 850) {
      expect(note.x).toBeGreaterThan(copy.x + copy.width)
    } else {
      expect(note.y).toBeGreaterThanOrEqual(copy.y + copy.height)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await expect(currentRole).toBeVisible()
  }
})

test('normal motion uses a subtle one-shot reveal without hiding or translating text', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.reload()
  const sections = page.locator('[data-reveal]')
  await expect(sections).toHaveCount(6)
  const contact = page.locator('#contacto')
  await contact.scrollIntoViewIfNeeded()
  await expect(contact).toHaveAttribute('data-revealed', 'true')
  const motion = await contact.evaluate((element) => {
    const style = getComputedStyle(element)
    return { opacity: style.opacity, transform: style.transform, animation: style.animationName, duration: style.animationDuration }
  })
  expect(motion).toEqual({ opacity: '1', transform: 'none', animation: 'section-arrival', duration: '0.45s' })
  await expect(contact.getByRole('link').first()).toBeVisible()
  await page.getByRole('navigation').getByRole('link', { name: 'Experiencia', exact: true }).click()
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Experiencia', exact: true }))
    .toHaveAttribute('aria-current', 'location')
  await expect(page.locator('#experiencia')).toHaveCSS('opacity', '1')
})

test('reduced motion keeps every section visible with no reveal animation or transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  const sections = page.locator('[data-reveal]')
  await expect(sections).toHaveCount(6)
  for (const section of await sections.all()) {
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    await expect(section).toHaveCSS('opacity', '1')
    await expect(section).toHaveCSS('transform', 'none')
    await expect(section).toHaveCSS('animation-name', 'none')
    await expect(section).toHaveCSS('transition-duration', '0s')
  }
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto')
  // Changing the preference live must also stop already-enabled effects.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('#perfil').scrollIntoViewIfNeeded()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('[data-revealed]')).toHaveCount(0)
  await expect(page.locator('#perfil')).toHaveCSS('animation-name', 'none')
})

test('print media is a readable CV with contact details but no navigation or decorative actions', async ({ page }) => {
  await page.emulateMedia({ media: 'print' })
  for (const selector of ['.site-header', '.skip-link', '.hero-masthead', '.hero-actions', '.hero-note', '.site-footer']) {
    await expect(page.locator(selector)).toHaveCSS('display', 'none')
  }
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('main')).toHaveCSS('width', `${page.viewportSize()!.width}px`)
  await expect(page.locator('.hero')).toHaveCSS('display', 'block')
  for (const section of await page.locator('main > section').all()) {
    await expect(section).toBeVisible()
    await expect(section).toHaveCSS('display', 'block')
    await expect(section).toHaveCSS('animation-name', 'none')
    await expect(section).toHaveCSS('transition-duration', '0s')
    await expect(section).toHaveCSS('opacity', '1')
  }
  for (const item of await page.locator('.timeline-entry, .credential, .skill-group, .contact-row').all()) {
    await expect(item).toHaveCSS('break-inside', 'avoid')
  }
  await expect(page.locator('h2').first()).toHaveCSS('break-after', 'avoid')
  await expect(page.locator('.contact-row a')).toHaveCount(5)
  await expect(page.locator('.contact-row a').first()).toBeVisible()
  await expect(page.locator('.achievements').first()).toHaveCSS('font-size', '13.3333px')
})

test('all portfolio sections remain readable without horizontal overflow', async ({ page }) => {
  const hero = page.getByRole('region', { name: 'Nicolás Andrés Muñoz Coronado', exact: true })
  const profile = page.getByRole('region', { name: 'Perfil profesional' })
  const contact = page.getByRole('region', { name: 'Contacto', exact: true })

  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Nicolás AndrésMuñoz Coronado.')
  await expect(hero.getByText('Ingeniero de Software Full-Stack y Arquitecto Desarrollador', { exact: true })).toBeVisible()
  await expect(hero.getByText(/Experiencia de más de 5 años/)).toBeVisible()
  await expect(profile.getByText('Desarrollo full-stack con perspectiva de arquitectura.')).toBeVisible()
  await expect(profile.getByText(/Mi experiencia abarca/)).toBeVisible()
  await expect(profile.getByText(/Trabajo en la optimización/)).toBeVisible()
  await expect(contact.getByText('Hablemos de software y arquitectura.')).toBeVisible()

  // Inspect actual rendered text, not just element presence: it must fit its
  // container, remain within the viewport width, and have readable contrast.
  const experience = page.getByRole('region', { name: 'Experiencia profesional' })
  const skills = page.getByRole('region', { name: 'Habilidades técnicas' })
  const education = page.getByRole('region', { name: 'Educación', exact: true })
  const certifications = page.getByRole('region', { name: 'Certificaciones y cursos' })
  await expect(experience.getByRole('article')).toHaveCount(4)
  await expect(skills.getByRole('list')).toHaveCount(5)
  await expect(education.getByRole('article')).toHaveCount(2)
  await expect(certifications.getByRole('article')).toHaveCount(2)

  for (const section of [hero, profile, experience, skills, education, certifications, contact]) {
    await section.getByRole('heading').first().scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading').first()).toBeInViewport()
    const textElements = section.locator('h1:visible, h2:visible, h3:visible, p:visible, li:not(:has(article)):visible, dt:visible, dd a:visible')
    const readability = await textElements.evaluateAll((elements) => {
      function luminance(color: string) {
        const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
      }
      return elements.map((element) => {
        const style = getComputedStyle(element)
        const range = document.createRange()
        range.selectNodeContents(element)
        const textRects = [...range.getClientRects()].filter((rect) => rect.width > 0)
        const box = element.getBoundingClientRect()
        let background: Element | null = element
        while (background?.parentElement && getComputedStyle(background).backgroundColor === 'rgba(0, 0, 0, 0)') {
          background = background.parentElement
        }
        const foregroundLuminance = luminance(style.color)
        const backgroundLuminance = luminance(getComputedStyle(background!).backgroundColor)
        return {
          text: element.textContent,
          fontSize: parseFloat(style.fontSize),
          isBodyCopy: element.matches('p:not(.eyebrow), li, dd a'),
          lineHeight: style.lineHeight === 'normal' ? box.height : parseFloat(style.lineHeight),
          contrast: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
            / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
          fits: textRects.length > 0 && textRects.every((rect) =>
            rect.width > 0 && rect.height > 0 && rect.left >= Math.max(0, box.left) - 1
            && rect.right <= Math.min(innerWidth, box.right) + 1),
          clipped: ['hidden', 'clip'].includes(style.overflowY) && element.scrollHeight > element.clientHeight,
        }
      })
    })
    for (const text of readability) {
      expect(text.fits, `${text.text}: text fits horizontally`).toBe(true)
      expect(text.clipped, `${text.text}: no vertical clipping`).toBe(false)
      // Body copy must remain readable; compact uppercase section labels are
      // metadata, not body text, and are checked for clipping and contrast.
      expect(text.fontSize, `${text.text}: font size`).toBeGreaterThanOrEqual(text.isBodyCopy ? 14 : 11)
      expect(text.lineHeight, `${text.text}: line height`).toBeGreaterThanOrEqual(text.fontSize)
      expect(text.contrast, `${text.text}: WCAG AA contrast`).toBeGreaterThanOrEqual(4.5)
    }
    for (const text of await textElements.all()) {
      await text.scrollIntoViewIfNeeded()
      await expect(text).toBeInViewport()
    }
    expect(await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      viewport: innerWidth,
    }))).toEqual({ document: page.viewportSize()!.width, body: page.viewportSize()!.width, viewport: page.viewportSize()!.width })
  }

  const contacts = contact.getByRole('link')
  await expect(contacts).toHaveCount(5)
  expect(await contacts.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(contactHrefs)
  for (const link of await contacts.all()) {
    await link.scrollIntoViewIfNeeded()
    await expect(link).toBeInViewport()
    await expect(link).toHaveAccessibleName(/\S/)
  }
})

test('every internal navigation link reaches its existing named destination', async ({ page }) => {
  const links = page.locator('a[href^="#"]')
  // Include the wordmark, primary navigation, profile CTA, and footer; the
  // skip link has a separate first-Tab/focus contract below.
  const destinations = [
    '#main-content', '#inicio', '#inicio', '#perfil', '#experiencia', '#habilidades',
    '#formacion', '#certificaciones', '#contacto', '#perfil', '#inicio',
  ]
  await expect(links).toHaveCount(destinations.length)
  expect(await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')))).toEqual(destinations)
  for (let index = 1; index < destinations.length; index++) {
    const destination = destinations[index]
    const target = page.locator(destination)
    await expect(target).toHaveCount(1)
    await expect(target).toHaveAccessibleName(/\S/)
    await links.nth(index).click()
    await expect(page).toHaveURL(new RegExp(`${destination}$`))
    await expect(target.getByRole('heading').first()).toBeInViewport()
  }
})

test('first Tab reveals the skip link and Enter transfers visible focus to main', async ({ page }) => {
  const skip = page.getByRole('link', { name: 'Saltar al contenido' })
  await expect(skip).not.toBeInViewport()
  await page.keyboard.press('Tab')
  await expect(skip).toBeInViewport()
  await expect(skip).toBeVisible()
  await expectVisibleFocus(skip)

  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main-content$/)
  await expectVisibleFocus(page.getByRole('main'))
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
})

test('keyboard navigation exposes visible focus on navigation, actions, and contact links', async ({ page }) => {
  const links = page.getByRole('link')
  const count = await links.count()
  // Walk the real tab order, without programmatically focusing the elements.
  for (let index = 0; index < count; index++) {
    await page.keyboard.press('Tab')
    const link = links.nth(index)
    await expectVisibleFocus(link)
    await expect(link).toBeInViewport()
  }
  await expect(links.last()).toHaveAttribute('href', '#inicio')
})
