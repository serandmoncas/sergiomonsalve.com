import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Sergio Monsalve — AI Software Engineer',
  description:
    'Systems engineer with 13+ years building software solutions powered by Python, AI, and data science.',
  openGraph: {
    title: 'Sergio Monsalve — AI Software Engineer',
    description:
      'Systems engineer with 13+ years building software solutions powered by Python, AI, and data science.',
    url: 'https://sergiomonsalve.com',
    siteName: 'Sergio Monsalve'
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-background text-text font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <Nav />
          <main className="pt-16">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
