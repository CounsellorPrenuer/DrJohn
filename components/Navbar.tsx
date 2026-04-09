'use client'

import { useState, useEffect } from 'react'

type NavigationItem = {
  label?: string
  sectionId?: string
  order?: number
  isVisible?: boolean
}

type NavigationData = {
  logo?: any
  brandName?: string
  menuItems?: NavigationItem[]
  ctaButton?: {
    text?: string
    link?: string
  }
  backgroundColor?: string
  textColor?: string
  activeLinkColor?: string
}

export default function Navbar({ navigation: initialNavigation }: { navigation?: NavigationData | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navigation, setNavigation] = useState<NavigationData | null | undefined>(initialNavigation)

  useEffect(() => {
    setNavigation(initialNavigation)
  }, [initialNavigation])

  const navLinks = (navigation?.menuItems || [])
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      href: item.sectionId ? `#${item.sectionId}` : '#',
      label: item.label || ''
    }))

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    const targetId = href.replace('#', '')
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
      return
    }

    window.location.href = `/${href}`
  }

  const navBg = '#ffffff'
  const navText = '#e60000'
  const logoUrl = `${process.env.NODE_ENV === 'production' ? '/Dr-John' : ''}/oversimplify-logo.png`

  return (
    <nav
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: navBg, color: navText }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fixed height navbar container */}
        <div className="flex items-center justify-between h-16 sm:h-16 md:h-16">
          {/* Reserved logo area */}
          <a
            href="#home"
            onClick={(e) => handleAnchorClick(e, '#home')}
            className="hidden md:flex items-center justify-start w-44 h-12 flex-shrink-0"
            aria-label="Go to home"
          >
            <img
              src={logoUrl}
              alt={navigation?.logo?.alt || navigation?.brandName || 'Logo'}
              className="h-10 w-auto object-contain"
            />
          </a>

          <a
            href="#home"
            onClick={(e) => handleAnchorClick(e, '#home')}
            className="md:hidden flex items-center justify-start w-28 h-12 flex-shrink-0"
            aria-label="Go to home"
          >
            <img
              src={logoUrl}
              alt={navigation?.logo?.alt || navigation?.brandName || 'Logo'}
              className="h-9 w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-4 font-semibold underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                style={{ color: 'inherit' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:opacity-80 transition-opacity flex-shrink-0 ml-auto"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderTopColor: `${navText}20` }}
        >
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="block px-3 py-2 text-base font-semibold underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: 'inherit' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
