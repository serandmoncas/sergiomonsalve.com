import { getAllPosts } from '@/lib/posts'

const base = 'https://sergiomonsalve.com'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const posts = getAllPosts(locale)
  const title = locale === 'en' ? 'Sergio Monsalve — Blog' : 'Sergio Monsalve — Blog'
  const description =
    locale === 'en'
      ? 'Posts on software engineering, AI, and building things.'
      : 'Notas sobre desarrollo de software, IA y construir cosas.'

  const items = posts
    .map(
      post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${base}/${locale}/blog/${post.slug}</link>
      <guid>${base}/${locale}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
    )
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${base}/${locale}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>${locale}</language>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${base}/${locale}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  })
}
