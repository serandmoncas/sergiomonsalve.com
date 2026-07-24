import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SiteThemeWrapper from '@/components/SiteThemeWrapper'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteThemeWrapper>
      <Nav />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
    </SiteThemeWrapper>
  )
}
