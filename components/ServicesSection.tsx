'use client'

import Image from 'next/image'
import { urlFor } from '@/lib/sanity'

interface Service {
  _id: string
  title: string
  description: string
  targetAudience?: string
  icon?: any
}

interface PackagePlan {
  _id: string
  category?: string
  planName?: string
  price?: string
  shortDescription?: string
  benefits?: string[]
  ctaText?: string
  ctaLink?: string
}

interface ServicesSectionProps {
  section?: {
    title?: string
    subtitle?: string
    backgroundColor?: string
    headingColor?: string
    textColor?: string
  }
  services?: Service[]
  packages?: PackagePlan[]
}

export default function ServicesSection({ section, services, packages }: ServicesSectionProps) {
  if (!section) return null

  const bgColor = section.backgroundColor || '#ffffff'
  const headingColor = section.headingColor || '#1f2937'
  const textColor = section.textColor || '#4b5563'
  const filteredServices = (services || []).filter((service) => {
    const title = (service.title || '').toLowerCase()
    const description = (service.description || '').toLowerCase()
    return !title.includes('mobile +91') && !description.includes('mobile +91')
  })

  if (packages && packages.length > 0) {
    return (
      <section
        id="services"
        className="w-full px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8"
        style={{ backgroundColor: bgColor }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-left">
            {section.title && (
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl" style={{ color: headingColor }}>
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p className="text-lg leading-relaxed sm:text-xl" style={{ color: textColor }}>
                {section.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {packages.map((plan) => (
              <article
                key={plan._id}
                className="flex h-full flex-col rounded-3xl border border-gray-200 bg-gray-100 p-8 shadow-sm"
              >
                <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                  {plan.category || 'TRAINING PROGRAM'}
                </p>

                {plan.planName && <h3 className="mb-2 text-5xl font-bold text-slate-900">{plan.planName}</h3>}
                {plan.price && <p className="mb-5 text-6xl font-extrabold leading-none text-slate-900">{plan.price}</p>}

                {plan.shortDescription && (
                  <p className="mb-5 text-lg leading-relaxed" style={{ color: textColor }}>
                    {plan.shortDescription}
                  </p>
                )}

                {plan.benefits && plan.benefits.length > 0 && (
                  <ul className="mb-8 space-y-4">
                    {plan.benefits.map((point, idx) => (
                      <li key={`${plan._id}-benefit-${idx}`} className="flex items-start gap-3">
                        <span
                          className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: '#d1fae5', color: '#047857' }}
                        >
                          &#10003;
                        </span>
                        <span className="text-xl leading-relaxed" style={{ color: textColor }}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={plan.ctaLink || '#contact'}
                  style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                  className="mt-auto inline-block w-full rounded-xl px-5 py-3 text-center text-xl font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
                >
                  GET STARTED
                </a>
              </article>
            ))}
          </div>

          {filteredServices.length > 0 && (
            <div className="mt-14">
              <h3 className="mb-6 text-3xl font-bold" style={{ color: headingColor }}>
                Additional Services
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredServices.map((service) => (
                  <article key={service._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    {service.icon && (
                      <div className="mb-3">
                        <Image
                          src={service.icon?.asset ? urlFor(service.icon).width(64).height(64).url() : ''}
                          alt={service.icon?.alt || service.title}
                          width={64}
                          height={64}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                    )}
                    <h4 className="mb-2 text-2xl font-bold" style={{ color: headingColor }}>
                      {service.title}
                    </h4>
                    {service.targetAudience && (
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
                        {service.targetAudience}
                      </p>
                    )}
                    <p className="text-lg leading-relaxed" style={{ color: textColor }}>
                      {service.description}
                    </p>
                    <div className="mt-5">
                      <a
                        href="#contact"
                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                        className="inline-block rounded-lg px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                      >
                        GET STARTED
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  const belongsTo = (service: Service, keyword: string) =>
    service.targetAudience?.toLowerCase().includes(keyword.toLowerCase())

  const schoolServices = filteredServices.filter((s) => belongsTo(s, 'school'))
  const collegeServices = filteredServices.filter((s) => belongsTo(s, 'college'))
  const corporateServices = filteredServices.filter((s) => belongsTo(s, 'corporate'))
  const otherServices =
    filteredServices.filter((s) => !belongsTo(s, 'school') && !belongsTo(s, 'college') && !belongsTo(s, 'corporate'))

  const renderServiceGrid = (items: Service[]) => (
    <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 last:mb-0">
      {items.map((service) => (
        <div
          key={service._id}
          className="rounded-lg border border-opacity-20 p-6 transition-all hover:bg-black/5"
          style={{
            borderColor: 'color-mix(in srgb, var(--text-color), transparent 85%)',
            backgroundColor: 'color-mix(in srgb, var(--text-color), transparent 97%)',
          }}
        >
          {service.icon && (
            <div className="mb-4">
              <Image
                src={service.icon?.asset ? urlFor(service.icon).width(64).height(64).url() : ''}
                alt={service.icon?.alt || service.title}
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            </div>
          )}
          <h4 className="mb-3 h-auto text-xl font-semibold sm:text-2xl" style={{ color: headingColor }}>
            {service.title}
          </h4>
          <p className="mb-4 text-base leading-relaxed sm:text-lg" style={{ color: textColor }}>
            {service.description}
          </p>
          <a
            href="#contact"
            className="inline-block rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ backgroundColor: headingColor, color: '#ffffff' }}
          >
            GET STARTED
          </a>
        </div>
      ))}
    </div>
  )

  const renderSubsection = (title: string, items: Service[]) => {
    if (items.length === 0) return null
    return (
      <div className="mb-12 last:mb-0">
        <h3 className="mb-8 text-center text-2xl font-bold sm:text-3xl" style={{ color: headingColor }}>
          {title}
        </h3>
        {renderServiceGrid(items)}
      </div>
    )
  }

  return (
    <section
      id="services"
      className="w-full px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          {section.title && (
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl" style={{ color: headingColor }}>
              {section.title}
            </h2>
          )}

          {section.subtitle && (
            <p className="text-lg leading-relaxed sm:text-xl" style={{ color: textColor }}>
              {section.subtitle}
            </p>
          )}

          <div className="mt-6">
            <a
              href="#contact"
              className="inline-block rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{ backgroundColor: headingColor, color: '#ffffff' }}
            >
              GET STARTED
            </a>
          </div>
        </div>

        {renderSubsection('For Schools', schoolServices)}
        {renderSubsection('For Colleges', collegeServices)}
        {renderSubsection('For Corporates', corporateServices)}
        {renderSubsection('Other Services', otherServices)}

        {filteredServices.length === 0 && <p className="text-center text-gray-500">No services available.</p>}
      </div>
    </section>
  )
}
