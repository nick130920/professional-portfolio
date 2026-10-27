import { useEffect, useRef, useState } from 'react'

const navigation = [
  ['inicio', 'Inicio'], ['perfil', 'Perfil'], ['experiencia', 'Experiencia'],
  ['habilidades', 'Habilidades'], ['formacion', 'Formación'],
  ['certificaciones', 'Certificaciones'], ['contacto', 'Contacto'],
]

const contacts = [
  { label: 'Correo', text: 'namc1309@gmail.com', href: 'mailto:namc1309@gmail.com' },
  { label: 'Teléfono', text: '+57 310 3850396', href: 'tel:+573103850396' },
  {
    label: 'LinkedIn',
    text: 'nicolas-munoz-coronado',
    href: 'https://www.linkedin.com/in/nicolas-munoz-coronado/',
  },
  { label: 'GitHub', text: 'nick130920', href: 'https://github.com/nick130920' },
  { label: 'Sitio web', text: 'https://nicolasm.pro', href: 'https://nicolasm.pro' },
]

const experience = [
  {
    id: 'ceiba',
    company: 'Ceiba Software - Mercado Libre',
    role: 'Arquitecto Desarrollador Golang',
    location: 'Medellín, Antioquia',
    start: { label: 'Jun 2025', dateTime: '2025-06' },
    end: null,
    achievements: [
      'Diseño de arquitecturas distribuidas en Golang para soportar una alta demanda operativa, alineadas con los estándares de la industria.',
      'Desarrollo y entrenamiento de IA en la nube, con instrucción de modelos como MeliGPT para automatizar tareas complejas y maximizar la eficiencia.',
      'Gestión de despliegues CI/CD en Fury potenciados por IA y aseguramiento de calidad mediante el diseño de pruebas unitarias exhaustivas.',
      'Implementación de observabilidad avanzada con Datadog, Grafana y New Relic, y optimización de consultas complejas en BigQuery y MySQL.',
    ],
  },
  {
    id: 'ada',
    company: 'Ada S.A',
    role: 'Líder Técnico & Desarrollador Fullstack',
    location: 'Medellín, Antioquia',
    start: { label: 'Sep 2024', dateTime: '2024-09' },
    end: { label: 'Jun 2025', dateTime: '2025-06' },
    achievements: [
      'Coordinación técnica de equipos backend para migraciones de aplicaciones y sistemas financieros de administración de rentas y facturación.',
      'Liderazgo del diseño integral de Fashion Maps, una aplicación móvil de geolocalización con frontend en Flutter y backend robusto en Java.',
      'Diseño de pipelines CI/CD y optimización mediante arquitecturas distribuidas y automatización de despliegues.',
    ],
  },
  {
    id: 'usco',
    company: 'Universidad Surcolombiana',
    role: 'Desarrollador FullStack',
    location: 'Neiva, Huila',
    start: { label: 'Sep 2021', dateTime: '2021-09' },
    end: { label: 'Nov 2024', dateTime: '2024-11' },
    achievements: [
      'Liderazgo del desarrollo de SIVIPS (Sistema Integrado de Vicerrectoría Investigación y Proyección Social) con Spring Boot y Angular.',
      'Refactorización profunda de sistemas heredados hacia Arquitectura Hexagonal, reduciendo la deuda técnica y mejorando la mantenibilidad.',
      'Implementación de CI/CD automatizado para aumentar la frecuencia de despliegue, y de JWT y OAuth2 para proteger la información.',
    ],
  },
  {
    id: 'yoly',
    company: 'Yoly Shoes',
    role: 'Desarrollador Full-Stack',
    location: 'Neiva, Huila',
    start: { label: 'Feb 2020', dateTime: '2020-02' },
    end: { label: 'Dic 2020', dateTime: '2020-12' },
    achievements: [
      'Construcción de una plataforma e-commerce B2C desde cero para digitalizar y modernizar el canal de ventas.',
      'Optimización profunda de los tiempos de consulta en MySQL para una navegación fluida.',
      'Desarrollo e integración de APIs RESTful para pasarelas de pago y logística integral de envíos.',
    ],
  },
]

const skillGroups = [
  { id: 'languages', name: 'Lenguajes', items: ['Golang', 'Java', 'TypeScript', 'JavaScript', 'SQL', 'PL/SQL', 'Dart'] },
  { id: 'frameworks', name: 'Frameworks y backend', items: ['Spring Boot', 'Spring WebFlux', 'JavaEE', 'JPA', 'Hibernate', 'JSF', 'Angular', 'Flutter', 'Ionic', 'RabbitMQ', 'GraphQL'] },
  { id: 'databases', name: 'Bases de datos', items: ['PostgreSQL', 'Oracle', 'MySQL', 'Microsoft SQL Server', 'BigQuery'] },
  { id: 'cloud', name: 'Cloud, DevOps y herramientas IA', items: ['AWS', 'GCP', 'Azure', 'Docker', 'Jenkins', 'Git', 'GitLab', 'Backstage', 'N8N', 'Claude Code', 'GitHub Copilot'] },
  { id: 'architecture', name: 'Arquitectura y seguridad', items: ['Microservicios', 'Hexagonal Architecture', 'Clean Architecture', 'DDD', 'MVC', 'Auth0', 'JWT'] },
]

const education = [
  { id: 'software', degree: 'Ingeniería de Software', institution: 'Universidad Surcolombiana', date: 'Nov 2025', dateTime: '2025-11' },
  { id: 'multimedia', degree: 'Diseño e integración Multimedia', institution: 'SENA', date: 'Nov 2017', dateTime: '2017-11' },
]

export default function App() {
  const mainRef = useRef<HTMLElement>(null)
  const [currentSection, setCurrentSection] = useState('inicio')
  const [enhanced, setEnhanced] = useState(false)
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({})

  // Match the prerender on the first client render; collapse only after hydration.
  useEffect(() => { setEnhanced(true) }, [])

  useEffect(() => {
    const updateLocation = () => setCurrentSection(window.location.hash.slice(1) || 'inicio')
    updateLocation()
    window.addEventListener('hashchange', updateLocation)
    return () => window.removeEventListener('hashchange', updateLocation)
  }, [])

  useEffect(() => {
    if (!window.matchMedia || !('IntersectionObserver' in window)) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const targets = mainRef.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? []
    let observer: IntersectionObserver | undefined

    const updateMotion = () => {
      observer?.disconnect()
      targets.forEach((target) => target.removeAttribute('data-revealed'))
      if (!motion.matches) return
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          target.setAttribute('data-revealed', 'true')
          observer?.unobserve(target)
        })
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' })
      targets.forEach((target) => observer?.observe(target))
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      observer?.disconnect()
      motion.removeEventListener('change', updateMotion)
      targets.forEach((target) => target.removeAttribute('data-revealed'))
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>

      <header className="site-header shell">
        <a className="wordmark" href="#inicio" aria-label="Nicolás Muñoz · Inicio">
          <span className="wordmark-monogram">nm<span aria-hidden="true">.</span></span>
          <span className="wordmark-caption">Software &amp;<br />arquitectura</span>
        </a>
        <nav aria-label="Navegación principal">
          <ul role="list">
            {navigation.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={currentSection === id ? 'location' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main ref={mainRef} id="main-content" className="shell" tabIndex={-1}>
        <section id="inicio" className="hero" aria-labelledby="hero-title">
          <div className="hero-masthead">
            <p className="eyebrow">Portafolio profesional</p>
            <p className="eyebrow">{String(experience.length).padStart(2, '0')} experiencias</p>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Ingeniería de software · Arquitectura</p>
            <h1 id="hero-title">Nicolás Andrés<br />Muñoz Coronado<span className="accent" aria-hidden="true">.</span></h1>
            <p className="positioning">Ingeniero de Software Full-Stack y Arquitecto Desarrollador</p>
            <p className="hero-summary">
              Experiencia de más de 5 años en los sectores financiero y e-commerce.
              Backend, frontend y móvil con una visión integral del software.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="mailto:namc1309@gmail.com">
                Contactar por correo <span aria-hidden="true">↗</span>
              </a>
              <a className="button button-secondary" href="#perfil">
                Conocer mi perfil <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <aside className="hero-note" aria-label="Actividad actual">
            <p className="eyebrow">Actualmente</p>
            <p className="note-role">{experience[0].role}</p>
            <p className="note-company">{experience[0].company}</p>
            <p className="note-date"><time dateTime={experience[0].start.dateTime}>{experience[0].start.label}</time> – presente</p>
            <p className="note-index">Backend / Frontend / Móvil</p>
          </aside>
        </section>

        <section id="perfil" data-reveal className="section profile" aria-labelledby="profile-title">
          <div className="section-heading">
            <p className="eyebrow">01 / Sobre mí</p>
            <h2 id="profile-title">Perfil profesional</h2>
          </div>
          <div className="profile-copy">
            <p className="lead">Desarrollo full-stack con perspectiva de arquitectura.</p>
            <p>
              Mi experiencia abarca el desarrollo backend con Go, Java y Spring Boot,
              y soluciones frontend y móviles con Angular, Flutter e Ionic,
              en los sectores financiero y e-commerce.
            </p>
            <p>
              Trabajo en la optimización de flujos de trabajo con nube e inteligencia artificial,
              CI/CD con Fury, y pruebas y observabilidad con Datadog y New Relic.
            </p>
          </div>
        </section>

        <section id="experiencia" data-reveal className="section career" aria-labelledby="experience-title">
          <div className="section-heading">
            <p className="eyebrow">02 / Trayectoria</p>
            <h2 id="experience-title">Experiencia profesional</h2>
          </div>
          <ol className="timeline" role="list" aria-labelledby="experience-title">
            {experience.map(({ id, company, role, location, start, end, achievements }) => (
              <li className="timeline-entry" key={id}>
                <article aria-labelledby={`${id}-title`}>
                  <header className="entry-masthead" role="group" aria-labelledby={`${id}-title`}>
                    <p className="entry-date">
                      <time dateTime={start.dateTime}>{start.label}</time>
                      {' – '}
                      {end ? <time dateTime={end.dateTime}>{end.label}</time> : <span>presente</span>}
                    </p>
                    <h3 id={`${id}-title`}>{company}</h3>
                    <p className="entry-role">{role}</p>
                    <p className="entry-location">{location}</p>
                  </header>
                  <ul id={`${id}-achievements`} className="achievements">
                    {achievements.map((achievement, index) => (
                      <li key={achievement} hidden={enhanced && !expandedRoles[id] && index >= 2}>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                  {enhanced && achievements.length > 2 && (
                    <button
                      type="button"
                      className="button achievement-toggle"
                      aria-expanded={!!expandedRoles[id]}
                      aria-controls={`${id}-achievements`}
                      onClick={() => setExpandedRoles((previous) => ({ ...previous, [id]: !previous[id] }))}
                    >
                      {expandedRoles[id] ? 'Mostrar menos logros' : 'Ver todos los logros'} de {company}
                    </button>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section id="habilidades" data-reveal className="section expertise" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="eyebrow">03 / Conocimientos</p>
            <h2 id="skills-title">Habilidades técnicas</h2>
          </div>
          <div className="skill-groups">
            {skillGroups.map(({ id, name, items }) => (
              <section className="skill-group" key={id} aria-labelledby={`${id}-title`}>
                <h3 id={`${id}-title`}>{name}</h3>
                <ul className="skill-list" role="list" aria-labelledby={`${id}-title`}>
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <section id="formacion" data-reveal className="section education" aria-labelledby="education-title">
          <div className="section-heading">
            <p className="eyebrow">04 / Formación académica</p>
            <h2 id="education-title">Educación</h2>
          </div>
          <div className="credential-list">
            {education.map(({ id, degree, institution, date, dateTime }) => (
              <article className="credential" key={id} aria-labelledby={`${id}-title`}>
                <p className="entry-date"><time dateTime={dateTime}>{date}</time></p>
                <h3 id={`${id}-title`}>{degree}</h3>
                <p className="entry-role">{institution}</p>
                <p className="entry-location">Neiva, Huila</p>
              </article>
            ))}
          </div>
        </section>

        <section id="certificaciones" data-reveal className="section certifications" aria-labelledby="certifications-title">
          <div className="section-heading">
            <p className="eyebrow">05 / Formación complementaria</p>
            <h2 id="certifications-title">Certificaciones y cursos</h2>
          </div>
          <div className="credential-list">
            <article className="credential" aria-labelledby="scrum-title">
              <p className="entry-date"><time dateTime="2021">2021</time></p>
              <h3 id="scrum-title">Scrum Fundamentals</h3>
              <p className="entry-role">Scrum Study</p>
            </article>
            <article className="credential" aria-labelledby="platzi-title">
              <h3 id="platzi-title">Cursos Platzi: Golang Básico, Golang Intermedio (Concurrencia y POO)</h3>
            </article>
          </div>
        </section>

        <section id="contacto" data-reveal className="section contact" aria-labelledby="contact-title">
          <div className="section-heading">
            <p className="eyebrow">06 / Conversemos</p>
            <h2 id="contact-title">Contacto</h2>
            <p>Hablemos de software y arquitectura.</p>
          </div>
          <address className="contact-details">
            <dl className="contact-list">
              {contacts.map(({ label, text, href }) => (
                <div className="contact-row" key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <a href={href}>
                      <span className="contact-value">{text}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </address>
        </section>
      </main>

      <footer className="site-footer shell">
        <div className="footer-signature">
          <p className="eyebrow">Portafolio profesional</p>
          <p>Nicolás Andrés Muñoz Coronado</p>
        </div>
        <a href="#inicio">Volver al inicio <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  )
}
