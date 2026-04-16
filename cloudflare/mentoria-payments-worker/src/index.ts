type D1PreparedStatement = {
  bind: (...args: any[]) => D1PreparedStatement
  run: () => Promise<any>
}

type D1Database = {
  prepare: (query: string) => D1PreparedStatement
}

interface Env {
  RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string
  RAZORPAY_WEBHOOK_SECRET: string
  SANITY_PROJECT_ID: string
  SANITY_DATASET: string
  CORS_ORIGIN: string
  LEADS_DB: D1Database
}

type CouponDefinition = {
  code: string
  discountPercent: number
  active: boolean
}

const COUPONS: CouponDefinition[] = [
  { code: 'MENTORIA10', discountPercent: 10, active: true },
  { code: 'CAREER20', discountPercent: 20, active: true }
]

const PLAN_AMOUNTS: Record<string, number> = {
  discover: 550000,
  'discover-plus': 1500000,
  'achieve-online': 599900,
  achieve: 599900,
  'achieve-plus': 1059900,
  'ascend-online': 649900,
  ascend: 649900,
  'ascend-plus': 1059900
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  })

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
})

const withCors = (response: Response, origin: string) => {
  const headers = new Headers(response.headers)
  const c = corsHeaders(origin)
  headers.set('Access-Control-Allow-Origin', c['Access-Control-Allow-Origin'])
  headers.set('Access-Control-Allow-Methods', c['Access-Control-Allow-Methods'])
  headers.set('Access-Control-Allow-Headers', c['Access-Control-Allow-Headers'])
  return new Response(response.body, { status: response.status, headers })
}

const parseJson = async (request: Request) => {
  try {
    return await request.json()
  } catch {
    return null
  }
}

const normalizePlanId = (planId: string) => planId.trim().toLowerCase()

const amountForPlan = (planId: string, fallbackAmount?: number) => {
  const normalized = normalizePlanId(planId)
  const mapped = PLAN_AMOUNTS[normalized]
  if (Number.isFinite(mapped)) return mapped
  return Number.isFinite(fallbackAmount) ? Number(fallbackAmount) : 0
}

const findCoupon = (couponCode: string) => {
  const code = couponCode.trim().toUpperCase()
  return COUPONS.find((coupon) => coupon.active && coupon.code === code) || null
}

const buildAuthHeader = (env: Env) => {
  const token = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
  return `Basic ${token}`
}

const createRazorpayOrder = async (env: Env, amountInPaise: number, planTitle: string) => {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(env),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `mentoria-${Date.now()}`,
      notes: {
        planTitle
      }
    })
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error?.description || 'Failed to create Razorpay order.')
  }
  return payload
}

const encodeHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')

const verifySignature = async (secret: string, payload: string, signature: string) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const hmac = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return encodeHex(hmac) === signature
}

const insertLead = async (env: Env, data: any) => {
  await env.LEADS_DB.prepare(
    `INSERT INTO leads (name, email, phone, purpose, message, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(
      data.name || '',
      data.email || '',
      data.phone || '',
      data.purpose || '',
      data.message || '',
      data.source || 'website'
    )
    .run()
}

const insertPaymentLead = async (env: Env, data: any) => {
  await env.LEADS_DB.prepare(
    `INSERT INTO payment_leads (
      plan_id, plan_title, customer_name, customer_email, customer_phone,
      coupon_code, base_amount_paise, final_amount_paise, order_id, payment_id, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(
      data.planId || '',
      data.planTitle || '',
      data.customer?.name || '',
      data.customer?.email || '',
      data.customer?.phone || '',
      data.couponCode || '',
      data.baseAmountPaise || 0,
      data.finalAmountPaise || 0,
      data.orderId || '',
      data.paymentId || '',
      data.status || 'created'
    )
    .run()
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = env.CORS_ORIGIN || '*'

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    try {
      if (url.pathname === '/health') {
        return withCors(
          json({
            ok: true,
            message: 'Mentoria payment worker is live.'
          }),
          origin
        )
      }

      if (url.pathname === '/public-config' && request.method === 'GET') {
        return withCors(
          json({
            keyId: env.RAZORPAY_KEY_ID,
            sanityProjectId: env.SANITY_PROJECT_ID,
            sanityDataset: env.SANITY_DATASET
          }),
          origin
        )
      }

      if (url.pathname === '/coupon/validate' && request.method === 'POST') {
        const body = await parseJson(request)
        const amountInPaise = amountForPlan(body?.planId || '', Number(body?.amountInPaise))
        const coupon = findCoupon(body?.couponCode || '')

        if (!coupon) {
          return withCors(json({ valid: false, message: 'Coupon code is invalid or expired.' }, 400), origin)
        }

        const discountAmountPaise = Math.round((amountInPaise * coupon.discountPercent) / 100)
        const finalAmountPaise = Math.max(100, amountInPaise - discountAmountPaise)

        return withCors(
          json({
            valid: true,
            message: `Coupon ${coupon.code} applied.`,
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            discountAmountPaise,
            finalAmountPaise
          }),
          origin
        )
      }

      if (url.pathname === '/checkout/order' && request.method === 'POST') {
        const body = await parseJson(request)
        const planId = normalizePlanId(body?.planId || '')
        const baseAmountPaise = amountForPlan(planId, Number(body?.amountInPaise))
        const coupon = body?.couponCode ? findCoupon(body.couponCode) : null
        const discountAmountPaise = coupon ? Math.round((baseAmountPaise * coupon.discountPercent) / 100) : 0
        const finalAmountPaise = Math.max(100, baseAmountPaise - discountAmountPaise)

        const order = await createRazorpayOrder(env, finalAmountPaise, body?.planTitle || 'Mentoria Plan')

        await insertPaymentLead(env, {
          planId,
          planTitle: body?.planTitle || '',
          customer: body?.customer || {},
          couponCode: coupon?.code || '',
          baseAmountPaise,
          finalAmountPaise,
          orderId: order.id,
          paymentId: '',
          status: 'order_created'
        })

        return withCors(
          json({
            orderId: order.id,
            amountInPaise: finalAmountPaise,
            currency: 'INR',
            keyId: env.RAZORPAY_KEY_ID,
            couponApplied: Boolean(coupon),
            discountAmountPaise
          }),
          origin
        )
      }

      if (url.pathname === '/checkout/verify' && request.method === 'POST') {
        const body = await parseJson(request)
        const paymentId = body?.razorpay_payment_id || ''
        const orderId = body?.razorpay_order_id || ''
        const signature = body?.razorpay_signature || ''
        const payload = `${orderId}|${paymentId}`

        const isValid = await verifySignature(env.RAZORPAY_KEY_SECRET, payload, signature)
        if (!isValid) {
          return withCors(json({ ok: false, message: 'Invalid payment signature.' }, 400), origin)
        }

        await insertPaymentLead(env, {
          planId: body?.planId || '',
          planTitle: body?.planTitle || '',
          customer: body?.customer || {},
          couponCode: body?.couponCode || '',
          baseAmountPaise: Number(body?.amountInPaise || 0),
          finalAmountPaise: Number(body?.amountInPaise || 0),
          orderId,
          paymentId,
          status: 'payment_verified'
        })

        return withCors(json({ ok: true, message: 'Payment verified.' }), origin)
      }

      if (url.pathname === '/lead/contact' && request.method === 'POST') {
        const body = await parseJson(request)
        if (!body?.name || !body?.email || !body?.message) {
          return withCors(json({ ok: false, message: 'Name, email and message are required.' }, 400), origin)
        }

        await insertLead(env, body)
        return withCors(
          json({
            ok: true,
            message: 'Form submitted successfully. Team Mentoria will contact you soon.'
          }),
          origin
        )
      }

      if (url.pathname === '/webhook/razorpay' && request.method === 'POST') {
        const signature = request.headers.get('x-razorpay-signature') || ''
        const rawPayload = await request.text()
        const isValid = await verifySignature(env.RAZORPAY_WEBHOOK_SECRET, rawPayload, signature)
        if (!isValid) {
          return withCors(json({ ok: false, message: 'Invalid webhook signature.' }, 400), origin)
        }

        return withCors(json({ ok: true }), origin)
      }

      return withCors(json({ ok: false, message: 'Not found.' }, 404), origin)
    } catch (error: any) {
      return withCors(json({ ok: false, message: error?.message || 'Internal error.' }, 500), origin)
    }
  }
}
