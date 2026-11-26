import { describe, it, expect, vi, beforeEach } from 'vitest'

const { getUser, adminClient, createUser, revalidateTag, sendManualInvitation } = vi.hoisted(() => ({
  getUser: vi.fn(),
  adminClient: vi.fn(),
  createUser: vi.fn(),
  revalidateTag: vi.fn(),
  sendManualInvitation: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
  createAdminClient: adminClient,
}))
vi.mock('next/cache', () => ({ revalidateTag }))
vi.mock('@/lib/resend', () => ({ sendManualInvitation }))

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
      createUser.mockResolvedValue({ error: null })
      sendManualInvitation.mockResolvedValue(undefined)
      adminClient.mockReturnValue({
        from: vi.fn(() => ({ upsert })),
        auth: { admin: { createUser } },
      })
    })

    it('guarda normalizado, crea la cuenta y envía el correo propio con enlace fijo', async () => {
      const res = await readersPOST(post({ email: ' Ana@Mail.com ', name: ' Ana ', note: 'amiga' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: true, existed: false })
      expect(upsert).toHaveBeenCalledWith(
        { email: 'ana@mail.com', name: 'Ana', note: 'amiga' },
        { onConflict: 'email' },
      )
      expect(createUser).toHaveBeenCalledWith({ email: 'ana@mail.com', email_confirm: true })
      expect(sendManualInvitation).toHaveBeenCalledWith({ to: 'ana@mail.com', name: 'Ana' })
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

    it('si la cuenta ya existe igual envía el correo y responde existed:true', async () => {
      createUser.mockResolvedValue({
        error: { message: 'A user with this email address has already been registered', code: 'email_exists' },
      })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: true, existed: true })
      expect(sendManualInvitation).toHaveBeenCalledWith({ to: 'a@b.com', name: 'A' })
    })

    it('otro error de createUser responde error:cuenta, sin correo, y deja el lector', async () => {
      createUser.mockResolvedValue({ error: { message: 'db caída' } })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: false, error: 'cuenta' })
      expect(sendManualInvitation).not.toHaveBeenCalled()
      expect(upsert).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalled()
    })

    it('si falla el correo responde error:correo', async () => {
      sendManualInvitation.mockRejectedValue(new Error('resend caído'))
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ invited: false, error: 'correo' })
      expect(console.error).toHaveBeenCalled()
    })

    it('500 si falla el upsert', async () => {
      upsert.mockResolvedValue({ error: { message: 'x' } })
      const res = await readersPOST(post({ email: 'a@b.com', name: 'A' }))
      expect(res.status).toBe(500)
      expect(createUser).not.toHaveBeenCalled()
      expect(sendManualInvitation).not.toHaveBeenCalled()
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
