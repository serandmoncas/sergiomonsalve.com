import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const STUDENT_PROTECTED = [
  /^\/(es|en)\/cursos\/mi-acceso/,
  /^\/(es|en)\/cursos\/[^/]+\/aprender/,
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPath = /^\/(es|en)\/admin/.test(pathname)
  const isLoginPath = /^\/(es|en)\/admin\/login/.test(pathname)
  const isStudentProtected = STUDENT_PROTECTED.some(re => re.test(pathname))

  if ((isAdminPath && !isLoginPath) || isStudentProtected) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const locale = pathname.split('/')[1] ?? 'es'
      const loginPath = isAdminPath
        ? `/${locale}/admin/login`
        : `/${locale}/cursos/login`
      return NextResponse.redirect(new URL(loginPath, request.url))
    }

    return supabaseResponse
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
