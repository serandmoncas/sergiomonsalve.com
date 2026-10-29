import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getBio } from '@/lib/bio'
import MDXContent from '@/components/MDXContent'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const bio = getBio(locale)
  if (!bio) return {}
  return {
    title: bio.title,
    description: bio.description,
    alternates: {
      canonical: `/${locale}/biografia`,
      languages: { es: '/es/biografia', en: '/en/biografia' }
    },
    openGraph: {
      title: `${bio.title} — Sergio Monsalve`,
      description: bio.description,
      url: `/${locale}/biografia`
    }
  }
}

export default async function BiografiaPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const bio = getBio(locale)
  if (!bio) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-text-muted mb-2">{bio.readingTime}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-text mb-4">{bio.title}</h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-10">{bio.description}</p>
      <div className="relative aspect-video rounded-sm overflow-hidden border border-border mb-10">
        <Image
          src="/about/sergio-parapente.jpg"
          alt="Sergio Monsalve"
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover object-center"
          priority
        />
      </div>
      <MDXContent source={bio.content} />
    </div>
  )
}
