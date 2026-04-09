import { PortableText } from '@portabletext/react'
import { portableTextComponents } from './portableTextComponents'

interface FullWebsiteDocumentProps {
  document?: {
    title?: string
    content?: any[]
  } | null
}

export default function FullWebsiteDocument({ document }: FullWebsiteDocumentProps) {
  if (!document?.content || document.content.length === 0) return null

  return (
    <section id="full-document" className="w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {document.title ? (
          <h2 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">{document.title}</h2>
        ) : null}
        <div className="prose max-w-none text-gray-900">
          <PortableText value={document.content} components={portableTextComponents} />
        </div>
      </div>
    </section>
  )
}
