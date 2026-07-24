import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const post = getPost(slug, locale)

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
          fontSize: 20,
          margin: 0,
          marginBottom: 16,
        }}
      >
        {post?.date} · {post?.readingTime}
      </p>
      <h1
        style={{
          color: '#ffffff',
          fontFamily: 'sans-serif',
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 40,
        }}
      >
        {post?.title}
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
