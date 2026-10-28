import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from './App'

const identity = 'Nicolás Andrés Muñoz Coronado'

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('Sticky editorial header', () => {
  it('marks scroll away from top, resets at top, and removes its passive listener', () => {
    vi.stubGlobal('scrollY', 0)
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<App />)
    const header = screen.getByRole('banner')
    expect(header).not.toHaveAttribute('data-scrolled')
    vi.stubGlobal('scrollY', 1)
    fireEvent.scroll(window)
    expect(header).toHaveAttribute('data-scrolled', 'true')
    vi.stubGlobal('scrollY', 0)
    fireEvent.scroll(window)
    expect(header).not.toHaveAttribute('data-scrolled')
    expect(add).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    const listener = add.mock.calls.find(([event]) => event === 'scroll')![1]
    unmount()
    expect(remove).toHaveBeenCalledWith('scroll', listener)
    add.mockRestore()
    remove.mockRestore()
  })

  it('initializes the marker for a restored scroll position without marking prerendered HTML', () => {
    vi.stubGlobal('scrollY', 240)
    const html = new DOMParser().parseFromString(renderToString(<App />), 'text/html')
    expect(html.querySelector('.site-header')!.hasAttribute('data-scrolled')).toBe(false)
    render(<App />)
    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true')
  })
})

describe('Mobile navigation disclosure', () => {
  function mockViewport(initiallyNarrow = true) {
    const viewport = new EventTarget() as EventTarget & { matches: boolean }
    viewport.matches = initiallyNarrow
    vi.stubGlobal('matchMedia', (query: string) => query === '(max-width: 480px)'
      ? viewport
      : { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    const resize = (narrow: boolean) => act(() => {
      viewport.matches = narrow
      viewport.dispatchEvent(new Event('change'))
    })
    return Object.assign(resize, { removeListener: vi.spyOn(viewport, 'removeEventListener') })
  }

  it('prerenders all seven exact native destinations without a menu control', () => {
    mockViewport()
    const html = new DOMParser().parseFromString(renderToString(<App />), 'text/html')
    const navigation = html.querySelector('nav')!
    expect([...navigation.querySelectorAll('a')].map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Inicio', '#inicio'], ['Perfil', '#perfil'], ['Experiencia', '#experiencia'],
      ['Habilidades', '#habilidades'], ['Formación', '#formacion'],
      ['Certificaciones', '#certificaciones'], ['Contacto', '#contacto'],
    ])
    expect(navigation.querySelector('[hidden], [aria-hidden="true"]')).toBeNull()
    expect(html.querySelector('button')).toBeNull()
  })

  it('collapses after hydration and toggles all links without losing button focus', () => {
    mockViewport()
    render(<App />)
    const navigation = screen.getByRole('navigation')
    const toggle = screen.getByRole('button', { name: 'Menú' })
    expect(toggle.tagName).toBe('BUTTON')
    expect(toggle).toHaveAttribute('type', 'button')
    const list = within(navigation).getByRole('list', { hidden: true })
    expect(toggle).toHaveAttribute('aria-controls', list.id)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(navigation).queryAllByRole('link')).toHaveLength(0)
    toggle.focus()
    fireEvent.click(toggle)
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(within(navigation).getAllByRole('link')).toHaveLength(7)
    fireEvent.click(toggle)
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(list).not.toBeVisible()
  })

  it('closes on link selection without cancelling native hash navigation', () => {
    mockViewport()
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Menú' })
    fireEvent.click(toggle)
    const link = screen.getByRole('navigation').querySelector('a[href="#contacto"]')!
    expect(fireEvent.click(link)).toBe(true)
    expect(link).toHaveAttribute('href', '#contacto')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    window.history.replaceState(null, '', '/#contacto')
    fireEvent(window, new Event('hashchange'))
    expect(link).toHaveAttribute('aria-current', 'location')
  })

  it('resets live breakpoint crossings and cleans up its listener', () => {
    const resize = mockViewport(false)
    const { unmount } = render(<App />)
    const navigation = screen.getByRole('navigation')
    expect(screen.queryByRole('button', { name: 'Menú' })).toBeNull()
    expect(within(navigation).getAllByRole('link')).toHaveLength(7)
    within(navigation).getByRole('link', { name: 'Perfil' }).focus()
    resize(true)
    const toggle = screen.getByRole('button', { name: 'Menú' })
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    resize(false)
    expect(screen.queryByRole('button', { name: 'Menú' })).toBeNull()
    expect(within(navigation).getAllByRole('link')).toHaveLength(7)
    resize(true)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(navigation).queryAllByRole('link')).toHaveLength(0)
    unmount()
    expect(resize.removeListener).toHaveBeenCalledWith('change', expect.any(Function))
    resize(false)
  })
})

describe('Progressive enhancement', () => {
  it('prerenders all 13 achievements without disclosure controls for JavaScript-free reading', () => {
    const html = new DOMParser().parseFromString(renderToString(<App />), 'text/html')

    const points = html.querySelectorAll('.achievements li')
    expect(points).toHaveLength(13)
    points.forEach((point) => {
      expect(point.hasAttribute('hidden')).toBe(false)
      expect(point.hasAttribute('aria-hidden')).toBe(false)
    })
    expect(html.querySelector('button')).toBeNull()
  })

  it('initially shows exactly the first two achievements of every hydrated role', () => {
    render(<App />)

    for (const entry of screen.getAllByRole('article').slice(0, 4)) {
      const points = within(entry).getAllByRole('listitem', { hidden: true })
      expect(within(entry).getAllByRole('listitem')).toEqual(points.slice(0, 2))
      points.forEach((point, index) => {
        if (index < 2) expect(point).toBeVisible()
        else expect(point).not.toBeVisible()
      })
      const company = within(entry).getByRole('heading', { level: 3 }).textContent!
      const toggle = within(entry).getByRole('button', { name: `Ver todos los logros de ${company}` })
      expect(toggle.tagName).toBe('BUTTON')
      expect(toggle).toHaveAttribute('type', 'button')
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveAttribute('aria-controls', within(entry).getByRole('list').id)
    }
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('reveals and hides each role independently without changing achievement order or focus', () => {
    render(<App />)
    const entries = screen.getAllByRole('article').slice(0, 4)
    const original = entries.map((entry) => within(entry).getAllByRole('listitem', { hidden: true }).map((point) => point.textContent))

    entries.forEach((entry, index) => {
      const company = within(entry).getByRole('heading', { level: 3 }).textContent!
      const toggle = within(entry).getByRole('button', { name: `Ver todos los logros de ${company}` })
      toggle.focus()
      fireEvent.click(toggle)
      expect(toggle).toHaveFocus()
      expect(toggle).toHaveAccessibleName(`Mostrar menos logros de ${company}`)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(within(entry).getAllByRole('listitem').map((point) => point.textContent)).toEqual(original[index])
      entries.filter((other) => other !== entry).forEach((other) => {
        expect(within(other).getAllByRole('listitem')).toHaveLength(2)
        expect(within(other).getByRole('button')).toHaveAttribute('aria-expanded', 'false')
      })
      fireEvent.click(toggle)
      expect(toggle).toHaveFocus()
      expect(toggle).toHaveAccessibleName(`Ver todos los logros de ${company}`)
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(within(entry).getAllByRole('listitem').map((point) => point.textContent)).toEqual(original[index].slice(0, 2))
      expect(within(entry).getAllByRole('listitem', { hidden: true }).map((point) => point.textContent)).toEqual(original[index])
    })
  })

  it('keeps reveal targets readable when browser enhancement APIs are unavailable', () => {
    render(<App />)
    expect(screen.queryByRole('button', { name: 'Menú' })).toBeNull()
    expect(within(screen.getByRole('navigation')).getAllByRole('link')).toHaveLength(7)

    const targets = document.querySelectorAll('[data-reveal]')
    expect(targets).toHaveLength(6)
    targets.forEach((target) => {
      expect(target).toBeVisible()
      expect(target).not.toHaveAttribute('hidden')
      expect(target).not.toHaveAttribute('aria-hidden')
      expect(target).not.toHaveAttribute('data-revealed')
    })
  })

  it('marks the current hash destination without intercepting native links or moving focus', () => {
    render(<App />)
    const navigation = screen.getByRole('navigation')
    expect(within(navigation).getByRole('link', { name: 'Inicio' }))
      .toHaveAttribute('aria-current', 'location')

    window.history.replaceState(null, '', '/#experiencia')
    fireEvent(window, new Event('hashchange'))
    expect(within(navigation).getByRole('link', { name: 'Experiencia' }))
      .toHaveAttribute('aria-current', 'location')
    expect(within(navigation).getByRole('link', { name: 'Inicio' }))
      .not.toHaveAttribute('aria-current')
    expect(document.activeElement).toBe(document.body)
  })

  it('stops, restarts, and cleans up enhancement when the motion preference changes live', () => {
    let changeMotion: (() => void) | undefined
    const preference = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: () => void) => { changeMotion = listener }),
      removeEventListener: vi.fn(),
    }
    const observers: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = []
    vi.stubGlobal('matchMedia', (query: string) => query === '(max-width: 480px)'
      ? { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      : preference)
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor() { observers.push(this) }
    })
    const { unmount } = render(<App />)
    expect(observers[0].observe).toHaveBeenCalledTimes(6)
    const contact = screen.getByRole('region', { name: 'Contacto' })
    contact.setAttribute('data-revealed', 'true')

    preference.matches = false
    changeMotion!()
    expect(observers[0].disconnect).toHaveBeenCalledOnce()
    expect(document.querySelector('[data-revealed]')).toBeNull()
    expect(observers).toHaveLength(1)

    preference.matches = true
    changeMotion!()
    expect(observers).toHaveLength(2)
    expect(observers[1].observe).toHaveBeenCalledTimes(6)
    unmount()
    expect(observers[1].disconnect).toHaveBeenCalledOnce()
    expect(preference.removeEventListener).toHaveBeenCalledWith('change', changeMotion)
  })

  it('does not start reveal observation when reduced motion is requested', () => {
    const observer = vi.fn()
    vi.stubGlobal('IntersectionObserver', observer)
    vi.stubGlobal('matchMedia', () => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    render(<App />)

    expect(document.querySelectorAll('[data-reveal]')).toHaveLength(6)
    expect(observer).not.toHaveBeenCalled()
    expect(document.querySelector('[data-revealed]')).toBeNull()
  })
})

describe('Portfolio foundation', () => {
  it('introduces the exact identity, current positioning, and experience', () => {
    render(<App />)

    const hero = screen.getByRole('region', { name: identity })
    expect(within(hero).getByRole('heading', { level: 1, name: identity })).toBeVisible()
    expect(within(hero).getByText('Ingeniero de Software Full-Stack y Arquitecto Desarrollador')).toBeVisible()
    expect(hero).toHaveTextContent('más de 5 años')
    expect(hero).toHaveTextContent('financiero y e-commerce')
    expect(within(hero).getByRole('link', { name: /contactar por correo/i }))
      .toHaveAttribute('href', 'mailto:namc1309@gmail.com')
  })

  it('grounds the editorial hero markers in the existing career facts', () => {
    render(<App />)

    const hero = screen.getByRole('region', { name: identity })
    expect(within(hero).getByText('Portafolio profesional')).toBeVisible()
    expect(within(hero).getByText('04 experiencias')).toBeVisible()
    const currentRole = within(hero).getByRole('complementary', { name: 'Actividad actual' })
    const career = screen.getByRole('article', { name: 'Ceiba Software - Mercado Libre' })
    for (const fact of ['Ceiba Software - Mercado Libre', 'Arquitecto Desarrollador Golang']) {
      expect(within(currentRole).getByText(fact, { exact: true })).toBeVisible()
      expect(career).toHaveTextContent(fact)
    }
    expect(within(currentRole).getByText('Jun 2025')).toHaveAttribute('datetime', '2025-06')
    expect(currentRole).toHaveTextContent('presente')
  })

  it('isolates one factual positioning statement between the hero and detailed profile', () => {
    render(<App />)

    const copy = 'Arquitectura y desarrollo full-stack para sistemas financieros y e-commerce.'
    const statement = screen.getByText(copy, { exact: true })
    expect(statement.tagName).toBe('P')
    expect(statement).toBeVisible()
    expect(statement.previousElementSibling).toBe(screen.getByRole('region', { name: identity }))
    const profile = screen.getByRole('region', { name: 'Perfil profesional' })
    expect(statement.nextElementSibling).toBe(profile)
    expect(statement.parentElement).toBe(screen.getByRole('main'))
    expect(statement.querySelector('a, button, [tabindex]')).toBeNull()
    expect(statement).not.toHaveAttribute('tabindex')
    expect(statement).not.toHaveAttribute('data-reveal')

    // Every concept in the synthesis is already present in the unchanged CV.
    expect(profile).toHaveTextContent('Desarrollo full-stack con perspectiva de arquitectura.')
    expect(profile).toHaveTextContent('en los sectores financiero y e-commerce.')
    expect(screen.getByRole('article', { name: 'Ada S.A' })).toHaveTextContent('sistemas financieros')
    expect(screen.getByRole('article', { name: 'Yoly Shoes' })).toHaveTextContent('plataforma e-commerce')

    const prerendered = new DOMParser().parseFromString(renderToString(<App />), 'text/html')
    const staticStatement = prerendered.querySelector('#inicio + p')
    expect(staticStatement?.textContent).toBe(copy)
    expect(staticStatement?.nextElementSibling?.id).toBe('perfil')
    expect(screen.getAllByText(copy, { exact: true })).toHaveLength(1)
  })

  it('provides semantic landmarks, a skip link, and working internal navigation', () => {
    render(<App />)

    const main = screen.getByRole('main')
    const skipLink = screen.getByRole('link', { name: 'Saltar al contenido' })
    expect(skipLink).toHaveAttribute('href', `#${main.id}`)
    expect(main).toHaveAttribute('tabindex', '-1')
    expect(document.querySelector('a')).toBe(skipLink)
    expect(screen.getByRole('banner')).toBeVisible()
    expect(screen.getByRole('contentinfo')).toBeVisible()

    const navigation = screen.getByRole('navigation', { name: 'Navegación principal' })
    for (const label of ['Inicio', 'Perfil', 'Experiencia', 'Habilidades', 'Formación', 'Certificaciones', 'Contacto']) {
      const link = within(navigation).getByRole('link', { name: label })
      const target = document.querySelector(link.getAttribute('href')!)
      expect(target).not.toBeNull()
    }
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('separates each career masthead from its complete achievement list', () => {
    render(<App />)

    const career = screen.getByRole('region', { name: 'Experiencia profesional' })
    for (const entry of within(career).getAllByRole('article')) {
      const masthead = entry.querySelector('header')
      expect(masthead).not.toBeNull()
      if (!masthead) throw new Error('Missing career masthead')
      expect(within(masthead).getByRole('heading', { level: 3 })).toBeVisible()
      expect(masthead.querySelector('.entry-date')).not.toBeNull()
      expect(masthead.querySelector('.entry-role')).not.toBeNull()
      expect(masthead.querySelector('.entry-location')).not.toBeNull()
      const achievements = within(entry).getByRole('list')
      expect(masthead).not.toContainElement(achievements)
      expect(masthead.nextElementSibling).toBe(achievements)
    }
  })

  it('makes every skill domain an independently named section in the original order', () => {
    render(<App />)

    const skills = screen.getByRole('region', { name: 'Habilidades técnicas' })
    const groups = within(skills).getAllByRole('region')
    expect(groups.map((group) => within(group).getByRole('heading').textContent)).toEqual([
      'Lenguajes', 'Frameworks y backend', 'Bases de datos',
      'Cloud, DevOps y herramientas IA', 'Arquitectura y seguridad',
    ])
    for (const group of groups) {
      const name = within(group).getByRole('heading').textContent!
      expect(group).toHaveAccessibleName(name)
      expect(within(group).getByRole('list', { name })).toBeVisible()
    }
  })

  it('preserves the supplied professional profile', () => {
    render(<App />)

    const profile = screen.getByRole('region', { name: 'Perfil profesional' })
    for (const fact of [
      'Desarrollo full-stack con perspectiva de arquitectura.',
      'Mi experiencia abarca el desarrollo backend con Go, Java y Spring Boot, y soluciones frontend y móviles con Angular, Flutter e Ionic, en los sectores financiero y e-commerce.',
      'Trabajo en la optimización de flujos de trabajo con nube e inteligencia artificial, CI/CD con Fury, y pruebas y observabilidad con Datadog y New Relic.',
    ]) {
      expect(profile).toHaveTextContent(fact)
    }
  })

  it('presents the complete chronological experience with exact roles, locations, dates, and achievements', () => {
    render(<App />)

    const experience = screen.getByRole('region', { name: 'Experiencia profesional' })
    const timeline = within(experience).getByRole('list', { name: 'Experiencia profesional' })
    const entries = within(timeline).getAllByRole('article')
    expect(entries).toHaveLength(4)
    const expected = [
      {
        company: 'Ceiba Software - Mercado Libre', role: 'Arquitecto Desarrollador Golang',
        location: 'Medellín, Antioquia', dates: 'Jun 2025 – presente',
        achievements: [
          'Diseño de arquitecturas distribuidas en Golang para soportar una alta demanda operativa, alineadas con los estándares de la industria.',
          'Desarrollo y entrenamiento de IA en la nube, con instrucción de modelos como MeliGPT para automatizar tareas complejas y maximizar la eficiencia.',
          'Gestión de despliegues CI/CD en Fury potenciados por IA y aseguramiento de calidad mediante el diseño de pruebas unitarias exhaustivas.',
          'Implementación de observabilidad avanzada con Datadog, Grafana y New Relic, y optimización de consultas complejas en BigQuery y MySQL.',
        ],
      },
      {
        company: 'Ada S.A', role: 'Líder Técnico & Desarrollador Fullstack',
        location: 'Medellín, Antioquia', dates: 'Sep 2024 – Jun 2025',
        achievements: [
          'Coordinación técnica de equipos backend para migraciones de aplicaciones y sistemas financieros de administración de rentas y facturación.',
          'Liderazgo del diseño integral de Fashion Maps, una aplicación móvil de geolocalización con frontend en Flutter y backend robusto en Java.',
          'Diseño de pipelines CI/CD y optimización mediante arquitecturas distribuidas y automatización de despliegues.',
        ],
      },
      {
        company: 'Universidad Surcolombiana', role: 'Desarrollador FullStack',
        location: 'Neiva, Huila', dates: 'Sep 2021 – Nov 2024',
        achievements: [
          'Liderazgo del desarrollo de SIVIPS (Sistema Integrado de Vicerrectoría Investigación y Proyección Social) con Spring Boot y Angular.',
          'Refactorización profunda de sistemas heredados hacia Arquitectura Hexagonal, reduciendo la deuda técnica y mejorando la mantenibilidad.',
          'Implementación de CI/CD automatizado para aumentar la frecuencia de despliegue, y de JWT y OAuth2 para proteger la información.',
        ],
      },
      {
        company: 'Yoly Shoes', role: 'Desarrollador Full-Stack',
        location: 'Neiva, Huila', dates: 'Feb 2020 – Dic 2020',
        achievements: [
          'Construcción de una plataforma e-commerce B2C desde cero para digitalizar y modernizar el canal de ventas.',
          'Optimización profunda de los tiempos de consulta en MySQL para una navegación fluida.',
          'Desarrollo e integración de APIs RESTful para pasarelas de pago y logística integral de envíos.',
        ],
      },
    ]
    expected.forEach(({ company, role, location, dates, achievements }, index) => {
      const entry = entries[index]
      if (!entry) throw new Error(`Missing experience entry: ${company}`)
      expect(within(entry).getByRole('heading', { level: 3, name: company })).toBeVisible()
      for (const fact of [role, location]) {
        expect(within(entry).getByText(fact, { exact: true })).toBeVisible()
      }
      expect(entry).toHaveTextContent(dates)
      const points = within(entry).getAllByRole('listitem', { hidden: true })
      expect(points).toHaveLength(achievements.length)
      achievements.forEach((achievement, pointIndex) => {
        expect(points[pointIndex].textContent).toBe(achievement)
      })
    })
    expect(within(experience).getAllByText('presente', { exact: true })).toHaveLength(1)
    expect(within(experience).getAllByRole('time').map((time) => time.getAttribute('datetime')))
      .toEqual(['2025-06', '2024-09', '2025-06', '2021-09', '2024-11', '2020-02', '2020-12'])
  })

  it('preserves the deployment and information-protection purposes of the university achievement', () => {
    render(<App />)

    const university = screen.getByRole('article', { name: 'Universidad Surcolombiana' })
    const achievement = within(university).getByText(/Implementación de CI\/CD automatizado/)
    expect(achievement).toHaveTextContent('CI/CD automatizado para aumentar la frecuencia de despliegue')
    expect(achievement).toHaveTextContent('JWT y OAuth2 para proteger la información')
  })

  it('groups every supplied technical skill by domain without adding skills', () => {
    render(<App />)

    const skills = screen.getByRole('region', { name: 'Habilidades técnicas' })
    const expected = [
      ['Lenguajes', ['Golang', 'Java', 'TypeScript', 'JavaScript', 'SQL', 'PL/SQL', 'Dart']],
      ['Frameworks y backend', ['Spring Boot', 'Spring WebFlux', 'JavaEE', 'JPA', 'Hibernate', 'JSF', 'Angular', 'Flutter', 'Ionic', 'RabbitMQ', 'GraphQL']],
      ['Bases de datos', ['PostgreSQL', 'Oracle', 'MySQL', 'Microsoft SQL Server', 'BigQuery']],
      ['Cloud, DevOps y herramientas IA', ['AWS', 'GCP', 'Azure', 'Docker', 'Jenkins', 'Git', 'GitLab', 'Backstage', 'N8N', 'Claude Code', 'GitHub Copilot']],
      ['Arquitectura y seguridad', ['Microservicios', 'Hexagonal Architecture', 'Clean Architecture', 'DDD', 'MVC', 'Auth0', 'JWT']],
    ] as const
    expect(within(skills).getAllByRole('list')).toHaveLength(expected.length)
    for (const [name, items] of expected) {
      expect(within(skills).getByRole('heading', { level: 3, name })).toBeVisible()
      const group = within(skills).getByRole('list', { name })
      expect(within(group).getAllByRole('listitem').map((item) => item.textContent)).toEqual([...items])
    }
  })

  it('lists exact education and certifications without inventing a Platzi date or credential', () => {
    render(<App />)

    const education = screen.getByRole('region', { name: 'Educación' })
    const degrees = within(education).getAllByRole('article')
    expect(degrees).toHaveLength(2)
    const expected = [
      ['Ingeniería de Software', 'Universidad Surcolombiana', 'Nov 2025', '2025-11'],
      ['Diseño e integración Multimedia', 'SENA', 'Nov 2017', '2017-11'],
    ]
    expected.forEach(([degree, institution, date, dateTime], index) => {
      expect(within(degrees[index]).getByRole('heading', { level: 3, name: degree })).toBeVisible()
      expect(within(degrees[index]).getByText(institution, { exact: true })).toBeVisible()
      expect(within(degrees[index]).getByText('Neiva, Huila', { exact: true })).toBeVisible()
      expect(within(degrees[index]).getByText(date, { exact: true })).toHaveAttribute('datetime', dateTime)
    })

    const certifications = screen.getByRole('region', { name: 'Certificaciones y cursos' })
    const courses = within(certifications).getAllByRole('article')
    expect(courses).toHaveLength(2)
    expect(within(courses[0]).getByRole('heading', { level: 3, name: 'Scrum Fundamentals' })).toBeVisible()
    expect(within(courses[0]).getByText('Scrum Study', { exact: true })).toBeVisible()
    expect(within(courses[0]).getByText('2021', { exact: true })).toHaveAttribute('datetime', '2021')
    expect(within(courses[1]).getByRole('heading', {
      level: 3, name: 'Cursos Platzi: Golang Básico, Golang Intermedio (Concurrencia y POO)',
    })).toBeVisible()
    expect(courses[1].querySelector('time')).toBeNull()
  })

  it('groups native navigation as a complete list and identifies the editorial footer', () => {
    render(<App />)

    const navigation = screen.getByRole('navigation', { name: 'Navegación principal' })
    const items = within(navigation).getAllByRole('listitem')
    expect(items).toHaveLength(7)
    for (const item of items) expect(within(item).getByRole('link')).toHaveAttribute('href', expect.stringMatching(/^#/))
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText('Portafolio profesional')).toBeVisible()
    expect(within(footer).getByText(identity)).toBeVisible()
    expect(within(footer).getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '#inicio')
  })

  it('marks owner contact information with paired channel labels and decorative arrows', () => {
    render(<App />)

    const contact = screen.getByRole('region', { name: 'Contacto' })
    const address = contact.querySelector('address')
    expect(address).not.toBeNull()
    if (!address) throw new Error('Missing owner contact information')
    expect(address.querySelector('dl')).not.toBeNull()
    expect([...address.querySelectorAll('dt')].map((label) => label.textContent))
      .toEqual(['Correo', 'Teléfono', 'LinkedIn', 'GitHub', 'Sitio web'])
    expect(within(address).getAllByRole('link')).toHaveLength(5)
    for (const row of address.querySelectorAll('.contact-row')) {
      expect(row.querySelector('dt + dd a .contact-value')).not.toBeNull()
      expect(row.querySelector('a [aria-hidden="true"]')).toHaveTextContent('↗')
    }
  })

  it('exposes all five contact channels with exact labels and valid destinations', () => {
    render(<App />)

    const contact = screen.getByRole('region', { name: 'Contacto' })
    const channels = [
      ['namc1309@gmail.com', 'mailto:namc1309@gmail.com'],
      ['+57 310 3850396', 'tel:+573103850396'],
      ['nicolas-munoz-coronado', 'https://www.linkedin.com/in/nicolas-munoz-coronado/'],
      ['nick130920', 'https://github.com/nick130920'],
      ['https://nicolasm.pro', 'https://nicolasm.pro'],
    ]
    for (const [label, destination] of channels) {
      expect(within(contact).getByRole('link', { name: label }))
        .toHaveAttribute('href', destination)
    }
    expect(within(contact).getAllByRole('link')).toHaveLength(5)
  })
})
