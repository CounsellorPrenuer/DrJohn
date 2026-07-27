"use client"
import React from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

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
  <span className="text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md inline-block mx-1 shadow-[0_0_15px_rgba(244,63,94,0.3)]">{children}</span>
)
const BlueDecorator = ({ children }: { children: React.ReactNode }) => (
  <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md inline-block mx-1 shadow-[0_0_15px_rgba(96,165,250,0.3)]">{children}</span>
)

const ptComponents: any = {
  block: {
    normal: ({ children, value }: { children: React.ReactNode; value: any }) => {
      const replaceName = (node: any): any => {
        if (typeof node === 'string') {
          let replaced = node
            .replace(/Dr\.?\s*Colonel\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
            .replace(/Colonel\s*Dr\s*J\.?C\.?\s*John/gi, "Professor Dr John Chenetra")
            .replace(/Dr\s*Colonel\s*JC\s*John/gi, "Professor Dr John Chenetra")
            .replace(/JC\s*John/gi, "Professor Dr John Chenetra")
            
          // Fix typos in Sanity source data
          replaced = replaced.replace(/cometogether to useour/gi, "come together to use our")
          replaced = replaced.replace(/& OVERSIMPLIFY\.IN\(in/gi, "& OVERSIMPLIFY.IN (in")

          if (replaced.includes("AARYA")) {
            const parts = replaced.split("AARYA");
            return (
              <>
                {parts[0]}
                <a
                  href="https://arya.mentoria.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 group border-b border-blue-400/30 hover:border-blue-400"
                >
                  AARYA
                  <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </a>
                {parts[1]}
              </>
            );
          }
          return replaced;
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
          <p className="my-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-gray-300">
            <strong className="text-white">Both parents </strong>
            must see this video before your child takes the subscription to understand the Methodology. Click here.{' '}
            <a
              href="https://youtu.be/mytJzDawl9M?si=hOYM7bHwtWTF_1o2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-400 transition-all"
            >
              Watch Video
            </a>
          </p>
        )
      }

      if (/The student.*must study.*understand/i.test(text)) {
        return (
          <div className="space-y-4 my-8 p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 backdrop-blur-md shadow-2xl">
            <p className="text-gray-300 text-lg">
              <strong className="text-white">The student </strong>
              must study{' '}
              <a
                href="/career-compass-ai"
                className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-400 transition-all"
              >
                Colonel&#39;s MENTORIA
              </a>{' '}
              to understand &#39;Lifelong Learning&#39;
            </p>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />
            <p className="text-center text-lg">
              <strong className="text-gray-300 block mb-2 text-sm uppercase tracking-widest font-semibold">AI based training need analysis </strong>
              <a
                href="/career-compass-ai"
                className="inline-flex items-center gap-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all text-xl"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                Colonel&#39;s MENTORIA Career Compass
              </a>
            </p>
          </div>
        )
      }

      return <p className="mb-6 leading-relaxed text-gray-300 text-lg md:text-xl font-light tracking-wide">{React.Children.map(children, replaceName)}</p>
    },
  },
  marks: {
    red: RedDecorator,
    blue: BlueDecorator,
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul className="mx-auto mt-6 mb-8 list-none space-y-4 text-left max-w-3xl text-gray-300 text-lg md:text-xl font-light">
        {children}
      </ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol className="mx-auto mt-6 mb-8 list-decimal space-y-4 pl-6 text-left max-w-3xl text-gray-300 text-lg md:text-xl font-light marker:text-blue-400">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li className="flex items-start gap-3">
        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
        <span>{children}</span>
      </li>
    ),
    number: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  },
}

export default function Hero({ section }: HeroProps) {
  const title = section?.title || 'Welcome'

  return (
    <section
      id="home"
      className="relative w-full min-h-[90vh] flex items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 overflow-hidden bg-[#0A0A0A]"
    >
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0A0A0A] to-black" />
        
        {/* Animated glowing orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 -left-20 w-72 h-72 bg-rose-600/20 rounded-full blur-[80px]" 
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Hero Image Background (if provided) */}
        {section?.heroBackgroundImage?.asset && (
          <div className="absolute inset-0 mix-blend-overlay opacity-30">
            <Image
              src={urlFor(section.heroBackgroundImage).width(1920).height(1080).url()}
              alt={section.heroBackgroundImage?.alt || 'Hero background'}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient mask to fade out image at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/50 to-[#0A0A0A]" />
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl w-full text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            {hasPortableTextContent(section?.richTitle) ? (
              <PortableText value={applyBlueHighlights(section!.richTitle)} components={ptComponents} />
            ) : (
              <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{title}</h1>
            )}
          </div>
        </motion.div>

        {section?.heroImage?.asset && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative group p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-rose-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
              <Image
                src={urlFor(section.heroImage).width(720).height(480).url()}
                alt={section.heroImage?.alt || title || 'Hero image'}
                width={720}
                height={480}
                className="h-auto w-full max-w-2xl rounded-[22px] object-cover relative z-10"
              />
            </div>
          </motion.div>
        )}

        {hasPortableTextContent(section?.richSubtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-4xl"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-2xl shadow-2xl">
              <PortableText value={applyBlueHighlights(section!.richSubtitle)} components={ptComponents} />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
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


