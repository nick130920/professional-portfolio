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
    await expect(page.getByText('Arquitectura y desarrollo full-stack para sistemas financieros y e-commerce.', { exact: true })).toBeVisible()
    await expect(page.locator('[data-reveal]')).toHaveCount(6)
    await expect(page.locator('.achievements li')).toHaveCount(13)
    for (const point of await page.locator('.achievements li').all()) await expect(point).toBeVisible()
    await expect(page.getByRole('button')).toHaveCount(0)
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
  await expect(page.locator('.achievements li:visible')).toHaveCount(8)
  await expect(page.getByText('Arquitectura y desarrollo full-stack para sistemas financieros y e-commerce.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { expanded: false })).toHaveCount(4)
  const prerendered = await page.evaluate((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html')
    return [...document.querySelectorAll('.achievements')].map((list) => [...list.children].map((point) => point.textContent))
  }, await readFile('dist/index.html', 'utf8'))
  expect(prerendered.flat()).toHaveLength(13)
  for (const [index, list] of (await page.locator('.achievements').all()).entries()) {
    expect(await list.locator('li').allTextContents()).toEqual(prerendered[index])
    expect(await list.locator('li:visible').allTextContents()).toEqual(prerendered[index].slice(0, 2))
  }
  const contactLink = page.getByRole('navigation').getByRole('link', { name: 'Contacto', exact: true })
  await contactLink.click()
  await expect(contactLink).toHaveAttribute('aria-current', 'location')
  await expect(page.locator('#contact-title')).toBeInViewport()
  expect(errors).toEqual([])
})

test('career disclosures support Enter and Space independently with visible focus and responsive targets', async ({ page }) => {
  const entries = page.locator('.timeline-entry article')
  const original = await page.locator('.achievements').evaluateAll((lists) => lists.map((list) => [...list.children].map((point) => point.textContent)))
  for (const [index, entry] of (await entries.all()).entries()) {
    const company = await entry.getByRole('heading', { level: 3 }).textContent()
    const toggle = entry.getByRole('button')
    await expect(toggle).toHaveAccessibleName(`Ver todos los logros de ${company}`)
    await expect(toggle).toHaveAttribute('type', 'button')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-controls', await entry.getByRole('list').getAttribute('id') as string)
    await toggle.focus()
    // Shift+Tab/Tab enters the native keyboard focus path before activation.
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expectVisibleFocus(toggle)
    await page.keyboard.press('Enter')
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAccessibleName(`Mostrar menos logros de ${company}`)
    await expectVisibleFocus(toggle)
    expect(await entry.locator('.achievements li:visible').allTextContents()).toEqual(original[index])
    await expect(page.getByRole('button', { expanded: false })).toHaveCount(3)
    await page.keyboard.press('Space')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAccessibleName(`Ver todos los logros de ${company}`)
    await expectVisibleFocus(toggle)
    expect(await entry.locator('.achievements li:visible').allTextContents()).toEqual(original[index].slice(0, 2))
  }

  for (const width of [1440, 850, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const expanded of [false, true]) {
      for (const toggle of await page.locator('.achievement-toggle').all()) {
        if (expanded) await toggle.click()
        const bounds = (await toggle.boundingBox())!
        expect(bounds.height).toBeGreaterThanOrEqual(44)
        expect(bounds.width).toBeGreaterThanOrEqual(44)
        expect(bounds.x).toBeGreaterThanOrEqual(5)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 5)
      }
      await expect(page.locator('.achievements li:visible')).toHaveCount(expanded ? 13 : 8)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
    for (const toggle of await page.locator('.achievement-toggle').all()) await toggle.click()
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const toggle of await page.locator('.achievement-toggle').all()) {
    await expect(toggle).toHaveCSS('transition-duration', '0s')
    await expect(toggle).toHaveCSS('animation-name', 'none')
    await expect(toggle).toHaveCSS('transform', 'none')
  }
})

test('print reveals all achievements and hides controls without changing disclosure state', async ({ page }) => {
  const controls = page.locator('.achievement-toggle')
  await expect(controls).toHaveCount(4)
  for (const expandedCount of [0, 1, 4]) {
    for (let index = 0; index < expandedCount; index++) {
      const toggle = controls.nth(index)
      if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click()
    }
    const states = await controls.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-expanded')))
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.achievements li:visible')).toHaveCount(13)
    for (const point of await page.locator('.achievements li').all()) await expect(point).toBeVisible()
    for (const toggle of await controls.all()) await expect(toggle).toHaveCSS('display', 'none')
    await page.emulateMedia({ media: 'screen' })
    expect(await controls.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-expanded')))).toEqual(states)
    await expect(page.locator('.achievements li:visible')).toHaveCount(expandedCount === 0 ? 8 : expandedCount === 1 ? 10 : 13)
  }
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

test('positioning has quiet visual isolation, readable contrast, and no new keyboard or motion behavior', async ({ page }) => {
  const statement = page.getByText('Arquitectura y desarrollo full-stack para sistemas financieros y e-commerce.', { exact: true })
  await expect(statement).toHaveCount(1)
  const hero = page.locator('#inicio')
  const profile = page.locator('#perfil')
  const primary = hero.getByRole('link', { name: 'Contactar por correo' })

  for (const width of [1440, 1000, 850, 600, 480, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await expect(statement).toBeVisible()
    const band = (await statement.boundingBox())!
    const heroBounds = (await hero.boundingBox())!
    const profileBounds = (await profile.boundingBox())!
    const actionBounds = (await primary.boundingBox())!
    expect(band.y).toBeGreaterThanOrEqual(heroBounds.y + heroBounds.height)
    expect(band.y).toBeGreaterThanOrEqual(actionBounds.y + actionBounds.height + 48)
    expect(profileBounds.y).toBeGreaterThanOrEqual(band.y + band.height + 32)
    expect(band.x).toBeGreaterThanOrEqual(20)
    expect(band.x + band.width).toBeLessThanOrEqual(width - 20)
    await expect(statement).toHaveCSS('background-color', 'rgb(239, 238, 231)')
    await expect(statement).toHaveCSS('color', 'rgb(24, 37, 43)')
    await expect(primary).toHaveCSS('background-color', 'rgb(23, 77, 195)')
    const readability = await statement.evaluate((element) => {
      const style = getComputedStyle(element)
      const range = document.createRange()
      range.selectNodeContents(element)
      const box = element.getBoundingClientRect()
      const luminance = (color: string) => {
        const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((value) => {
          const channel = value / 255
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
        return r * 0.2126 + g * 0.7152 + b * 0.0722
      }
      const foreground = luminance(style.color)
      const background = luminance(style.backgroundColor)
      return {
        contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
        fits: [...range.getClientRects()].every((rect) => rect.left >= box.left && rect.right <= box.right),
        fontSize: parseFloat(style.fontSize),
        fontFamily: style.fontFamily,
        editorial: style.getPropertyValue('--editorial').trim(),
      }
    })
    expect(readability.contrast).toBeGreaterThanOrEqual(4.5)
    expect(readability.fits).toBe(true)
    expect(readability.fontFamily).toBe(readability.editorial)
    expect(readability.fontSize).toBeLessThan(await hero.locator('h1').evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }

  // No added stop between the existing secondary hero action and career controls.
  await hero.getByRole('link', { name: 'Conocer mi perfil' }).focus()
  await page.keyboard.press('Tab')
  await expectVisibleFocus(page.locator('.achievement-toggle').first())
  for (const motion of ['no-preference', 'reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion: motion })
    await statement.scrollIntoViewIfNeeded()
    await expect(statement).toHaveCSS('animation-name', 'none')
    await expect(statement).toHaveCSS('transition-duration', '0s')
    await expect(statement).toHaveCSS('opacity', '1')
    await expect(statement).toHaveCSS('transform', 'none')
    await expect(statement).not.toHaveAttribute('data-revealed')
  }
})

test('print omits the redundant positioning band while retaining its source CV facts', async ({ page }) => {
  const statement = page.getByText('Arquitectura y desarrollo full-stack para sistemas financieros y e-commerce.', { exact: true })
  await expect(statement).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(statement).toHaveCSS('display', 'none')
  await expect(page.locator('.positioning')).toBeVisible()
  await expect(page.locator('.hero-summary')).toContainText('financiero y e-commerce')
  await expect(page.locator('.profile-copy .lead')).toBeVisible()
  await expect(page.locator('.profile-copy .lead')).toHaveText('Desarrollo full-stack con perspectiva de arquitectura.')
  await page.emulateMedia({ media: 'screen' })
  await expect(statement).toBeVisible()
})

test('career and expertise use distinct editorial layouts without changing reading order', async ({ page }) => {
  const career = page.getByRole('region', { name: 'Experiencia profesional' })
  const skills = page.getByRole('region', { name: 'Habilidades técnicas' })
  const education = page.getByRole('region', { name: 'Educación', exact: true })
  const certifications = page.getByRole('region', { name: 'Certificaciones y cursos' })

  for (const width of [1440, 1000, 850, 600, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    const heading = (await career.locator('.section-heading').boundingBox())!
    const timeline = (await career.getByRole('list', { name: 'Experiencia profesional' }).boundingBox())!
    expect(timeline.x).toBeCloseTo(heading.x, 0)
    expect(timeline.width).toBeCloseTo(heading.width, 0)
    const careerTitle = career.getByRole('heading', { level: 2 })
    const profileTitle = page.getByRole('region', { name: 'Perfil profesional' }).getByRole('heading', { level: 2 })
    expect(await careerTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
      .toBeGreaterThan(await profileTitle.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))

    for (const entry of await career.getByRole('article').all()) {
      const masthead = (await entry.locator('header').boundingBox())!
      const achievements = (await entry.getByRole('list').boundingBox())!
      if (width > 600) {
        expect(achievements.x).toBeGreaterThanOrEqual(masthead.x + masthead.width)
      } else {
        expect(achievements.y).toBeGreaterThanOrEqual(masthead.y + masthead.height)
      }
    }

    const groups = skills.getByRole('region')
    await expect(groups).toHaveCount(5)
    const firstGroup = (await groups.nth(0).boundingBox())!
    const secondGroup = (await groups.nth(1).boundingBox())!
    const degrees = education.getByRole('article')
    const firstDegree = (await degrees.nth(0).boundingBox())!
    const secondDegree = (await degrees.nth(1).boundingBox())!
    if (width > 600) {
      expect(secondGroup.y).toBeCloseTo(firstGroup.y, 0)
      expect(secondDegree.y).toBeCloseTo(firstDegree.y, 0)
    } else {
      expect(secondGroup.y).toBeGreaterThanOrEqual(firstGroup.y + firstGroup.height)
      expect(secondDegree.y).toBeGreaterThanOrEqual(firstDegree.y + firstDegree.height)
    }
    await expect(certifications.locator('time')).toHaveCount(1)
    await expect(certifications.getByRole('article').nth(1).locator('time')).toHaveCount(0)
    for (const selector of ['#perfil', '#experiencia', '#habilidades', '#formacion', '#certificaciones']) {
      const section = page.locator(selector)
      await expect(section).toHaveCSS('opacity', '1')
      const bounds = (await section.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})

test('narrow navigation and contact links provide complete unclipped touch targets', async ({ page }) => {
  for (const width of [1440, 1000, 850, 600, 480, 375, 320]) {
    await page.setViewportSize({ width, height: 900 })
    const navigation = page.getByRole('navigation')
    await expect(navigation.getByRole('listitem')).toHaveCount(7)
    for (const link of await navigation.getByRole('link').all()) {
      const bounds = (await link.boundingBox())!
      expect(bounds.height).toBeGreaterThanOrEqual(44)
      expect(bounds.x).toBeGreaterThanOrEqual(5)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 5)
      await expect(link).toBeVisible()
    }
    if (width <= 480) {
      const links = navigation.getByRole('link')
      const first = (await links.nth(0).boundingBox())!
      const second = (await links.nth(1).boundingBox())!
      const third = (await links.nth(2).boundingBox())!
      expect(second.y).toBeCloseTo(first.y, 0)
      expect(third.y).toBeGreaterThanOrEqual(first.y + first.height)
      expect(second.x).toBeGreaterThanOrEqual(first.x + first.width)
    }
    const contactLinks = page.locator('#contacto address a')
    await expect(contactLinks).toHaveCount(5)
    expect(await contactLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(contactHrefs)
    for (const link of await contactLinks.all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48)
      await expect(link.locator('.contact-value')).toHaveCSS('overflow-wrap', 'anywhere')
    }
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByText('Portafolio profesional')).toBeVisible()
    expect((await footer.getByRole('link').boundingBox())!.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
  }
})

test('contact interactions never shift text and live reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const link = page.locator('#contacto a').first()
  const value = link.locator('.contact-value')
  await link.scrollIntoViewIfNeeded()
  const before = (await value.boundingBox())!
  await link.hover()
  await expect(link).toHaveCSS('transition-duration', '0.15s, 0.15s')
  await expect(value).toHaveCSS('text-decoration-line', 'underline')
  expect(await value.boundingBox()).toEqual(before)
  await expect(value).toHaveCSS('opacity', '1')
  await expect(value).toHaveCSS('transform', 'none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const selector of ['nav a', '.button', '#contacto a', '.site-footer a']) {
    for (const target of await page.locator(selector).all()) {
      await expect(target).toHaveCSS('transition-duration', '0s')
      await expect(target).toHaveCSS('animation-name', 'none')
      await expect(target).toHaveCSS('transform', 'none')
    }
  }
  await expect(value).toHaveCSS('text-decoration-line', 'underline')
  expect(await value.boundingBox()).toEqual(before)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(link).toHaveCSS('transition-duration', '0.15s, 0.15s')
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
  expect(await page.locator('.contact-row a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(contactHrefs)
  for (const value of await page.locator('.contact-value').all()) await expect(value).toBeVisible()
  for (const arrow of await page.locator('.contact-row a [aria-hidden]').all()) await expect(arrow).toBeHidden()
  await expect(page.locator('.achievements').first()).toHaveCSS('font-size', '13.3333px')
  // Keep the PDF in memory: verify the actual CSS-selected A4 paper size.
  const pdf = await page.pdf({ preferCSSPageSize: true })
  const mediaBox = pdf.toString('latin1').match(/\/MediaBox\s*\[0 0 ([\d.]+) ([\d.]+)\]/)
  expect(mediaBox).not.toBeNull()
  expect(Math.abs(Number(mediaBox![1]) - 595.28)).toBeLessThan(1)
  expect(Math.abs(Number(mediaBox![2]) - 841.89)).toBeLessThan(1)
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

test('keyboard navigation exposes visible focus on navigation, actions, disclosures, and contact links', async ({ page }) => {
  const targets = page.locator('a, button')
  const count = await targets.count()
  // Walk the real tab order, without programmatically focusing the elements.
  for (let index = 0; index < count; index++) {
    await page.keyboard.press('Tab')
    const target = targets.nth(index)
    await expectVisibleFocus(target)
    await expect(target).toBeInViewport()
  }
  await expect(targets.last()).toHaveAttribute('href', '#inicio')
})
