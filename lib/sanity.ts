import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '6w0t9e7l'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to true for public read access and faster response
  perspective: 'published',
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

export async function fetchSanityData(query: string) {
  const timeoutMs = 10000
  try {
    return await Promise.race([
      client.fetch(query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sanity API timeout')), timeoutMs)
      ),
    ])
  } catch {
    return null
  }
}
