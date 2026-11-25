import type { Metadata } from 'next'

// Todo el manual es privado: fuera de buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ManualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
