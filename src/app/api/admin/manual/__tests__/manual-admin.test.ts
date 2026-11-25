import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getUser, adminClient, inviteUserByEmail, revalidateTag } = vi.hoisted(() => ({
  getUser: vi.fn(),
  adminClient: vi.fn(),
  inviteUserByEmail: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  createAdminClient: adminClient,
}))
vi.mock('next/cache', () => ({ revalidateTag }))

import { GET as readersGET, POST as readersPOST, DELETE as readersDELETE } from '../readers/route'
import { GET as commentsGET } from '../comments/route'
import { DELETE as commentDELETE } from '../comments/[id]/route'
import { POST as refreshPOST } from '../refresh/route'

const URL_BASE = 'https://sitio.test/api/admin/manual/readers'
const post = (body: unknown) =>
  new Request(URL_BASE, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
const ctx = { params: Promise.resolve({ id: 'c1' }) }

function asAdmin() {
  process.env.ADMIN_EMAILS = 'admin@site.com'
  getUser.mockResolvedValue({ data: { user: { id: 'a', email: 'admin@site.com' } } })
}

describe('rutas /api/admin/manual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('responde 403 a un usuario que no es admin', async () => {
    process.env.ADMIN_EMAILS = 'admin@site.com'
    getUser.mockResolvedValue({ data: { user: { id: 'u', email: 'otro@x.com' } } })
    const res = [
      await readersGET(),
      await readersPOST(post({ email: 'a@b.com', name: 'A' })),
      await readersDELETE(new Request(URL_BASE + '?email=a@b.com', { method: 'DELETE' })),
      await commentsGET(),
      await commentDELETE(new Request('http://x', { method: 'DELETE' }), ctx),
      await refreshPOST(),
    ]
    expect(res.map(r => r.status)).toEqual([403, 403, 403, 403, 403, 403])
    expect(adminClient).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  describe('POST readers', () => {
    let upsert: ReturnType<typeof vi.fn>
    beforeEach(() => {
      asAdmin()
      upsert = vi.fn().mockResolvedValue({ error: null })
      inviteUserByEmail.mockResolvedValue({ error: null })
      adminClient.mockReturnValue({
        from: vi.fn(() => ({ upsert })),
        auth: { admin: { inviteUserByEmail } },
      })
    })

    it('normaliza el correo, guarda y envía la invitación con el origen de la petición', async () => {
      const res = await readersPOST(post({ email: ' Ana@Mail.com ', name: ' Ana ', note: 'amiga' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: true })
      expect(upsert).toHaveBeenCalledWith(
        { email: 'ana@mail.com', name: 'Ana', note: 'amiga' },
        { onConflict: 'email' },
      )
      expect(inviteUserByEmail).toHaveBeenCalledWith('ana@mail.com', {
        redirectTo: 'https://sitio.test/auth/callback?next=/es/manual-de-usuario/mapa',
      })
    })

    it('400 sin name', async () => {
      const res = await readersPOST(post({ email: 'a@b.com' }))
      expect(res.status).toBe(400)
      expect(upsert).not.toHaveBeenCalled()
    })

    it('400 con correo inválido', async () => {
      const res = await readersPOST(post({ email: 'nope', name: 'A' }))
      expect(res.status).toBe(400)
    })

    it('si ya está registrado responde existed:true sin error', async () => {
      inviteUserByEmail.mockResolvedValue({
        error: { message: 'A user with this email address has already been registered', code: 'email_exists' },
      })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: false, existed: true })
    })

    it('otro error de invitación responde 200 con error:invite y deja el lector', async () => {
      inviteUserByEmail.mockResolvedValue({ error: { message: 'smtp caído' } })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: false, error: 'invite' })
      expect(upsert).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
    })

    it('500 si falla el upsert', async () => {
      upsert.mockResolvedValue({ error: { message: 'x' } })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(500)
      expect(inviteUserByEmail).not.toHaveBeenCalled()
    })
  })

  it('DELETE readers borra por correo normalizado', async () => {
    asAdmin()
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn(() => ({ eq }))
    adminClient.mockReturnValue({ from: vi.fn(() => ({ delete: del })) })
    const res = await readersDELETE(new Request(URL_BASE + '?email=%20Ana@Mail.com', { method: 'DELETE' }))
    expect(res.status).toBe(200)
    expect(eq).toHaveBeenCalledWith('email', 'ana@mail.com')
  })

  it('DELETE readers sin email → 400', async () => {
    asAdmin()
    const res = await readersDELETE(new Request(URL_BASE, { method: 'DELETE' }))
    expect(res.status).toBe(400)
  })

  it('GET comments pide los últimos 50', async () => {
    asAdmin()
    const limit = vi.fn().mockResolvedValue({ data: [{ id: 'c1' }], error: null })
    const order = vi.fn(() => ({ limit }))
    const select = vi.fn(() => ({ order }))
    adminClient.mockReturnValue({ from: vi.fn(() => ({ select })) })
    const res = await commentsGET()
    expect(await res.json()).toEqual({ comments: [{ id: 'c1' }] })
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(limit).toHaveBeenCalledWith(50)
  })

  it('DELETE comments/[id] borra por id', async () => {
    asAdmin()
    const eq = vi.fn().mockResolvedValue({ error: null })
    adminClient.mockReturnValue({ from: vi.fn(() => ({ delete: () => ({ eq }) })) })
    const res = await commentDELETE(new Request('http://x', { method: 'DELETE' }), ctx)
    expect(res.status).toBe(200)
    expect(eq).toHaveBeenCalledWith('id', 'c1')
  })

  it('refresh llama a revalidateTag("manual")', async () => {
    asAdmin()
    const res = await refreshPOST()
    expect(res.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith('manual', expect.anything())
  })
})
