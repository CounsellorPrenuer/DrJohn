'use client'

import Image from 'next/image'
import { useState } from 'react'
import { urlFor } from '@/lib/sanity'
import { buildMailtoUrl, openMailto } from '@/lib/mail'

type ContactSectionProps = {
  section?: {
    sectionTitle?: string
    sectionSubtitle?: string
    backgroundColor?: string
    headingColor?: string
    textColor?: string
    cardBackgroundColor?: string
    buttonColor?: string
    buttonTextColor?: string
    inputBackgroundColor?: string
    inputTextColor?: string
    inputBorderColor?: string
    email?: string
    phone?: string
    address?: string
    formTitle?: string
    namePlaceholder?: string
    emailPlaceholder?: string
    phonePlaceholder?: string
    purposeOptions?: string[]
    messagePlaceholder?: string
    submitButtonText?: string
    emailIcon?: any
    phoneIcon?: any
    locationIcon?: any
    illustrationImage?: any
  } | null
}

export default function ContactSection({ section }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    message: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const workerBaseUrl = (process.env.NEXT_PUBLIC_CF_WORKER_URL || '').trim()
  const workerConfigured = workerBaseUrl.startsWith('https://')

  const fallbackSection = {
    sectionTitle: 'Contact Us',
    sectionSubtitle: 'We will respond as soon as possible.',
    formTitle: 'Send Us a Message',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',
    phonePlaceholder: 'Your phone number',
    messagePlaceholder: 'How can we help?',
    purposePlaceholder: 'Select a purpose',
    backgroundColor: '#f8fafc',
    headingColor: '#111827',
    textColor: '#374151',
    cardBackgroundColor: '#ffffff',
    buttonColor: '#111827',
    buttonTextColor: '#ffffff',
    inputBackgroundColor: '#ffffff',
    inputTextColor: '#111827',
    inputBorderColor: '#e5e7eb',
    purposeOptions: [],
    submitButtonText: 'Send Message',
    email: 'contact@mentoria.com',
    phone: '+1 (000) 000-0000',
    address: 'Your address here'
  }

  const data = section ?? fallbackSection

  const sectionBg = data.backgroundColor?.trim() || '#f8fafc'
  const headingColor = data.headingColor?.trim() || '#111827'
  const subtitleColor = data.textColor?.trim() || '#374151'
  const cardBg = data.cardBackgroundColor?.trim() || '#ffffff'
  const cardText = data.inputTextColor?.trim() || '#111827'
  const buttonBg = data.buttonColor?.trim() || headingColor
  const buttonText = data.buttonTextColor?.trim() || '#ffffff'
  const inputBg = data.inputBackgroundColor?.trim() || '#ffffff'
  const inputText = data.inputTextColor?.trim() || '#111827'
  const inputBorder = data.inputBorderColor?.trim() || '#e5e7eb'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus(null)

    const nextErrors: { [key: string]: boolean } = {
      name: !formData.name.trim(),
      email: !formData.email.trim(),
      message: !formData.message.trim()
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    try {
      if (workerConfigured) {
        const response = await fetch(`${workerBaseUrl}/lead/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            purpose: formData.purpose.trim(),
            message: formData.message.trim(),
            source: 'website-contact-form'
          })
        })

        const payload = await response.json().catch(() => null)
        if (!response.ok) {
          setSubmitStatus({
            type: 'error',
            message: payload?.message || 'Unable to submit your form right now. Please try again.'
          })
          return
        }
      }

      setSubmitStatus({
        type: 'success',
        message: workerConfigured
          ? 'Thank you. We have received your details and will contact you shortly.'
          : 'Draft email opened. Please press Send to complete your inquiry.'
      })

      const mailUrl = buildMailtoUrl({
        subject: `Website Contact Lead - ${formData.name.trim()}`,
        lines: [
          'A new contact form lead was submitted.',
          '',
          `Name: ${formData.name.trim()}`,
          `Email: ${formData.email.trim()}`,
          `Phone: ${formData.phone.trim() || 'N/A'}`,
          `Purpose: ${formData.purpose.trim() || 'N/A'}`,
          `Message: ${formData.message.trim()}`
        ]
      })
      openMailto(mailUrl)

      setFormData({ name: '', email: '', phone: '', purpose: '', message: '' })
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Network issue while submitting form. Please try again in a moment.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      className="px-6 py-16"
      style={{
        backgroundColor: sectionBg,
        ['--contact-placeholder' as any]: cardText,
        ['--contact-icon' as any]: cardText,
        ['--contact-icon-bg' as any]: inputBg,
        ['--contact-icon-border' as any]: inputBorder
      }}
    >
      <div className="mx-auto max-w-6xl">
        {(data.sectionTitle || data.sectionSubtitle) && (
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold" style={{ color: headingColor }}>
              {data.sectionTitle || fallbackSection.sectionTitle}
            </h2>
            {data.sectionSubtitle && (
              <p className="mx-auto max-w-3xl text-lg" style={{ color: subtitleColor }}>
                {data.sectionSubtitle}
              </p>
            )}
            {!data.sectionSubtitle && (
              <p className="mx-auto max-w-3xl text-lg" style={{ color: subtitleColor }}>
                {fallbackSection.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl p-8 shadow-lg" style={{ backgroundColor: cardBg }}>
            <h3 className="mb-6 text-2xl font-semibold" style={{ color: headingColor }}>
              {data.formTitle || fallbackSection.formTitle}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: headingColor }}>
                  {data.namePlaceholder || fallbackSection.namePlaceholder}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={data.namePlaceholder || fallbackSection.namePlaceholder}
                  aria-invalid={errors.name || undefined}
                  className="w-full rounded-lg border px-4 py-3 outline-none placeholder:text-[var(--contact-placeholder)]"
                  style={{
                    backgroundColor: inputBg,
                    color: inputText,
                    borderColor: errors.name ? headingColor : inputBorder
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: headingColor }}>
                  {data.emailPlaceholder || fallbackSection.emailPlaceholder}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={data.emailPlaceholder || fallbackSection.emailPlaceholder}
                  aria-invalid={errors.email || undefined}
                  className="w-full rounded-lg border px-4 py-3 outline-none placeholder:text-[var(--contact-placeholder)]"
                  style={{
                    backgroundColor: inputBg,
                    color: inputText,
                    borderColor: errors.email ? headingColor : inputBorder
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: headingColor }}>
                  {data.phonePlaceholder || fallbackSection.phonePlaceholder}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={data.phonePlaceholder || fallbackSection.phonePlaceholder}
                  className="w-full rounded-lg border px-4 py-3 outline-none placeholder:text-[var(--contact-placeholder)]"
                  style={{
                    backgroundColor: inputBg,
                    color: inputText,
                    borderColor: inputBorder
                  }}
                />
              </div>

              {data.purposeOptions && data.purposeOptions.length > 0 && (
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-3 outline-none"
                  style={{
                    backgroundColor: inputBg,
                    color: inputText,
                    borderColor: inputBorder
                  }}
                >
                  <option value="" disabled>
                    {fallbackSection.purposePlaceholder}
                  </option>
                  {data.purposeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: headingColor }}>
                  {data.messagePlaceholder || fallbackSection.messagePlaceholder}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={data.messagePlaceholder || fallbackSection.messagePlaceholder}
                  aria-invalid={errors.message || undefined}
                  rows={5}
                  className="w-full rounded-lg border px-4 py-3 outline-none placeholder:text-[var(--contact-placeholder)]"
                  style={{
                    backgroundColor: inputBg,
                    color: inputText,
                    borderColor: errors.message ? headingColor : inputBorder
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg py-3 text-base font-semibold shadow-sm"
                style={{ backgroundColor: buttonBg, color: buttonText }}
              >
                {submitting ? 'Submitting...' : data.submitButtonText || 'Submit'}
              </button>

              {submitStatus && (
                <p className={`text-sm ${submitStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {submitStatus.message}
                </p>
              )}
            </form>
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: cardBg }}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--contact-icon-bg)',
                    color: 'var(--contact-icon)',
                    border: '1px solid var(--contact-icon-border)'
                  }}
                >
                  {section?.emailIcon ? (
                    <Image
                      src={section.emailIcon?.asset ? urlFor(section.emailIcon).width(20).height(20).url() : ''}
                      alt={section.emailIcon?.alt || 'Email icon'}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6.5h18v11H3z" />
                      <path d="M3 6.5l9 6 9-6" />
                    </svg>
                  )}
                </span>
                <h4 className="text-lg font-semibold" style={{ color: headingColor }}>
                  {data.email || 'email@example.com'}
                </h4>
              </div>
              <p style={{ color: cardText }}>{data.email || 'email@example.com'}</p>
            </div>

            <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: cardBg }}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--contact-icon-bg)',
                    color: 'var(--contact-icon)',
                    border: '1px solid var(--contact-icon-border)'
                  }}
                >
                  {section?.phoneIcon ? (
                    <Image
                      src={section.phoneIcon?.asset ? urlFor(section.phoneIcon).width(20).height(20).url() : ''}
                      alt={section.phoneIcon?.alt || 'Phone icon'}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 4h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4c0 1-1 2-2 2A15 15 0 0 1 4 6c0-1 1-2 1-2z" />
                    </svg>
                  )}
                </span>
                <h4 className="text-lg font-semibold" style={{ color: headingColor }}>
                  {data.phone || '+1 (000) 000-0000'}
                </h4>
              </div>
              <p style={{ color: cardText }}>{data.phone || '+1 (000) 000-0000'}</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
