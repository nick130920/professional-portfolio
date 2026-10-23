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

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Saltar al contenido</a>

      <header className="site-header shell">
        <a className="wordmark" href="#inicio" aria-label="Nicolás Muñoz · Inicio">
          nm<span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#perfil">Perfil</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main id="main-content" className="shell" tabIndex={-1}>
        <section id="inicio" className="hero" aria-labelledby="hero-title">
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
          <div className="hero-note" aria-hidden="true">
            <span className="note-rule" />
            <p>Una visión integral.<br />Del código a la arquitectura.</p>
            <span className="note-index">01 / PERFIL</span>
          </div>
        </section>

        <section id="perfil" className="section profile" aria-labelledby="profile-title">
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

        <section id="contacto" className="section contact" aria-labelledby="contact-title">
          <div className="section-heading">
            <p className="eyebrow">02 / Conversemos</p>
            <h2 id="contact-title">Contacto</h2>
            <p>Hablemos de software y arquitectura.</p>
          </div>
          <dl className="contact-list">
            {contacts.map(({ label, text, href }) => (
              <div className="contact-row" key={label}>
                <dt>{label}</dt>
                <dd>
                  <a href={href}>{text}<span aria-hidden="true">↗</span></a>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="site-footer shell">
        <p>Nicolás Andrés Muñoz Coronado</p>
        <a href="#inicio">Volver al inicio <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  )
}
