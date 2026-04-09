'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity'

type BlogPost = {
  _id: string
  title?: string
  slug?: { current: string }
  excerpt?: string
  author?: string
  publishDate?: string
  thumbnail?: any
  content?: any[]
}

type BlogSectionProps = {
  section?: {
    sectionTitle?: string
    sectionSubtitle?: string
    backgroundColor?: string
    headingColor?: string
    textColor?: string
    cardBackgroundColor?: string
    cardHeadingColor?: string
    cardTextColor?: string
    articles?: BlogPost[]
  } | null
}

export default function BlogSection({ section }: BlogSectionProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!section || !section.articles || section.articles.length === 0) return null

  const bgColor = section.backgroundColor || '#ffffff'
  const headingColor = section.headingColor || '#111827'
  const textColor = section.textColor || '#374151'
  const cardBgColor = section.cardBackgroundColor || '#ffffff'
  const cardHeadingColor = section.cardHeadingColor || '#111827'
  const cardTextColor = section.cardTextColor || '#374151'

  return (
    <section id="blogs" className="px-6 py-16" style={{ backgroundColor: bgColor }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          {section.sectionTitle && (
            <h2 style={{ color: headingColor }} className="mb-4 text-4xl font-bold md:text-5xl">
              {section.sectionTitle}
            </h2>
          )}
          {section.sectionSubtitle && (
            <p style={{ color: textColor }} className="mx-auto max-w-3xl text-lg leading-relaxed">
              {section.sectionSubtitle}
            </p>
          )}
        </div>

        <div className="space-y-10">
          {section.articles.map((article) => (
            <article
              key={`${article._id}-full`}
              className="rounded-2xl border border-gray-200 p-6 shadow-sm sm:p-8"
              style={{ backgroundColor: cardBgColor }}
            >
              <BlogHeader article={article} cardHeadingColor={cardHeadingColor} cardTextColor={cardTextColor} />

              {isMounted && article.content && article.content.length > 0 && (
                <div className="mt-6">
                  <PortableText
                    value={prepareContent(article.content)}
                    components={{
                      block: {
                        normal: ({ children, value }) => {
                          const text = plainTextFromBlock(value)
                          const inlineBullets = splitInlineBullets(text)
                          if (inlineBullets.length > 1) {
                            return (
                              <ul className="mb-4 ml-7 list-disc space-y-2">
                                {inlineBullets.map((item, idx) => (
                                  <li key={idx} style={{ color: cardTextColor }} className="text-lg leading-relaxed break-words">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )
                          }

                          const headingLike = isWeekHeading(text) || isHeadingLike(text)
                          return (
                            <p
                              style={{ color: cardTextColor }}
                              className={`mb-4 ${headingLike ? 'text-2xl font-bold' : 'text-lg'} leading-relaxed break-words`}
                            >
                              {children}
                            </p>
                          )
                        },
                        h2: ({ children }) => (
                          <h2 style={{ color: cardHeadingColor }} className="mb-4 mt-10 text-3xl font-bold">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{ color: cardHeadingColor }} className="mb-3 mt-8 text-2xl font-bold">
                            {children}
                          </h3>
                        ),
                      },
                      list: {
                        bullet: ({ children }) => <ul className="mb-4 ml-7 list-disc space-y-2">{children}</ul>,
                        number: ({ children }) => <ol className="mb-4 ml-7 list-decimal space-y-2">{children}</ol>,
                      },
                      listItem: {
                        bullet: ({ children, value }) => renderSplitListItem(children, value, cardTextColor),
                        number: ({ children, value }) => renderSplitListItem(children, value, cardTextColor),
                      },
                      marks: {
                        red: ({ children }) => <span style={{ color: '#dc2626' }}>{children}</span>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        link: ({ children, value }) => (
                          <a
                            href={value?.href}
                            style={{ color: cardHeadingColor }}
                            className="underline underline-offset-2 break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      },
                      types: {
                        image: ({ value }) => {
                          const src = value?.asset ? urlFor(value).width(1600).url() : ''
                          if (!src) return null
                          const alt = normalizeText(value?.alt || 'Document image')
                          return (
                            <figure className="my-8">
                              <img src={src} alt={alt} className="w-full rounded-lg border border-gray-200" />
                            </figure>
                          )
                        },
                      },
                    }}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function BlogHeader({
  article,
  cardHeadingColor,
  cardTextColor,
}: {
  article: BlogPost
  cardHeadingColor: string
  cardTextColor: string
}) {
  const thumbnailUrl = article.thumbnail?.asset ? urlFor(article.thumbnail).width(600).height(400).url() : null
  const safeTitle = normalizeText(article.title || 'Untitled Article')
  const safeExcerpt = article.excerpt ? normalizeText(article.excerpt) : ''
  const formattedDate = formatDate(article.publishDate)

  return (
    <header className="mb-3">
      {thumbnailUrl && (
        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={article.thumbnail?.alt || safeTitle || 'Blog post thumbnail'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
            className="object-cover"
          />
        </div>
      )}

      {(formattedDate || article.author) && (
        <div style={{ color: cardTextColor, opacity: 0.75 }} className="mb-3 flex flex-wrap gap-2 text-sm">
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && article.author && <span>•</span>}
          {article.author && <span>By {normalizeText(article.author)}</span>}
        </div>
      )}

      <h3 style={{ color: cardHeadingColor }} className="mb-3 text-2xl font-bold">
        {safeTitle}
      </h3>

      {safeExcerpt && (
        <p style={{ color: cardTextColor }} className="text-base leading-relaxed">
          {safeExcerpt}
        </p>
      )}
    </header>
  )
}

function formatDate(dateString?: string) {
  if (!dateString) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(dateString))
  } catch {
    return null
  }
}

function normalizeText(input: string) {
  const s = input || ''
  return s
    .replace(/\u00a0/g, ' ')
    .replace(/\u00c2/g, '')
    .replace(/â€¢/g, '•')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€˜/g, '‘')
    .replace(/â€™/g, '’')
    .replace(/â€œ/g, '“')
    .replace(/â€/g, '”')
    .replace(/â€\u009d/g, '”')
    .replace(/â†’/g, '→')
    .replace(/â†/g, '†')
    .replace(/âˆ’/g, '−')
    .replace(/â€¦/g, '…')
}

function plainTextFromBlock(block: any) {
  if (!block?.children || !Array.isArray(block.children)) return ''
  return block.children.map((c: any) => normalizeText(c?.text || '')).join('').trim()
}

function splitInlineBullets(text: string) {
  const normalized = normalizeText(text).trim()
  if (!/[•▪·]/.test(normalized)) return [normalized]
  return normalized
    .split(/[•▪·]/)
    .map((x) => x.replace(/^\s*[–-]\s*/, '').trim())
    .filter(Boolean)
}

function renderSplitListItem(children: any, value: any, color: string) {
  const text = plainTextFromBlock(value)
  const parts = splitInlineBullets(text)
  if (parts.length <= 1) {
    return (
      <li style={{ color }} className="text-lg leading-relaxed break-words">
        {children}
      </li>
    )
  }
  return (
    <li style={{ color }} className="list-none">
      <ul className="space-y-2">
        {parts.map((p, i) => (
          <li key={i} className="list-disc text-lg leading-relaxed break-words">
            {p}
          </li>
        ))}
      </ul>
    </li>
  )
}

function isWeekHeading(text: string) {
  return /^week\s*\d+/i.test(text.trim())
}

function isHeadingLike(text: string) {
  const t = text.trim()
  if (!t) return false
  if (/^(step|module|lesson|day|chapter|session)\s+\d+/i.test(t)) return true
  if (/^[A-Z0-9\s&/().,'-]{4,120}$/.test(t)) return true
  if (t.endsWith(':') && t.length <= 140) return true
  return /^(important|types of|how to|examples of|before subscribing|interview process|qualities|services|testimonials|courses|contact|overview|category)/i.test(t)
}

function prepareContent(value: any[]) {
  return normalizePortableBlocks(value)
}

function normalizePortableBlocks(value: any[] | undefined) {
  if (!Array.isArray(value)) return []

  return value
    .map((block) => {
      if (!block) return null
      if (block._type !== 'block') return block

      const cloned: any = {
        ...block,
        children: Array.isArray(block.children)
          ? block.children.map((child: any) => ({ ...child, text: normalizeText(child?.text || '') }))
          : block.children,
        markDefs: Array.isArray(block.markDefs)
          ? block.markDefs.map((def: any) => (def?._type === 'link' ? { ...def, href: normalizeText(def.href || '') } : def))
          : block.markDefs,
      }

      const text = plainTextFromBlock(cloned)
      if (!cloned.listItem && /^\s*([•▪·*-])\s+/.test(text)) {
        cloned.listItem = 'bullet'
        cloned.level = 0
        const first = cloned.children?.[0]
        if (first?.text) first.text = first.text.replace(/^\s*([•▪·*-])\s+/, '')
      }
      if (!cloned.listItem && /^\s*\d+[.)]\s+/.test(text)) {
        cloned.listItem = 'number'
        cloned.level = 0
        const first = cloned.children?.[0]
        if (first?.text) first.text = first.text.replace(/^\s*\d+[.)]\s+/, '')
      }

      return cloned
    })
    .filter((b: any) => {
      if (!b) return false
      if (b._type !== 'block') return true
      const t = plainTextFromBlock(b)
      return !!t
    })
}
