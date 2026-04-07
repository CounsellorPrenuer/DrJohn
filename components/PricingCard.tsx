import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

type PricingCardProps = {
  plan: {
    _id: string
    category?: string
    planName: string
    price: string
    shortDescription?: string
    planIcon?: any
    benefits?: string[]
    ctaText?: string
    ctaLink?: string
    isHighlighted?: boolean
    recommendedBadgeIcon?: any
    backgroundColor?: string
    headingColor?: string
    textColor?: string
  }
  sectionHeadingColor?: string
  sectionTextColor?: string
}

export default function PricingCard({ plan, sectionHeadingColor, sectionTextColor }: PricingCardProps) {
  const cardBg = '#f3f4f6'
  const headingColor = plan.headingColor?.trim() || sectionHeadingColor || '#111827'
  const textColor = plan.textColor?.trim() || sectionTextColor || '#374151'
  const showCta = true
  const finalCtaLink = plan.ctaLink?.trim() || '#contact'
  const buttonText = plan.ctaText?.trim() || 'Get Started'
  const ringClasses = ''

  return (
    <article
      style={{ backgroundColor: cardBg }}
      className={`relative flex h-full flex-col rounded-3xl border border-gray-200 p-8 shadow-sm ${ringClasses}`}
    >
      {plan.isHighlighted && (
        <div
          style={{ backgroundColor: headingColor, color: cardBg }}
          className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-6 py-1 text-sm font-semibold"
        >
          {plan.recommendedBadgeIcon && (
            <Image
              src={plan.recommendedBadgeIcon?.asset ? urlFor(plan.recommendedBadgeIcon).width(20).height(20).url() : ''}
              alt={plan.recommendedBadgeIcon?.alt || 'Recommended'}
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
          )}
          Recommended
        </div>
      )}

      {plan.planIcon && (
        <div className="mb-4">
          <Image
            src={urlFor(plan.planIcon).width(64).height(64).url()}
            alt={plan.planIcon?.alt || plan.planName}
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
        </div>
      )}

      {plan.category && (
        <p style={{ color: textColor }} className="mb-4 text-3 font-semibold uppercase tracking-wide opacity-90">
          {plan.category}
        </p>
      )}

      <h3 style={{ color: headingColor }} className="mb-2 text-5xl font-bold">
        {plan.planName}
      </h3>

      <p style={{ color: headingColor }} className="mb-5 text-6xl font-extrabold leading-none">
        {plan.price}
      </p>

      {plan.shortDescription && (
        <p style={{ color: textColor }} className="mb-5 text-base leading-relaxed">
          {plan.shortDescription}
        </p>
      )}

      {plan.benefits && plan.benefits.length > 0 && (
        <ul className="mb-8 space-y-4">
          {plan.benefits.map((benefit: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#d1fae5', color: '#047857' }}
              >
                ✓
              </span>
              <span style={{ color: textColor }} className="text-lg leading-relaxed">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showCta && (
        <a
          href={finalCtaLink}
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }}
          className="mt-auto block w-full rounded-xl py-3 text-center text-base font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
        >
          {buttonText}
        </a>
      )}
    </article>
  )
}
