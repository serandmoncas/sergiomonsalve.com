import { Bricolage_Grotesque, Newsreader } from 'next/font/google'
import ExperienciasNav from '@/components/experiencias-ia/ExperienciasNav'
import { Link } from '@/i18n/navigation'
import './experiencias-ia.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
})
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
})

export default function ExperienciasIALayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`experiencias-ia ${bricolage.variable} ${newsreader.variable}`}>
      <ExperienciasNav />
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
        {children}
      </div>
      <footer className="wrap" style={{ borderTop: '1.5px solid var(--tinta)', paddingTop: 20, paddingBottom: 20 }}>
        <Link href="/" className="exp-back">
          ← sergiomonsalve.com
        </Link>
      </footer>
    </div>
  )
}
