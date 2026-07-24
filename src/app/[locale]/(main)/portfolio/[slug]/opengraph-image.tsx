import { ImageResponse } from 'next/og'
import { getProject } from '@/lib/portfolio'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = getProject(slug, locale)

  return new ImageResponse(
    <div
      style={{
        background: '#0f0f0f',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 80,
      }}
    >
      <p
        style={{
          color: '#555',
          fontFamily: 'monospace',
          fontSize: 18,
          margin: 0,
          marginBottom: 8,
        }}
      >
        {project?.role}
      </p>
      <p
        style={{
          color: '#888',
          fontFamily: 'monospace',
          fontSize: 20,
          margin: 0,
          marginBottom: 16,
        }}
      >
        {project?.date}
      </p>
      <h1
        style={{
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 40,
        }}
      >
        {project?.title}
      </h1>
      <p
        style={{
          color: '#00ff88',
          fontFamily: 'monospace',
          fontSize: 24,
          margin: 0,
        }}
      >
        sergiomonsalve.com
      </p>
    </div>,
    { ...size }
  )
}
