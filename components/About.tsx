import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

type AboutSectionProps = {
  section?: {
    heading?: string
    mission?: string
    mentorName?: string
    mentorDescription?: string
    profileImage?: any
    mentorImage?: any
    quoteIcon?: any
    highlightQuote?: string
    quoteText?: string
    quoteAccentColor?: string
    quoteTextColor?: string
    secondaryDescription?: string
    ctaText?: string
    ctaLink?: string
    backgroundColor?: string
    cardBackgroundColor?: string
    headingColor?: string
    textColor?: string
    credentials?: string[]
  } | null
}

export default function AboutSection({ section }: AboutSectionProps) {
  if (!section) return null

  const heading = section.heading
  const mission = section.mission
  const rawMentorName = section.mentorName || ''
  const mentorName = rawMentorName.replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra").replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra").replace(/JC\s*John/gi, "Professor Dr John Chenetra") || "Professor Dr John Chenetra"
  
  const rawMentorDescription = section.mentorDescription || ''
  const mentorDescription = rawMentorDescription
    .replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Dr\s*Colonel\s*JC\s*John/gi, "Professor Dr John Chenetra")
    .replace(/JC\s*John/gi, "Professor Dr John Chenetra")

  const mentorImage = section.mentorImage || section.profileImage
  const rawQuoteText = section.quoteText || section.highlightQuote || ''
  const quoteText = rawQuoteText
    .replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Dr\s*Colonel\s*JC\s*John/gi, "Professor Dr John Chenetra")
    .replace(/JC\s*John/gi, "Professor Dr John Chenetra")

  const rawSecondaryDescription = section.secondaryDescription || ''
  const secondaryDescription = rawSecondaryDescription
    .replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
    .replace(/Dr\s*Colonel\s*JC\s*John/gi, "Professor Dr John Chenetra")
    .replace(/JC\s*John/gi, "Professor Dr John Chenetra")

  const showCta = Boolean(section.ctaText && section.ctaLink)
  const credentials = section.credentials
  const sectionBackground = resolveColor(section.backgroundColor, '#f5f5f5')
  const cardBackground = resolveColor(section.cardBackgroundColor, '#ffffff')
  const headingColor = resolveColor(section.headingColor, '#111827')
  const textColor = resolveColor(section.textColor, '#374151')
  const quoteAccentColor = resolveColor(section.quoteAccentColor, headingColor || '#111827')
  const quoteTextColor = resolveColor(section.quoteTextColor, textColor || '#374151')
  const iconBackground = toRgba(headingColor || '#111827', 0.12)

  return (
    <section id="about" style={{ backgroundColor: sectionBackground }} className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Content Card */}
          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: cardBackground }}>
            {heading && (
              <h1 style={{ color: headingColor }} className="mb-4 text-4xl font-bold">
                {heading}
              </h1>
            )}
            {mission && (
              <p style={{ color: textColor }} className="mb-6 text-base leading-relaxed">
                {mission}
              </p>
            )}
            {mentorDescription && (
              <p style={{ color: textColor }} className="mb-6 text-base leading-relaxed">
                {mentorDescription}
              </p>
            )}
            {quoteText && (
              <blockquote
                style={{ color: quoteTextColor, borderLeftColor: quoteAccentColor }}
                className="mb-6 border-l-4 pl-4 text-lg italic font-medium"
              >
                <div className="flex items-start gap-3">
                  {section.quoteIcon && (
                    <Image
                      src={section.quoteIcon?.asset ? urlFor(section.quoteIcon).width(40).height(40).url() : ''}
                      alt={section.quoteIcon?.alt || 'Quote icon'}
                      width={40}
                      height={40}
                      className="mt-1 h-10 w-10 object-contain"
                    />
                  )}
                  <span>"{quoteText}"</span>
                </div>
              </blockquote>
            )}
            {secondaryDescription && (
              <p style={{ color: textColor }} className="mb-6 text-base leading-relaxed">
                {secondaryDescription}
              </p>
            )}
            {credentials && credentials.length > 0 && (
              <div className="mb-6">
                <h2 style={{ color: headingColor }} className="mb-4 text-xl font-semibold">
                  Credentials & Expertise
                </h2>
                <div className="flex flex-col gap-3">
                  {credentials.map((credential, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: iconBackground, color: headingColor }}
                      >
                        {getIcon(index)}
                      </div>
                      <p style={{ color: textColor }} className="flex-1 pt-2 text-base">
                        {credential}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showCta && (
              <div className="mt-8">
                <a
                  href={section.ctaLink}
                  style={{ color: headingColor, borderColor: headingColor }}
                  className="inline-flex items-center justify-center rounded-lg border-2 px-8 py-3 text-base font-semibold transition-opacity hover:opacity-80"
                >
                  {section.ctaText}
                </a>
              </div>
            )}
          </div>

          {/* Right Image Card */}
          {mentorImage && (
            <div className="flex items-center justify-center">
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={urlFor(mentorImage).width(600).height(700).url()}
                  alt={mentorImage?.alt || mentorName || 'Mentor profile'}
                  width={600}
                  height={700}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function resolveColor(color?: string, fallback?: string) {
  const trimmed = color?.trim()
  if (trimmed) return trimmed
  return fallback
}

function toRgba(hexColor: string, alpha: number) {
  const normalized = hexColor.replace('#', '')
  const isShort = normalized.length === 3
  const r = parseInt(isShort ? normalized[0] + normalized[0] : normalized.slice(0, 2), 16)
  const g = parseInt(isShort ? normalized[1] + normalized[1] : normalized.slice(2, 4), 16)
  const b = parseInt(isShort ? normalized[2] + normalized[2] : normalized.slice(4, 6), 16)
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(0, 0, 0, ${alpha})`
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Helper function to get simple icon SVGs
function getIcon(index: number) {
  const icons = [
    <svg key={0} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>,
    <svg key={1} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>,
    <svg key={2} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>,
    <svg key={3} className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ]
  return icons[index % icons.length]
}
