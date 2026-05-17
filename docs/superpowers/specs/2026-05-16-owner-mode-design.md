# Owner Mode — Design Spec

**Date:** 2026-05-16
**Status:** Approved

---

## Overview

Add a login button to the public site nav. When authenticated (Sergio only), a dropdown shows admin links and a sign-out button. On `/biblioteca`, each book card shows an edit-notes button visible only to the authenticated owner.

---

## Architecture

### Nav (server → client split)

`Nav.tsx` becomes async and reads auth state server-side via `createClient()`. It passes `isLoggedIn: boolean` to a new `UserMenu` client component placed after `LocaleSwitcher`.

```
Nav (async server component)
  ├─ reads auth: const { data: { user } } = await (await createClient()).auth.getUser()
  └─ <UserMenu isLoggedIn={!!user} />
```

### UserMenu (new client component)

`src/components/UserMenu.tsx` — handles the dropdown toggle state.

**Unauthenticated state:**
- A small `›_` icon/link → navigates to `/admin/login`
- Styled: `font-mono text-xs text-text-muted hover:text-accent`

**Authenticated state:**
- Green dot indicator (●) — signals "modo editor" 
- Clicking opens a dropdown panel:
  - Label: `// modo editor` in `text-accent font-mono text-xs`
  - Link: `Admin →` → `/admin`
  - Link: `Biblioteca →` → `/admin/biblioteca`  
  - Link: `Comentarios →` → `/admin/comments`
  - Button: `Cerrar sesión` → calls `supabase.auth.signOut()` then `router.refresh()`
- Clicking the green dot again closes the dropdown
- Click outside closes the dropdown (useEffect with document listener)

### Biblioteca owner mode

`BibliotecaPage` server component reads auth state and passes `isOwner: boolean` to `BookList`.

```tsx
const { data: { user } } = await (await createClient()).auth.getUser()
<BookList books={books} locale={locale} isOwner={!!user} />
```

`BookList` accepts `isOwner?: boolean` and passes it to each `BookCard`.

`BookCard` accepts `isOwner?: boolean`. When true, renders a small edit link overlaid on the card:

```tsx
{isOwner && (
  <Link
    href={`/admin/biblioteca/${book.id}/notes?title=${encodeURIComponent(book.title)}`}
    className="absolute top-2 right-2 font-mono text-[9px] text-text-muted hover:text-accent transition-colors"
    onClick={e => e.stopPropagation()}
  >
    ✎
  </Link>
)}
```

BookCard's outer `<Link>` needs `relative` className for the absolute positioning.

---

## Files Changed

| Action | File | Change |
|--------|------|--------|
| Modify | `src/components/Nav.tsx` | Add async, auth check, render UserMenu |
| Create | `src/components/UserMenu.tsx` | Dropdown client component |
| Modify | `src/components/BookCard.tsx` | Accept isOwner, render ✎ link |
| Modify | `src/components/BookList.tsx` | Accept + pass isOwner |
| Modify | `src/app/[locale]/biblioteca/page.tsx` | Read auth, pass isOwner |

---

## Auth Pattern

`createClient()` from `@/lib/supabase/server` is async (returns a cookie-based client). Pattern:

```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

This is already the pattern used in all API routes. The middleware already handles session refresh on every request, so no session staleness issue.

---

## Sign Out

`UserMenu` calls:
```ts
const supabase = createClient() // browser client from @/lib/supabase/client
await supabase.auth.signOut()
router.refresh() // Next.js router refresh to re-render server components
```

This invalidates the session cookie and triggers a full server re-render, causing Nav to re-read auth state (now null) and show the unauthenticated state.

---

## Testing

No unit tests — this is pure UI component work. Manual verification:
- Not logged in: see `›_` icon in nav
- Click → `/admin/login` → magic link → authenticated
- See green dot in nav, dropdown with admin links
- Visit /biblioteca → ✎ icons on cards
- Click ✎ → /admin/biblioteca/[id]/notes
- Sign out → green dot disappears, ✎ icons disappear

---

## Out of Scope

- OAuth login (magic link only)
- Multiple user roles
- Inline note editing directly in the public page
