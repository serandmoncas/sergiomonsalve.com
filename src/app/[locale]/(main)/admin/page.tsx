import { createAdminClient } from '@/lib/supabase/server'
import { getBookAsins } from '@/lib/library'
import { Link } from '@/i18n/navigation'

async function getStats() {
  const admin = createAdminClient()
  const [comments, guestbook, libBooks] = await Promise.all([
    admin.from('comments').select('id, approved'),
    admin.from('guestbook_entries').select('id, approved'),
    admin.from('library_books').select('asin, visible'),
  ])
  const c = comments.data ?? []
  const g = guestbook.data ?? []
  const lb = libBooks.data ?? []
  return {
    commentsPending: c.filter(x => !x.approved).length,
    commentsTotal: c.length,
    guestbookPending: g.filter(x => !x.approved).length,
    guestbookTotal: g.length,
    booksHidden: lb.filter(x => !x.visible).length,
    booksTotal: getBookAsins().length,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()
  const totalPending = stats.commentsPending + stats.guestbookPending

  return (
    <div>
      <h1 className="text-xl font-bold text-text mb-1">Overview</h1>
      <p className="font-mono text-xs text-text-muted mb-8">
        {totalPending === 0
          ? '// todo aprobado, nada pendiente'
          : `// ${totalPending} elemento${totalPending !== 1 ? 's' : ''} pendiente${totalPending !== 1 ? 's' : ''} de revisión`}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          label="Comentarios pendientes"
          value={stats.commentsPending}
          total={stats.commentsTotal}
          href="/admin/comments"
          accent={stats.commentsPending > 0}
        />
        <StatCard
          label="Firmas pendientes"
          value={stats.guestbookPending}
          total={stats.guestbookTotal}
          href="/admin/guestbook"
          accent={stats.guestbookPending > 0}
        />
        <StatCard
          label="Libros ocultos"
          value={stats.booksHidden}
          total={stats.booksTotal}
          href="/admin/biblioteca"
          accent={false}
        />
      </div>

      <div className="border-t border-border pt-8">
        <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-4">
          // acceso rápido
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/comments"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar comentarios →
          </Link>
          <Link
            href="/admin/guestbook"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar firmas →
          </Link>
          <Link
            href="/admin/biblioteca"
            className="font-mono text-xs border border-border text-text-secondary px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors"
          >
            Gestionar biblioteca →
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, total, href, accent,
}: {
  label: string
  value: number
  total: number
  href: string
  accent: boolean
}) {
  return (
    <Link href={href} className="block border border-border rounded-sm p-5 hover:border-accent/50 transition-colors group bg-surface">
      <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">{label}</p>
      <p className={`text-4xl font-extrabold tracking-tight mb-1 ${accent ? 'text-accent' : 'text-text'}`}>
        {value}
      </p>
      <p className="font-mono text-[10px] text-text-muted">{total} total</p>
    </Link>
  )
}
