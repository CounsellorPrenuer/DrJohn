'use client'

import { useState } from 'react'
import { buildMailtoUrl, openMailto } from '@/lib/mail'

type ContactInfoProps = {
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
    backgroundColor?: string
    headingColor?: string
    textColor?: string
    formTitle?: string
    formSubtitle?: string
    nameLabel?: string
    emailLabel?: string
    messageLabel?: string
    submitButtonText?: string
    successMessage?: string
  }
}

export default function ContactForm({ contactInfo }: ContactInfoProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const workerBaseUrl = (process.env.NEXT_PUBLIC_CF_WORKER_URL || '').trim()
  const workerConfigured = workerBaseUrl.startsWith('https://')
  const normalizeUserError = (message?: string) => {
    if (!message) return 'Unable to submit your form right now. Please try again.'
    if (message.includes('NEXT_PUBLIC_CF_WORKER_URL') || message.toLowerCase().includes('endpoint is not configured')) {
      return 'Draft email opened. Please press Send to complete your inquiry.'
    }
    return message
  }

  if (!contactInfo) return null

  const bgColor = contactInfo.backgroundColor?.trim() || '#f9fafb'
  const headingColor = contactInfo.headingColor?.trim() || '#111827'
  const textColor = contactInfo.textColor?.trim() || '#374151'
  const borderColor = headingColor + '33'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      if (workerConfigured) {
        const response = await fetch(`${workerBaseUrl}/lead/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: '',
            purpose: '',
            message: formData.message.trim(),
            source: 'website-contact-form-basic'
          })
        })
        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          const fallbackMailUrl = buildMailtoUrl({
            subject: `Website Contact Lead - ${formData.name.trim()}`,
            lines: [
              'A new contact form lead was submitted.',
              '',
              `Name: ${formData.name.trim()}`,
              `Email: ${formData.email.trim()}`,
              'Phone: N/A',
              'Purpose: N/A',
              `Message: ${formData.message.trim()}`
            ]
          })
          openMailto(fallbackMailUrl)
          setErrors({ form: normalizeUserError(payload?.message) })
          return
        }
      }

      const mailUrl = buildMailtoUrl({
        subject: `Website Contact Lead - ${formData.name.trim()}`,
        lines: [
          'A new contact form lead was submitted.',
          '',
          `Name: ${formData.name.trim()}`,
          `Email: ${formData.email.trim()}`,
          'Phone: N/A',
          'Purpose: N/A',
          `Message: ${formData.message.trim()}`
        ]
      })
      openMailto(mailUrl)

      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      const fallbackMailUrl = buildMailtoUrl({
        subject: `Website Contact Lead - ${formData.name.trim()}`,
        lines: [
          'A new contact form lead was submitted.',
          '',
          `Name: ${formData.name.trim()}`,
          `Email: ${formData.email.trim()}`,
          'Phone: N/A',
          'Purpose: N/A',
          `Message: ${formData.message.trim()}`
        ]
      })
      openMailto(fallbackMailUrl)
      setErrors({ form: 'Draft email opened. Please press Send to complete your inquiry.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section 
      id="contact"
      className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Contact Info Display */}
        {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            {contactInfo.email && (
              <div>
                <p style={{ color: headingColor }} className="text-sm font-semibold uppercase tracking-wide mb-2">
                  Email
                </p>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  style={{ color: textColor }}
                  className="text-base hover:opacity-80 transition-opacity"
                >
                  {contactInfo.email}
                </a>
              </div>
            )}
            {contactInfo.phone && (
              <div>
                <p style={{ color: headingColor }} className="text-sm font-semibold uppercase tracking-wide mb-2">
                  Phone
                </p>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  style={{ color: textColor }}
                  className="text-base hover:opacity-80 transition-opacity"
                >
                  {contactInfo.phone}
                </a>
              </div>
            )}
            {contactInfo.address && (
              <div>
                <p style={{ color: headingColor }} className="text-sm font-semibold uppercase tracking-wide mb-2">
                  Address
                </p>
                <p style={{ color: textColor }} className="text-base">
                  {contactInfo.address}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contact Form */}
        {contactInfo.formTitle && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: headingColor }}
              >
                {contactInfo.formTitle}
              </h2>
              {contactInfo.formSubtitle && (
                <p 
                  className="text-base sm:text-lg"
                  style={{ color: textColor }}
                >
                  {contactInfo.formSubtitle}
                </p>
              )}
            </div>

            {submitted && contactInfo.successMessage && (
              <div 
                className="mb-6 p-4 rounded-lg text-center font-semibold"
                style={{
                  backgroundColor: headingColor + '15',
                  color: headingColor,
                  border: `2px solid ${headingColor}33`
                }}
              >
                {contactInfo.successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label 
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: headingColor }}
                >
                  {contactInfo.nameLabel || 'Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: errors.name ? '#ef4444' : borderColor,
                    color: textColor,
                    backgroundColor: 'white'
                  }}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: headingColor }}
                >
                  {contactInfo.emailLabel || 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: errors.email ? '#ef4444' : borderColor,
                    color: textColor,
                    backgroundColor: 'white'
                  }}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label 
                  htmlFor="message"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: headingColor }}
                >
                  {contactInfo.messageLabel || 'Message'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-colors resize-vertical"
                  style={{
                    borderColor: errors.message ? '#ef4444' : borderColor,
                    color: textColor,
                    backgroundColor: 'white'
                  }}
                  placeholder="Your message..."
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: headingColor,
                  color: bgColor
                }}
              >
                {submitting ? 'Submitting...' : contactInfo.submitButtonText || 'Send Message'}
              </button>

              {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
