import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/auth/safe-next'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'), '/es/admin/comments')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Quien viene del manual vuelve a su propia puerta, no al login del admin.
  if (next.startsWith('/es/manual-de-usuario')) {
    return NextResponse.redirect(`${origin}/es/manual-de-usuario/entrar?error=enlace`)
  }
  return NextResponse.redirect(`${origin}/es/admin/login?error=auth`)
}
