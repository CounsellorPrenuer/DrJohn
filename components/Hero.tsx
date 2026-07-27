import React from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

interface HeroProps {
  section?: {
    title?: string
    richTitle?: any
    richSubtitle?: any
    ctaText?: string
    ctaLink?: string
    heroImage?: any
    heroBackgroundImage?: any
    backgroundColor?: string
    headingColor?: string
    textColor?: string
    buttonColor?: string
    buttonTextColor?: string
  }
}

const RedDecorator = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#DC2626' }}>{children}</span>
)
const BlueDecorator = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#2563EB' }}>{children}</span>
)

const ptComponents: any = {
  block: {
    normal: ({ children, value }: { children: React.ReactNode; value: any }) => {
      const replaceName = (node: any): any => {
        if (typeof node === 'string') {
          const replaced = node
            .replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
            .replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
            .replace(/Dr\s*Colonel\s*JC\s*John/gi, "Professor Dr John Chenetra")
            .replace(/JC\s*John/gi, "Professor Dr John Chenetra")

          let parts: any[] = [replaced]

          if (replaced.includes("AARYA")) {
             parts = replaced.split("AARYA").flatMap((part, i, arr) => 
               i < arr.length - 1 ? [part, <a key={`aarya-${i}`} href="https://arya.mentoria.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold" style={{ color: '#2563EB' }}>AARYA</a>] : [part]
             )
          }

          const urlRegex = /(https?:\/\/[^\s]+)/g;
          parts = parts.flatMap((part, i) => {
             if (typeof part === 'string') {
                 return part.split(urlRegex).map((subPart, j) => {
                     if (subPart.match(urlRegex)) {
                         return <a key={`url-${i}-${j}`} href={subPart} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#2563EB' }}>{subPart}</a>
                     }
                     return subPart;
                 })
             }
             return [part];
          })

          return parts.length === 1 ? parts[0] : parts;
        }
        if (node && node.props && node.props.children) {
          return {
            ...node,
            props: {
              ...node.props,
              children: React.Children.map(node.props.children, replaceName)
            }
          }
        }
        return node
      }

      const text = Array.isArray(value?.children)
        ? value.children.map((c: any) => c?.text || '').join('')
        : ''

      if (/Both parents.*Click here\./i.test(text)) {
        return (
          <p>
            <strong>Both parents </strong>
            must see this video before your child takes the subscription to understand the Methodology. Click here.{' '}
            <a
              href="https://youtu.be/mytJzDawl9M?si=hOYM7bHwtWTF_1o2"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: '#2563EB' }}
            >
              https://youtu.be/mytJzDawl9M?si=hOYM7bHwtWTF_1o2
            </a>
          </p>
        )
      }

      if (/The student.*must study.*understand/i.test(text)) {
        return (
          <div className="space-y-2">
            <p>
              <strong>The student </strong>
              must study{' '}
              <a
                href="/career-compass-ai"
                className="underline"
                style={{ color: '#2563EB' }}
              >
                Colonel&#39;s MENTORIA
              </a>{' '}
              to understand &#39;Lifelong Learning&#39;
            </p>
            <p className="mt-2 text-center">
              <strong>Ai based training need analysis: </strong>
              <a
                href="/career-compass-ai"
                className="underline"
                style={{ color: '#2563EB' }}
              >
                Colonel&#39;s MENTORIA Career Compass
              </a>
            </p>
          </div>
        )
      }

      return <p>{React.Children.map(children, replaceName)}</p>
    },
  },
  marks: {
    red: RedDecorator,
    blue: BlueDecorator,
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="mx-auto mt-4 list-disc space-y-3 pl-6 text-left max-w-3xl">
        {children}
      </ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="mx-auto mt-4 list-decimal space-y-3 pl-6 text-left max-w-3xl">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  },
}

export default function Hero({ section }: HeroProps) {
  // Always render consistent structure to avoid hydration mismatch
  const bgColor = section?.backgroundColor || '#ffffff'
  // Force black color as requested, ignoring Sanity field for now
  const headingColor = '#000000'
  const textColor = '#000000'
  // Use fallback title to ensure consistent rendering
  const title = section?.title || 'Welcome'

  return (
    <section
      id="home"
      className="relative w-full px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      style={{ backgroundColor: bgColor }}
    >
      {section?.heroBackgroundImage?.asset && (
        <div className="absolute inset-0">
          <Image
            src={urlFor(section.heroBackgroundImage).width(1920).height(1080).url()}
            alt={section.heroBackgroundImage?.alt || 'Hero background'}
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
      )}
      <div className="relative z-10 mx-auto max-w-4xl w-full text-center space-y-8">
        <div
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight"
          style={{ color: headingColor }}
        >
          {hasPortableTextContent(section?.richTitle) ? (
            <PortableText value={applyBlueHighlights(section!.richTitle)} components={ptComponents} />
          ) : (
            <h1>{title}</h1>
          )}
        </div>

        {section?.heroImage?.asset && (
          <div className="flex justify-center">
            <Image
              src={urlFor(section.heroImage).width(520).height(360).url()}
              alt={section.heroImage?.alt || title || 'Hero image'}
              width={520}
              height={360}
              className="h-auto w-full max-w-lg rounded-2xl object-cover"
            />
          </div>
        )}

        {hasPortableTextContent(section?.richSubtitle) && (
          <div
            className="mx-auto max-w-6xl pt-6 text-base leading-relaxed sm:text-lg md:text-xl"
            style={{ color: textColor }}
          >
            <PortableText value={applyBlueHighlights(section!.richSubtitle)} components={ptComponents} />
          </div>
        )}
      </div>
    </section>
  )
}

function ensureContrast(color: string | undefined, background: string, fallback: string) {
  const chosen = color?.trim() || fallback
  const bg = parseHexColor(background)
  const fg = parseHexColor(chosen)
  if (!bg || !fg) return chosen

  const ratio = contrastRatio(bg.luminance, fg.luminance)
  if (ratio < 3) {
    return bg.luminance < 0.5 ? '#f9fafb' : '#111827'
  }
  return chosen
}

function parseHexColor(value: string) {
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

function hasPortableTextContent(blocks: any[]) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return false
  return blocks.some(block => {
    if (block._type !== 'block' || !block.children) return true
    return block.children.some((child: any) => child.text && child.text.trim() !== '')
  })
}

function applyBlueHighlights(blocks: any[]) {
  if (!Array.isArray(blocks)) return blocks

  return blocks.map((block: any) => {
    if (!block || block._type !== 'block' || !Array.isArray(block.children)) return block

    const newChildren: any[] = []
    for (const child of block.children) {
      if (!child || child._type !== 'span' || typeof child.text !== 'string' || child.text.length === 0) {
        newChildren.push(child)
        continue
      }
      newChildren.push(...splitAndMarkBlue(child))
    }

    return { ...block, children: newChildren }
  })
}

function splitAndMarkBlue(span: any) {
  const text = span.text as string
  const segments: any[] = []
  const phraseRegex = /MENTORIA\.COM\s*\(in Career Guidance\)/gi
  let cursor = 0
  let segmentIndex = 0
  let match: RegExpExecArray | null

  while ((match = phraseRegex.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length

    if (start > cursor) {
      segments.push(createSpanSegment(span, text.slice(cursor, start), false, `${segmentIndex++}`))
    }
    segments.push(createSpanSegment(span, text.slice(start, end), true, `${segmentIndex++}`))
    cursor = end
  }

  if (cursor < text.length) {
    const tail = text.slice(cursor)
    segments.push(...highlightMentoriaWord(span, tail, segmentIndex))
  } else if (segments.length === 0) {
    segments.push(createSpanSegment(span, text, false, '0'))
  }

  return segments.filter((s) => s.text.length > 0)
}

function highlightMentoriaWord(span: any, text: string, baseIndex: number) {
  const out: any[] = []
  const wordRegex = /\bMENTORIA\b/gi
  let cursor = 0
  let segmentIndex = baseIndex
  let match: RegExpExecArray | null

  while ((match = wordRegex.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length

    if (start > cursor) out.push(createSpanSegment(span, text.slice(cursor, start), false, `${segmentIndex++}`))
    out.push(createSpanSegment(span, text.slice(start, end), true, `${segmentIndex++}`))
    cursor = end
  }

  if (cursor < text.length) out.push(createSpanSegment(span, text.slice(cursor), false, `${segmentIndex++}`))
  if (out.length === 0) out.push(createSpanSegment(span, text, false, `${segmentIndex++}`))
  return out
}

function createSpanSegment(originalSpan: any, text: string, makeBlue: boolean, suffix: string) {
  const originalMarks = Array.isArray(originalSpan.marks) ? originalSpan.marks : []
  const marks = makeBlue && !originalMarks.includes('blue') ? [...originalMarks, 'blue'] : originalMarks

  return {
    ...originalSpan,
    _key: `${originalSpan._key || 's'}-${suffix}`,
    text,
    marks,
  }
}
