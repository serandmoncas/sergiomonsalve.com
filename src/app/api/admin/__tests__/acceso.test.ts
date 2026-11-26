import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getUser, adminClient } = vi.hoisted(() => ({
  getUser: vi.fn(),
  adminClient: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  createAdminClient: adminClient,
}))

import { GET as commentsGET } from '../comments/route'
import { PATCH as commentPATCH, DELETE as commentDELETE } from '../comments/[id]/route'
import { GET as bibliotecaGET } from '../biblioteca/route'
import { PATCH as bibliotecaPATCH } from '../biblioteca/[asin]/route'
import { GET as bookNotesGET, PUT as bookNotesPUT } from '../book-notes/[id]/route'
import { GET as bookSearchGET } from '../book-search/route'
import { GET as guestbookGET } from '../guestbook/route'
import { PATCH as guestbookPATCH, DELETE as guestbookDELETE } from '../guestbook/[id]/route'
import { POST as manualPOST } from '../manual-books/route'
import { PATCH as manualPATCH, DELETE as manualDELETE } from '../manual-books/[id]/route'

const req = (method = 'GET') =>
  new Request('http://localhost/api/admin/x?q=a', {
    method,
    body: method === 'GET' ? undefined : '{}',
    headers: { 'Content-Type': 'application/json' },
  })
const ctx = { params: Promise.resolve({ id: '1', asin: 'A1' }) }

const handlers: Array<[string, () => Promise<Response>]> = [
  ['GET comments', () => commentsGET()],
  ['PATCH comments/[id]', () => commentPATCH(req('PATCH'), ctx)],
  ['DELETE comments/[id]', () => commentDELETE(req('DELETE'), ctx)],
  ['GET biblioteca', () => bibliotecaGET()],
  ['PATCH biblioteca/[asin]', () => bibliotecaPATCH(req('PATCH'), ctx)],
  ['GET book-notes/[id]', () => bookNotesGET(req(), ctx)],
  ['PUT book-notes/[id]', () => bookNotesPUT(req('PUT'), ctx)],
  ['GET book-search', () => bookSearchGET(req())],
  ['GET guestbook', () => guestbookGET()],
  ['PATCH guestbook/[id]', () => guestbookPATCH(req('PATCH'), ctx)],
  ['DELETE guestbook/[id]', () => guestbookDELETE(req('DELETE'), ctx)],
  ['POST manual-books', () => manualPOST(req('POST'))],
  ['PATCH manual-books/[id]', () => manualPATCH(req('PATCH'), ctx)],
  ['DELETE manual-books/[id]', () => manualDELETE(req('DELETE'), ctx)],
]

describe('rutas /api/admin exigen administrador', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'sergio@example.com'
    getUser.mockReset()
    adminClient.mockReset().mockImplementation(() => {
      throw new Error('no debe llegar al cliente admin')
    })
  })

  it.each(handlers)('%s: 403 con usuario no admin', async (_n, call) => {
    getUser.mockResolvedValue({ data: { user: { email: 'lector@x.co' } } })
    expect((await call()).status).toBe(403)
    expect(adminClient).not.toHaveBeenCalled()
  })

  it.each(handlers)('%s: 401 sin sesión', async (_n, call) => {
    getUser.mockResolvedValue({ data: { user: null } })
    expect((await call()).status).toBe(401)
  })
})
