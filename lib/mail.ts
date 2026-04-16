const SALES_EMAIL = 'royjohnson@careerplans.pro'

type MailPayload = {
  subject: string
  lines: string[]
}

const encode = (value: string) => encodeURIComponent(value)

export const getSalesEmail = () => SALES_EMAIL

export const buildMailtoUrl = ({ subject, lines }: MailPayload) => {
  const body = lines.join('\n')
  return `mailto:${encode(SALES_EMAIL)}?subject=${encode(subject)}&body=${encode(body)}`
}

export const openMailto = (url: string) => {
  if (typeof window === 'undefined') return false
  const popup = window.open(url, '_blank')
  if (popup) return true
  window.location.href = url
  return true
}
