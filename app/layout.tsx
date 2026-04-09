import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { fetchSanityData } from '@/lib/sanity'
import { NAVIGATION_QUERY, SITE_SETTINGS_QUERY } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'MENTORIA - Career Guidance',
  description: 'Career guidance platform',
  icons: {
    icon: '/favicon.ico',
  },
}



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    let settings: any = {}
    let navigation: any = null

    const fs = await import('node:fs')
    fs.appendFileSync('debug.log', 'RootLayout: Start\n')

    try {
      fs.appendFileSync('debug.log', 'RootLayout: Fetching settings\n')
      settings = await fetchSanityData(SITE_SETTINGS_QUERY)
      fs.appendFileSync('debug.log', 'RootLayout: Fetched settings\n')

      navigation = await fetchSanityData(NAVIGATION_QUERY)
      fs.appendFileSync('debug.log', 'RootLayout: Fetched navigation\n')
    } catch (fetchError: any) {
      console.error('Data fetch error:', fetchError)
      fs.appendFileSync('debug.log', `RootLayout: Fetch Error: ${fetchError.message}\n`)
    }

    const primaryColor = settings?.primaryColor || '#1a202c'
    const secondaryColor = settings?.secondaryColor || '#2d3748'
    const backgroundColor = settings?.backgroundColor || '#ffffff'
    const textColor = ensureReadableColor(settings?.textColor, backgroundColor)
    const navbarTextColor = ensureReadableColor(settings?.textColor, primaryColor)

    fs.appendFileSync('debug.log', 'RootLayout: Prepared styles\n')

    const style = {
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      '--background-color': backgroundColor,
      '--text-color': textColor,
      '--navbar-text-color': navbarTextColor,
      backgroundColor: backgroundColor,
      color: textColor,
    } as React.CSSProperties

    return (
      <html lang="en">
        <body style={style}>
          <Navbar navigation={navigation} />
          {children}
        </body>
      </html>
    )
  } catch (renderError: any) {
    console.error('RootLayout Render Error:', renderError)
    try {
      const fs = await import('node:fs')
      fs.writeFileSync('layout-render-error.log', `Error: ${renderError.message}\nStack: ${renderError.stack}`)
    } catch (e) { }

    return (
      <html lang="en">
        <body>
          <div style={{ padding: 20 }}>
            <h1>Something went wrong</h1>
            <pre>{renderError.message}</pre>
          </div>
        </body>
      </html>
    )
  }
}

function ensureReadableColor(color: string | undefined, background: string) {
  const fallback = '#1f2937'
  const bg = parseHexColor(background)
  const fg = parseHexColor(color)

  if (!bg) return color || fallback
  if (!fg) return bg.luminance < 0.5 ? '#f9fafb' : '#111827'

  const ratio = contrastRatio(bg.luminance, fg.luminance)
  if (ratio < 3) {
    return bg.luminance < 0.5 ? '#f9fafb' : '#111827'
  }
  return color || fallback
}

function parseHexColor(value?: string) {
  if (!value) return null
  const hex = value.trim().replace('#', '')
  if (hex.length !== 3 && hex.length !== 6) return null
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16)
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16)
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16)
  if ([r, g, b].some((v) => Number.isNaN(v))) return null
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return { r, g, b, luminance }
}

function contrastRatio(bgLuminance: number, fgLuminance: number) {
  const lighter = Math.max(bgLuminance, fgLuminance) + 0.05
  const darker = Math.min(bgLuminance, fgLuminance) + 0.05
  return lighter / darker
}
