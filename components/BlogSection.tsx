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

              {article.content && article.content.length > 0 && (
                <div className="mt-6">
                  <PortableText
                    value={article.content}
                    components={{
                      block: {
                        normal: ({ children }) => (
                          <p style={{ color: cardTextColor }} className="mb-4 text-lg leading-relaxed break-words">
                            {children}
                          </p>
                        ),
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
                        bullet: ({ children }) => (
                          <li style={{ color: cardTextColor }} className="text-lg leading-relaxed break-words">
                            {children}
                          </li>
                        ),
                        number: ({ children }) => (
                          <li style={{ color: cardTextColor }} className="text-lg leading-relaxed break-words">
                            {children}
                          </li>
                        ),
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
                          const src = value?.asset ? urlFor(value).width(1800).auto('format').url() : ''
                          if (!src) return null
                          const alt = value?.alt || 'Document image'
                          return (
                            <figure className="my-8">
                              <img src={src} alt={alt} className="w-full rounded-lg border border-gray-200" loading="lazy" />
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
  const safeTitle = article.title || 'Untitled Article'
  const safeExcerpt = article.excerpt || ''
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
          {article.author && <span>By {article.author}</span>}
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
