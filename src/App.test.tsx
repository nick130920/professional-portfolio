import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const identity = 'Nicolás Andrés Muñoz Coronado'

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
    for (const label of ['Inicio', 'Perfil', 'Contacto']) {
      const link = within(navigation).getByRole('link', { name: label })
      const target = document.querySelector(link.getAttribute('href')!)
      expect(target).not.toBeNull()
    }
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('presents the supplied professional profile without adding later sections', () => {
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
    expect(screen.queryByRole('heading', { name: /educación|certificaciones|habilidades|trayectoria/i }))
      .not.toBeInTheDocument()
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
