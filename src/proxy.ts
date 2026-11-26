import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { isAdminEmail } from './lib/auth/admin'
import { CABECERAS_DIARIO } from './lib/auth/cabeceras-diario'

const handleI18nRouting = createMiddleware(routing)

const STUDENT_PROTECTED = [
  /^\/(es|en)\/cursos\/mi-acceso/,
  /^\/(es|en)\/cursos\/[^/]+\/aprender/,
]

// Rutas del manual que exigen sesión; la portada y entrar son libres.
const MANUAL_PROTECTED = /^\/es\/manual-de-usuario\/(mapa|r|n|grafo)(\/|$)/

// El diario (DI-083) pide además segundo factor (aal2), salvo la página donde
// se registra o se escribe el código.
const DIARIO = /^\/(es|en)\/admin\/diario(\/|$)/
const SEGUNDO_FACTOR = /^\/(es|en)\/admin\/diario\/segundo-factor(\/|$)/

async function tieneAal2(
  supabase: ReturnType<typeof createServerClient>,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    return !error && data?.currentLevel === 'aal2'
  } catch {
    return false
  }
}

/**
 * La ruta decodificada, como la ve Next al elegir la página: si no, una ruta
 * como /es/%61dmin/... se saltaría las comprobaciones. Si la codificación es
 * inválida, decodifica al menos los caracteres ASCII.
 */
function decodificar(ruta: string): string {
  try {
    return decodeURIComponent(ruta)
  } catch {
    return ruta.replace(/%([0-9A-Fa-f]{2})/g, (m, h: string) => {
      const c = parseInt(h, 16)
      return c < 0x80 ? String.fromCharCode(c) : m
    })
  }
}

export async function proxy(request: NextRequest) {
  const pathname = decodificar(request.nextUrl.pathname)

  // El manual solo existe en español: /en/... redirige a /es/... (307).
  const enManual = pathname.match(/^\/en\/manual-de-usuario(\/.*)?$/)
  if (enManual) {
    const url = request.nextUrl.clone()
    url.pathname = `/es/manual-de-usuario${enManual[1] ?? ''}`
    return NextResponse.redirect(url, 307)
  }

  const isManualProtected = MANUAL_PROTECTED.test(pathname)
  const isAdminPath = /^\/(es|en)\/admin/.test(pathname)
  const isLoginPath = /^\/(es|en)\/admin\/login/.test(pathname)
  const isStudentProtected = STUDENT_PROTECTED.some(re => re.test(pathname))

  if ((isAdminPath && !isLoginPath) || isStudentProtected || isManualProtected) {
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

    if (!user && isManualProtected) {
      const entrar = new URL('/es/manual-de-usuario/entrar', request.url)
      entrar.searchParams.set('next', pathname + request.nextUrl.search)
      return NextResponse.redirect(entrar)
    }

    if (!user) {
      const locale = pathname.split('/')[1] ?? 'es'
      const loginPath = isAdminPath
        ? `/${locale}/admin/login`
        : `/${locale}/cursos/login`
      return NextResponse.redirect(new URL(loginPath, request.url))
    }

    // /admin/* (salvo el login) es solo para correos de ADMIN_EMAILS; los
    // lectores invitados y estudiantes con sesión vuelven al inicio.
    if (isAdminPath && !isAdminEmail(user.email)) {
      const locale = pathname.split('/')[1] ?? 'es'
      return NextResponse.redirect(new URL(`/${locale}`, request.url))
    }

    if (DIARIO.test(pathname)) {
      if (!SEGUNDO_FACTOR.test(pathname) && !(await tieneAal2(supabase))) {
        const locale = pathname.split('/')[1]
        const url = new URL(`/${locale}/admin/diario/segundo-factor`, request.url)
        url.searchParams.set('next', pathname + request.nextUrl.search)
        const res = NextResponse.redirect(url)
        // Conserva las cookies que Supabase haya renovado en getUser().
        supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c))
        for (const [k, v] of Object.entries(CABECERAS_DIARIO)) res.headers.set(k, v)
        return res
      }
      for (const [k, v] of Object.entries(CABECERAS_DIARIO)) supabaseResponse.headers.set(k, v)
    }

    return supabaseResponse
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!api|auth/callback|_next|_vercel|.*\\..*).*)']
}
