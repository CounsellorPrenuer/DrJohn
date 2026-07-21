'use client'
// Force rerun deployment 2
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navigation, setNavigation] = useState<NavigationData | null | undefined>(initialNavigation)

  useEffect(() => {
    setNavigation(initialNavigation)
  }, [initialNavigation])

  if (pathname === '/tna' || pathname === '/career-compass-ai') return null

  const navLinks = (navigation?.menuItems || [])
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      href: item.sectionId ? `#${item.sectionId}` : '#',
      label: item.label || '',
      isGold: false
    }))





  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/') || href.includes('.html')) {
      setMobileMenuOpen(false)
      if (href.includes('.html')) {
        window.location.href = href
        return
      }
      return
    }
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

  const testLinks = [
    { href: '/career-compass-ai', label: 'Ai based Training Need Analysis' },
    { href: '/ospa', label: 'ARMY NAVY AIR FORCE SELF ASSESSMENT' }
  ]

  const navBg = '#ffffff'
  const navText = '#e60000'
  const logoUrl = '/oversimplify-logo.png'

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
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 flex-shrink-0 ml-2 lg:ml-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-[11px] lg:text-sm font-semibold underline decoration-1 underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                style={{
                  color: 'inherit',
                  fontWeight: 700
                }}
              >
                {link.label}
              </a>
            ))}

            <div className="relative group">
              <button 
                className="text-[11px] lg:text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap flex items-center gap-1 underline decoration-1 underline-offset-2"
                style={{ color: 'inherit', fontWeight: 700 }}
              >
                Tests
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full right-0 pt-2 w-64 hidden group-hover:block">
                <div className="bg-white shadow-lg rounded-md overflow-hidden border" style={{ borderColor: `${navText}20` }}>
                  {testLinks.map((test) => (
                    <a
                      key={test.href}
                      href={test.href}
                      onClick={(e) => handleAnchorClick(e, test.href)}
                      className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: navText, fontWeight: 600 }}
                    >
                      {test.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
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
                style={{
                  color: 'inherit',
                  fontWeight: 700
                }}
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-2 pb-1">
              <div className="px-3 text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Tests</div>
              {testLinks.map((test) => (
                <a
                  key={test.href}
                  href={test.href}
                  onClick={(e) => handleAnchorClick(e, test.href)}
                  className="block px-3 py-2 text-base font-semibold hover:opacity-80 transition-opacity cursor-pointer pl-6 underline decoration-1 underline-offset-2"
                  style={{ color: 'inherit', fontWeight: 600 }}
                >
                  {test.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
