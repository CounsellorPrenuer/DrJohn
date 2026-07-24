import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Based Training Need Analysis | CareerCompass™ by Colonel\'s MENTORIA',
  description: "Take India's most comprehensive AI-powered psychometric career assessment. Discover your top 10 AI-resilient careers with a personalised Training Need Analysis report — powered by Claude AI.",
  openGraph: {
    title: 'AI Based Training Need Analysis | Colonel\'s MENTORIA',
    description: '261-question psychometric test covering IQ, EQ, MBTI, RIASEC, Big Five OCEAN, Grit, Ethics & more. Get your AI-generated career report instantly.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TNALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
