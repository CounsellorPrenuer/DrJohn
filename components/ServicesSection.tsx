'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { urlFor } from '@/lib/sanity'
import { buildMailtoUrl, openMailto } from '@/lib/mail'

interface Service {
  _id: string
  title: string
  description: string
  targetAudience?: string
  icon?: any
}

interface PackagePlan {
  _id: string
  order?: number
  category?: string
  planName?: string
  price?: string
  shortDescription?: string
  benefits?: string[]
  ctaText?: string
  ctaLink?: string
}

const STANDARD_PACKAGES_FALLBACK: PackagePlan[] = [
  {
    _id: 'pkg-1',
    order: 1,
    category: '8-9 Students',
    planName: 'Discover',
    price: 'Rs. 5,500',
    benefits: [
      'Psychometric assessment',
      '1 career counselling session',
      'Lifetime Knowledge Gateway access',
      'Live webinar invites'
    ]
  },
  {
    _id: 'pkg-2',
    order: 2,
    category: '8-9 Students',
    planName: 'Discover Plus+',
    price: 'Rs. 15,000',
    benefits: [
      'Psychometric assessments',
      '8 career counselling sessions (1/year)',
      'Custom reports and study abroad guidance',
      'CV building'
    ]
  },
  {
    _id: 'pkg-3',
    order: 3,
    category: '10-12 Students',
    planName: 'Achieve Online',
    price: 'Rs. 5,999',
    benefits: [
      'Psychometric assessment',
      '1 career counselling session',
      'Lifetime Knowledge Gateway access',
      'Pre-recorded webinars'
    ]
  },
  {
    _id: 'pkg-4',
    order: 4,
    category: '10-12 Students',
    planName: 'Achieve Plus+',
    price: 'Rs. 10,599',
    benefits: [
      'Psychometric assessment',
      '4 career counselling sessions',
      'Custom reports and study abroad guidance',
      'CV reviews'
    ]
  },
  {
    _id: 'pkg-5',
    order: 5,
    category: 'Graduates',
    planName: 'Ascend Online',
    price: 'Rs. 6,499',
    benefits: [
      'Psychometric assessment',
      '1 career counselling session',
      'Lifetime Knowledge Gateway access',
      'Pre-recorded webinars'
    ]
  },
  {
    _id: 'pkg-6',
    order: 6,
    category: 'Graduates',
    planName: 'Ascend Plus+',
    price: 'Rs. 10,599',
    benefits: [
      'Psychometric assessment',
      '3 career counselling sessions',
      'Certificate/online course info',
      'CV reviews for jobs'
    ]
  },
  {
    _id: 'mp-3',
    order: 7,
    category: 'Working Professionals',
    planName: 'Ascend Online',
    price: 'Rs. 6,499',
    benefits: [
      'Psychometric assessment',
      '1 career counselling session',
      'Lifetime Knowledge Gateway access',
      'Pre-recorded webinars'
    ]
  },
  {
    _id: 'mp-2',
    order: 8,
    category: 'Working Professionals',
    planName: 'Ascend Plus+',
    price: 'Rs. 10,599',
    benefits: [
      'Psychometric assessment',
      '3 career counselling sessions',
      'Certificate/online course info',
      'CV reviews for jobs'
    ]
  }
]

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

declare global {
  interface Window {
    Razorpay?: any
  }
}

type CustomPackage = {
  id: string
  title: string
  price: string
  description: string
}

const CUSTOM_PACKAGES: CustomPackage[] = [
  {
    id: 'career-report',
    title: 'Career Report',
    price: 'Rs. 1,500',
    description:
      'Get a detailed report of your psychometric assessment for a scientific analysis of your interests. Find out where your interests lie and which future paths you can potentially consider.'
  },
  {
    id: 'career-report-counselling',
    title: 'Career Report + Career Counselling',
    price: 'Rs. 3,000',
    description:
      "Connect with India's top career coaches to analyse your psychometric report and shortlist the top three career paths you're most likely to enjoy and excel at."
  },
  {
    id: 'knowledge-gateway',
    title: 'Knowledge Gateway + Career Helpline Access',
    price: 'Rs. 100',
    description:
      "Unlock holistic information on your career paths and get direct access to Mentoria's experts, who will resolve your career-related queries through our dedicated Career Helpline. Validate your career decisions from now until you land a job you love."
  },
  {
    id: 'one-to-one-session',
    title: 'One-to-One Session with a Career Expert',
    price: 'Rs. 3,500',
    description:
      'Resolve your career queries and glimpse into your future world through a one-on-one session with an expert from your chosen field.'
  },
  {
    id: 'college-admission-planning',
    title: 'College Admission Planning',
    price: 'Rs. 3,000',
    description:
      'Get unbiased recommendations and details on your future college options in India and abroad, organised in one resourceful planner.'
  },
  {
    id: 'exam-stress-management',
    title: 'Exam Stress Management',
    price: 'Rs. 1,000',
    description:
      "Get expert guidance on tackling exam stress, planning your study schedule, revision tips and more from India's top educators. Increase your chances of acing exams with a calm and clear mind."
  },
  {
    id: 'cap-100',
    title: 'College Admissions Planner - 100 (CAP-100)',
    price: 'Rs. 199',
    description:
      'Rs. 199 for a ranked list of the top 100 colleges in your course. Get an expert-curated list of colleges based on verified cut-offs. CAP-100 ranks the top 100 colleges into four tiers to help you plan smarter: Indian Ivy League, Target, Smart Backup, and Safe Bet colleges. You can then shortlist colleges based on where you stand.'
  }
]

const RAZORPAY_PAYMENT_BUTTON_MAP: Record<string, string> = {
  discover: 'pl_RwDuOx96VYrsyN',
  'discover-plus': 'pl_RwDq8XpK76OhB3',
  'achieve-online': 'pl_RwDxvLPQP7j4rG',
  'achieve-plus': 'pl_RwDzfVkQYEdAIf',
  'ascend-online': 'pl_RwE1evNHrHWJDW',
  'ascend-plus': 'pl_RwE3WEILWB9WeJ'
}

const CURRENCY = 'INR'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const parseAmountInPaise = (price?: string) => {
  if (!price) return 0
  const numeric = Number(price.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(numeric)) return 0
  return Math.round(numeric * 100)
}

const getPlanId = (plan?: PackagePlan) => {
  const normalized = plan?.planName ? slugify(plan.planName) : ''
  if (normalized.includes('discover-plus') || normalized.includes('discover plus')) return 'discover-plus'
  if (normalized.includes('discover')) return 'discover'
  if (normalized.includes('achieve-plus') || normalized.includes('achieve plus')) return 'achieve-plus'
  if (normalized.includes('achieve')) return 'achieve-online'
  if (normalized.includes('ascend-plus') || normalized.includes('ascend plus')) return 'ascend-plus'
  if (normalized.includes('ascend')) return 'ascend-online'
  return normalized || plan?._id || 'custom-plan'
}

export default function ServicesSection({ section, services, packages }: ServicesSectionProps) {
  if (!section) return null

  const [selectedPlan, setSelectedPlan] = useState<{
    planId: string
    title: string
    displayPrice: string
    amountInPaise: number
    paymentButtonId?: string
  } | null>(null)

  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '' })
  const [couponCode, setCouponCode] = useState('')
  const [couponFeedback, setCouponFeedback] = useState('')
  const [couponState, setCouponState] = useState<{
    code: string
    discountPercent?: number
    discountAmountPaise?: number
    finalAmountPaise?: number
    valid: boolean
  } | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isRazorpayReady, setIsRazorpayReady] = useState(false)

  const workerBaseUrl = (process.env.NEXT_PUBLIC_CF_WORKER_URL || '').trim()
  const workerConfigured = workerBaseUrl.startsWith('https://')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.Razorpay) {
      setIsRazorpayReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsRazorpayReady(true)
    script.onerror = () => setCheckoutError('Unable to load payment gateway. Please refresh and try again.')
    document.body.appendChild(script)
  }, [])

  const bgColor = section.backgroundColor || '#ffffff'
  const headingColor = section.headingColor || '#1f2937'
  const textColor = section.textColor || '#4b5563'

  const filteredServices = (services || []).filter((service) => {
    const title = (service.title || '').toLowerCase()
    const description = (service.description || '').toLowerCase()
    return !title.includes('mobile +91') && !description.includes('mobile +91')
  })

  const sortedPackages = useMemo(() => {
    const sanitized = [...(packages || [])]
      .map((plan) => ({
        ...plan,
        planName: plan.planName?.trim(),
        category: plan.category?.trim(),
        price: plan.price?.trim(),
        ctaText: plan.ctaText?.trim() || 'BUY NOW'
      }))
      .filter((plan) => Boolean(plan.planName) && Boolean(plan.price))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

    const hasRequestedPlans = sanitized.some((plan) => plan.planName?.toLowerCase().includes('discover'))
    return hasRequestedPlans ? sanitized : STANDARD_PACKAGES_FALLBACK
  }, [packages])

  const standardPlans = useMemo(() => sortedPackages, [sortedPackages])

  const resetCheckoutState = () => {
    setCouponCode('')
    setCouponFeedback('')
    setCouponState(null)
    setCheckoutError('')
    setIsApplyingCoupon(false)
    setIsProcessingPayment(false)
    setBuyer({ name: '', email: '', phone: '' })
  }

  const openCheckoutForPlan = (plan: PackagePlan) => {
    const planId = getPlanId(plan)
    setSelectedPlan({
      planId,
      title: plan.planName || 'Mentoria Plan',
      displayPrice: plan.price || 'Rs. 0',
      amountInPaise: parseAmountInPaise(plan.price),
      paymentButtonId: RAZORPAY_PAYMENT_BUTTON_MAP[planId]
    })
    resetCheckoutState()
  }

  const openCheckoutForCustomPackage = (customPack: CustomPackage) => {
    setSelectedPlan({
      planId: customPack.id,
      title: customPack.title,
      displayPrice: customPack.price,
      amountInPaise: parseAmountInPaise(customPack.price)
    })
    resetCheckoutState()
  }

  const closeCheckoutModal = () => {
    setSelectedPlan(null)
    resetCheckoutState()
  }

  const validateBuyer = () => {
    if (!buyer.name.trim()) return 'Please enter your name.'
    if (!buyer.email.trim()) return 'Please enter your email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) return 'Please enter a valid email.'
    if (!buyer.phone.trim()) return 'Please enter your phone number.'
    if (!/^[0-9+\-()\s]{8,}$/.test(buyer.phone.trim())) return 'Please enter a valid phone number.'
    return ''
  }

  const applyCoupon = async () => {
    if (!selectedPlan) return
    setCheckoutError('')
    setCouponFeedback('')
    const validationError = validateBuyer()
    if (validationError) {
      setCheckoutError(validationError)
      return
    }

    if (!couponCode.trim()) {
      setCheckoutError('Enter a coupon code to apply.')
      return
    }

    if (!workerConfigured) {
      setCheckoutError('Coupon service is not configured. Set NEXT_PUBLIC_CF_WORKER_URL.')
      return
    }

    setIsApplyingCoupon(true)
    try {
      const response = await fetch(`${workerBaseUrl}/coupon/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.planId,
          amountInPaise: selectedPlan.amountInPaise,
          couponCode: couponCode.trim(),
          customer: buyer
        })
      })

      const data = await response.json()
      if (!response.ok || !data?.valid) {
        setCouponState(null)
        setCouponFeedback(data?.message || 'Invalid coupon code.')
        return
      }

      setCouponState({
        code: couponCode.trim().toUpperCase(),
        discountPercent: data.discountPercent,
        discountAmountPaise: data.discountAmountPaise,
        finalAmountPaise: data.finalAmountPaise,
        valid: true
      })
      setCouponFeedback(data?.message || 'Coupon applied successfully.')
    } catch {
      setCouponState(null)
      setCouponFeedback('Unable to validate coupon right now. Please try again.')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const startPayment = async () => {
    if (!selectedPlan) return
    setCheckoutError('')
    const validationError = validateBuyer()
    if (validationError) {
      setCheckoutError(validationError)
      return
    }
    if (!isRazorpayReady || typeof window === 'undefined' || !window.Razorpay) {
      setCheckoutError('Payment gateway not ready yet. Please wait a moment and retry.')
      return
    }
    if (!workerConfigured) {
      setCheckoutError('Payment service is not configured. Set NEXT_PUBLIC_CF_WORKER_URL.')
      return
    }

    setIsProcessingPayment(true)

    try {
      const paymentMailUrl = buildMailtoUrl({
        subject: `Payment Lead - ${selectedPlan.title}`,
        lines: [
          'A new payment intent was created from the website.',
          '',
          `Plan: ${selectedPlan.title}`,
          `Plan ID: ${selectedPlan.planId}`,
          `Customer Name: ${buyer.name.trim()}`,
          `Customer Email: ${buyer.email.trim()}`,
          `Customer Phone: ${buyer.phone.trim()}`,
          `Coupon Code: ${couponState?.valid ? couponState.code : 'N/A'}`,
          `Displayed Price: ${selectedPlan.displayPrice}`,
          `Final Amount: Rs. ${(
            (couponState?.finalAmountPaise || selectedPlan.amountInPaise) / 100
          ).toLocaleString('en-IN')}`
        ]
      })
      openMailto(paymentMailUrl)

      const orderResponse = await fetch(`${workerBaseUrl}/checkout/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.planId,
          planTitle: selectedPlan.title,
          amountInPaise: selectedPlan.amountInPaise,
          couponCode: couponState?.valid ? couponState.code : undefined,
          customer: buyer
        })
      })
      const orderPayload = await orderResponse.json()
      if (!orderResponse.ok) {
        throw new Error(orderPayload?.message || 'Unable to initialize payment.')
      }

      const finalAmountPaise =
        orderPayload?.amountInPaise || couponState?.finalAmountPaise || selectedPlan.amountInPaise
      const paymentButtonId = selectedPlan.paymentButtonId

      const keyId = orderPayload?.keyId

      if (!keyId && !paymentButtonId) {
        throw new Error('Payment key is missing. Please configure the Cloudflare worker endpoint.')
      }

      const options: any = {
        key: keyId,
        amount: finalAmountPaise,
        currency: CURRENCY,
        name: 'Mentoria',
        description: selectedPlan.title,
        prefill: {
          name: buyer.name.trim(),
          email: buyer.email.trim(),
          contact: buyer.phone.trim()
        },
        theme: { color: '#0f172a' },
        notes: {
          planId: selectedPlan.planId,
          couponCode: couponState?.valid ? couponState.code : ''
        },
        handler: async (response: any) => {
          await fetch(`${workerBaseUrl}/checkout/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              planId: selectedPlan.planId,
              planTitle: selectedPlan.title,
              customer: buyer,
              amountInPaise: finalAmountPaise,
              couponCode: couponState?.valid ? couponState.code : ''
            })
          }).catch(() => null)
          closeCheckoutModal()
        }
      }

      if (orderPayload?.orderId) {
        options.order_id = orderPayload.orderId
      } else if (paymentButtonId) {
        window.open(`https://pages.razorpay.com/${paymentButtonId}`, '_blank', 'noopener,noreferrer')
        setIsProcessingPayment(false)
        return
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', () => {
        setCheckoutError('Payment failed. Please retry.')
      })
      paymentObject.open()
    } catch (error: any) {
      setCheckoutError(error?.message || 'Unable to start payment. Please try again.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (sortedPackages.length > 0) {
    return (
      <section
        id="services"
        className="w-full px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8"
        style={{ backgroundColor: bgColor }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-left">
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

          <h3 className="mb-5 text-2xl font-bold sm:text-3xl" style={{ color: headingColor }}>
            Invest In Your Future
          </h3>

          <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-5 text-xl font-semibold text-slate-900">Standard Mentoria Packages</h4>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {standardPlans.map((plan) => (
                <article
                  key={plan._id}
                  className="flex h-full flex-col rounded-3xl border border-gray-200 bg-gray-100 p-8 shadow-sm"
                >
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    {plan.category || 'TRAINING PROGRAM'}
                  </p>
                  {plan.planName && <h4 className="mb-2 text-4xl font-bold text-slate-900">{plan.planName}</h4>}
                  {plan.price && <p className="mb-5 text-5xl font-extrabold leading-none text-slate-900">{plan.price}</p>}

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
                          <span className="text-lg leading-relaxed" style={{ color: textColor }}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => openCheckoutForPlan(plan)}
                    className="mt-auto inline-block w-full rounded-xl bg-slate-900 px-5 py-3 text-center text-lg font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    {plan.ctaText || 'BUY NOW'}
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h4 className="mb-2 text-2xl font-bold text-slate-900">Want To Customise Your Mentorship Plan?</h4>
              <p className="text-base leading-relaxed text-slate-700">
                If you want to subscribe to specific services from Mentoria that resolve your career challenges, you can choose one or more of the following:
              </p>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Custom Packages (7 Total)</p>
            <div className="space-y-4">
              {CUSTOM_PACKAGES.map((customPack) => (
                <article
                  key={customPack.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 md:flex md:items-start md:justify-between md:gap-5"
                >
                  <div className="md:flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {customPack.id}
                      </span>
                      <h5 className="text-xl font-bold text-slate-900">{customPack.title}</h5>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{customPack.description}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-2xl font-extrabold text-slate-900">{customPack.price}</p>
                    <button
                      type="button"
                      onClick={() => openCheckoutForCustomPackage(customPack)}
                      className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      BUY NOW
                    </button>
                  </div>
                </article>
              ))}
            </div>
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
                        className="inline-block rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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

        {selectedPlan && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">Complete Your Purchase</h4>
                  <p className="text-sm text-slate-600">
                    {selectedPlan.title} | {selectedPlan.displayPrice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCheckoutModal}
                  className="rounded px-2 py-1 text-lg font-bold text-slate-600 hover:bg-slate-100"
                >
                  x
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={buyer.name}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                />
                <input
                  type="email"
                  value={buyer.email}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                />
                <input
                  type="tel"
                  value={buyer.phone}
                  onChange={(e) => setBuyer((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone Number"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon}
                    className="rounded-lg border border-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>

                {couponFeedback && (
                  <p className={`text-sm ${couponState?.valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponFeedback}
                  </p>
                )}

                {selectedPlan.amountInPaise > 0 && (
                  <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                    <p>Base Amount: Rs. {(selectedPlan.amountInPaise / 100).toLocaleString('en-IN')}</p>
                    {couponState?.valid ? (
                      <>
                        <p>
                          Coupon ({couponState.code}): -Rs. 
                          {((couponState.discountAmountPaise || 0) / 100).toLocaleString('en-IN')}
                        </p>
                        <p className="font-semibold text-slate-900">
                          Final Amount: Rs. 
                          {((couponState.finalAmountPaise || selectedPlan.amountInPaise) / 100).toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      </>
                    ) : null}
                  </div>
                )}

                {checkoutError && <p className="text-sm text-rose-600">{checkoutError}</p>}

                <button
                  type="button"
                  onClick={startPayment}
                  disabled={isProcessingPayment}
                  className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessingPayment ? 'Opening Razorpay...' : 'Proceed To Pay'}
                </button>

                <p className="text-xs text-slate-500">
                  Secure payment powered by Razorpay. Coupon and order processing uses your Cloudflare Worker endpoint.
                </p>
              </div>
            </div>
          </div>
        )}
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
            backgroundColor: 'color-mix(in srgb, var(--text-color), transparent 97%)'
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
