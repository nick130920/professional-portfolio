import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const identity = 'Nicolás Andrés Muñoz Coronado'

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('Progressive enhancement', () => {
  it('keeps reveal targets readable when browser enhancement APIs are unavailable', () => {
    render(<App />)

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

  it('preserves the supplied professional profile', () => {
    render(<App />)

    const profile = screen.getByRole('region', { name: 'Perfil profesional' })
    for (const fact of [
      'Go, Java y Spring Boot',
      'Angular, Flutter e Ionic',
      'nube e inteligencia artificial',
      'CI/CD con Fury',
      'pruebas y observabilidad con Datadog y New Relic',
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
          /arquitecturas distribuidas en Golang.*alta demanda operativa.*estándares de la industria/i,
          /entrenamiento de IA en la nube.*MeliGPT.*automatizar tareas complejas.*eficiencia/i,
          /CI\/CD en Fury.*IA.*aseguramiento de calidad.*pruebas unitarias exhaustivas/i,
          /observabilidad.*Datadog, Grafana y New Relic.*consultas complejas en BigQuery y MySQL/i,
        ],
      },
      {
        company: 'Ada S.A', role: 'Líder Técnico & Desarrollador Fullstack',
        location: 'Medellín, Antioquia', dates: 'Sep 2024 – Jun 2025',
        achievements: [
          /coordinación técnica de equipos backend.*migraciones.*sistemas financieros.*administración de rentas y facturación/i,
          /diseño integral de Fashion Maps.*geolocalización.*Flutter.*backend robusto en Java/i,
          /pipelines CI\/CD.*arquitecturas distribuidas.*automatización de despliegues/i,
        ],
      },
      {
        company: 'Universidad Surcolombiana', role: 'Desarrollador FullStack',
        location: 'Neiva, Huila', dates: 'Sep 2021 – Nov 2024',
        achievements: [
          /SIVIPS.*Sistema Integrado de Vicerrectoría Investigación y Proyección Social.*Spring Boot y Angular/i,
          /refactorización profunda.*sistemas heredados.*Arquitectura Hexagonal.*deuda técnica.*mantenibilidad/i,
          /CI\/CD automatizado.*JWT y OAuth2/i,
        ],
      },
      {
        company: 'Yoly Shoes', role: 'Desarrollador Full-Stack',
        location: 'Neiva, Huila', dates: 'Feb 2020 – Dic 2020',
        achievements: [
          /e-commerce B2C desde cero.*digitalizar y modernizar el canal de ventas/i,
          /optimización.*tiempos de consulta en MySQL.*navegación fluida/i,
          /APIs RESTful.*pasarelas de pago.*logística integral de envíos/i,
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
      const points = within(entry).getAllByRole('listitem')
      expect(points).toHaveLength(achievements.length)
      achievements.forEach((achievement, pointIndex) => {
        expect(points[pointIndex]).toHaveTextContent(achievement)
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
