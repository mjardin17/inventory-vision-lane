import { createFileRoute } from '@tanstack/react-router'

/**
 * Home route (/). A neutral, FULL-BLEED starting point — no app chrome, no
 * sidebar. Replace this body with your real landing page or app home.
 *
 * Add more pages as files under `src/routes/` (e.g. `src/routes/about.tsx`
 * → /about). The HTML document + providers live once in `__root.tsx`.
 *
 * Building a SaaS / dashboard app? The sidebar shell already exists at
 * `src/routes/app.tsx` with its home at `src/routes/app/index.tsx` (→ /app) — add
 * your pages as files in `src/routes/app/`. Do NOT create a `src/routes/_app.tsx`:
 * a `_`-prefixed layout is PATHLESS, so `_app/index.tsx` resolves to `/` and
 * collides with THIS file (build fails: "Conflicting configuration paths").
 * Dashboard-only product? Keep this file and redirect it to `/app`.
 * Landing pages, marketing sites, content, and games stay full-bleed (default) —
 * delete `src/routes/app.tsx` + `src/routes/app/` if you don't need a dashboard.
 *
 * SEO: set per-page title/description/Open Graph here in `head()`.
 *
 * SSR / routing (this template is server-rendered — TanStack Start):
 * - Routes are files under `src/routes/` that `export const Route =
 *   createFileRoute('/path')({ component })`. NEVER `export default` a route.
 *   Navigate with `Link` from `@tanstack/react-router` (there is no `NavLink`).
 * - Reading Blink auth/SDK state (`blink.auth`), `localStorage`, or `window` at
 *   render CRASHES SSR / hydration-mismatches and ships a blank first page. Wrap
 *   that subtree in `<BlinkClientBoundary fallback={…}>` (from
 *   `@/components/BlinkClientBoundary`) — wrap the whole tree if the entire page
 *   needs the browser. Keep static content outside the boundary. Do NOT use the
 *   route's `ssr: false`: a client-only route in this template hits Start's
 *   server-context `node:async_hooks` path (a throwing browser stub) and ships a
 *   BLANK preview ("AsyncLocalStorage is not a constructor").
 */
export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Inventory Vision Lane' },
      { name: 'description', content: 'General inventory intake and ordered review.' },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Inventory Vision Lane</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">From photo to ready-to-list.</h1>
        <p className="mt-3 text-muted-foreground">General items now move through the same deliberate Joshua approval gate as the card lane.</p>
      </div>
      <a href="/app/inventory" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5">Open intake lanes</a>
    </main>
  )
}
