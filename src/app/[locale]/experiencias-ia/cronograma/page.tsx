import { redirect } from '@/i18n/navigation'

// Vista retirada: Cronograma y Backlog se unieron en "Próximos temas".
export default async function RedirectATemas({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/experiencias-ia/temas', locale })
}
