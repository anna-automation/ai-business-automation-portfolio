/**
 * Smoke test: vyrenderuje každou routu webu přes Vite SSR a nahlásí chyby.
 * Zachytí chyby ve fázi renderu — nejčastější typ (chybný import, špatné API,
 * překlep v propu). Efekty se v SSR nespouští, takže animace netestuje.
 */
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// --- minimální prohlížečové prostředí ---
const store = new Map()
const listeners = []

function makeMediaQuery(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: (_, fn) => listeners.push(fn),
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }
}

const documentElement = {
  dataset: { theme: 'dark' },
  lang: 'cs',
  scrollHeight: 3000,
  clientHeight: 800,
  style: { setProperty: () => {}, getPropertyValue: () => '' },
  querySelector: () => null,
  classList: { add: () => {}, remove: () => {}, contains: () => false },
}

globalThis.window = {
  innerWidth: 1440,
  innerHeight: 900,
  scrollY: 0,
  devicePixelRatio: 1,
  matchMedia: makeMediaQuery,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  requestAnimationFrame: (fn) => setTimeout(() => fn(performance.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  location: { pathname: '/', hash: '', search: '', href: 'http://localhost/' },
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  IntersectionObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
}

globalThis.document = {
  documentElement,
  body: { style: {}, appendChild: () => {}, removeChild: () => {} },
  title: '',
  hidden: false,
  head: { appendChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    getContext: () => null,
    setAttribute: () => {},
    appendChild: () => {},
    width: 0,
    height: 0,
  }),
  createTextNode: () => ({}),
}

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
}
globalThis.sessionStorage = globalThis.localStorage
// Node 24 má navigator jako getter — doplníme jen to, co chybí.
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { userAgent: 'node', clipboard: { writeText: async () => {} } },
})
globalThis.matchMedia = makeMediaQuery
globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame
globalThis.cancelAnimationFrame = globalThis.window.cancelAnimationFrame
globalThis.ResizeObserver = globalThis.window.ResizeObserver
globalThis.IntersectionObserver = globalThis.window.IntersectionObserver
globalThis.getComputedStyle = globalThis.window.getComputedStyle
globalThis.Node = class {}
globalThis.Element = class extends globalThis.Node {}
globalThis.HTMLElement = class extends globalThis.Element {}
globalThis.SVGElement = class extends globalThis.Element {}
globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
}
globalThis.performance = globalThis.performance ?? { now: () => 0 }

/**
 * Stránky se renderují přímo, ne přes <App>. Routy v App jsou `lazy()` a SSR
 * by u nich vrátil jen Suspense fallback — testovalo by se tedy jen okolí.
 * `route` nastaví adresu v MemoryRouteru, aby useParams dostal správný slug.
 */
const PAGES = [
  { file: 'HomePage', route: '/' },
  { file: 'ProductsPage', route: '/ukazky' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/automatizacni-workflow' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/trideni-emailu' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/jednoduche-crm' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/cenova-kalkulacka' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/rezervacni-kalendar' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/zpracovani-dokumentu' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/generovani-nabidek' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/ai-asistent' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/sprava-ukolu' },
  { file: 'ProductDetailPage', route: '/ukazky/:slug', at: '/ukazky/zivy-report' },
  { file: 'AutomationsPage', route: '/automatizace' },
  { file: 'AudiencesPage', route: '/pro-koho' },
  { file: 'LearningPage', route: '/skoleni' },
  { file: 'AboutPage', route: '/o-mne' },
  { file: 'ContactPage', route: '/kontakt' },
  { file: 'LegalPage', route: '/ochrana-osobnich-udaju', props: { doc: 'privacy' } },
  { file: 'LegalPage', route: '/podminky', props: { doc: 'terms' } },
  { file: 'LegalPage', route: '/cookies', props: { doc: 'cookies' } },
  { file: 'LegalPage', route: '/pristupnost', props: { doc: 'accessibility' } },
  { file: 'LegalPage', route: '/odstoupeni-od-smlouvy', props: { doc: 'withdrawal' } },
  { file: 'LegalPage', route: '/bezpecnost-ai', props: { doc: 'security' } },
  { file: 'NotFoundPage', route: '/neexistujici-stranka' },
]

const DEMOS = [
  'WorkflowDemo',
  'InboxDemo',
  'CrmDemo',
  'CalculatorDemo',
  'BookingDemo',
  'DocumentsDemo',
  'QuoteDemo',
  'AssistantDemo',
  'TasksDemo',
  'DashboardDemo',
]

const server = await createServer({
  root: ROOT,
  configFile: path.join(ROOT, 'vite.config.js'),
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
})

let failures = 0
const warnings = []

// Reactí varování chceme vidět, ale nesmí shodit běh.
const origError = console.error
console.error = (...args) => {
  const text = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ')
  if (/Warning|validateDOMNesting|cannot appear|Each child/.test(text)) {
    warnings.push(text.slice(0, 220))
    return
  }
  origError(...args)
}

/**
 * Projde vyrenderované HTML a vrátí seznam nálezů.
 *
 * Kód a ukázky se z kontroly vyřadí — README automatizací o `NaN` a
 * `undefined` legitimně píše jako o věcech, které je potřeba ošetřit.
 */
function inspect(html, minSize) {
  const prose = html
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<code[\s\S]*?<\/code>/g, '')

  const problems = []
  if (/undefined/.test(prose)) problems.push('obsahuje "undefined"')
  if (/\bNaN\b/.test(prose)) problems.push('obsahuje "NaN"')
  if (/\[object Object\]/.test(prose)) problems.push('obsahuje "[object Object]"')
  if (/\{"cs":/.test(prose)) problems.push('nepřeložený objekt {cs,en} v textu')
  if (html.length < minSize) problems.push(`podezřele krátké (${html.length} B)`)
  return problems
}

try {
  // React a router musí jít nativním importem — Vite by je zkusil
  // vyhodnotit jako ESM a spadl na CJS wrapperu.
  const React = (await import('react')).default
  const { renderToString } = await import('react-dom/server')
  const { StaticRouter } = await import('react-router-dom/server.js')
  const { Route, Routes } = await import('react-router-dom')
  const App = (await server.ssrLoadModule('/src/App.jsx')).default
  const { PrefsProvider } = await server.ssrLoadModule('/src/lib/prefs.jsx')
  const { ToastProvider } = await server.ssrLoadModule('/src/lib/toast.jsx')

  /**
   * Obalí komponentu kontextem, který web potřebuje, a vyrenderuje ji.
   * `path` je povinná u stránek čtoucích useParams — mimo <Route> by jim
   * router nepředal slug a ony by správně spadly na 404.
   */
  const render = (element, at, path) =>
    renderToString(
      React.createElement(
        PrefsProvider,
        null,
        React.createElement(
          ToastProvider,
          null,
          React.createElement(
            StaticRouter,
            { location: at },
            path
              ? React.createElement(
                  Routes,
                  null,
                  React.createElement(Route, { path, element })
                )
              : element
          )
        )
      )
    )

  // --- 1. celý layout ---
  console.log('— layout —')
  try {
    const html = render(React.createElement(App), '/')
    const problems = inspect(html, 2500)
    if (problems.length) {
      failures++
      console.log(`⚠ App shell — ${problems.join(', ')}`)
    } else {
      console.log(`✓ App shell (hlavička, patička, cookie lišta) ${(html.length / 1024).toFixed(0)} kB`)
    }
  } catch (err) {
    failures++
    console.log(`✗ App shell\n   ${err.stack?.split('\n').slice(0, 4).join('\n   ')}`)
  }

  // --- 2. stránky, renderované přímo (obcházíme lazy + Suspense) ---
  console.log('\n— stránky —')
  for (const page of PAGES) {
    const at = page.at ?? page.route
    try {
      const mod = await server.ssrLoadModule(`/src/pages/${page.file}.jsx`)
      if (typeof mod.default !== 'function') {
        failures++
        console.log(`✗ ${page.file}: chybí default export funkce`)
        continue
      }

      const html = render(
        React.createElement(mod.default, page.props ?? null),
        at,
        page.route
      )
      // Detail, který spadl na 404, poznáme podle textu — to je skrytá chyba.
      const problems = inspect(html, 1800)
      if (page.at && /nedostal se k automatizaci|404/.test(html)) {
        problems.push('vyrenderovalo se 404 místo detailu')
      }

      if (problems.length) {
        failures++
        console.log(`⚠ ${at} (${page.file}) — ${problems.join(', ')}`)
      } else {
        console.log(`✓ ${at.padEnd(34)} ${(html.length / 1024).toFixed(0).padStart(3)} kB  ${page.file}`)
      }
    } catch (err) {
      failures++
      console.log(`✗ ${at} (${page.file})\n   ${err.stack?.split('\n').slice(0, 4).join('\n   ')}`)
    }
  }

  // --- 3. dema v obou režimech ---
  console.log('\n— interaktivní ukázky —')
  for (const demo of [...DEMOS, 'BeforeAfter']) {
    try {
      const mod = await server.ssrLoadModule(`/src/components/demos/${demo}.jsx`)
      if (typeof mod.default !== 'function') {
        failures++
        console.log(`✗ ${demo}: chybí default export funkce`)
        continue
      }

      // BeforeAfter čeká obsah v propech, ne prázdno.
      const extra =
        demo === 'BeforeAfter'
          ? { before: React.createElement('div', null, 'před'), after: React.createElement('div', null, 'po') }
          : {}

      const sizes = []
      for (const compact of [false, true]) {
        const html = render(
          React.createElement(mod.default, { compact, ...extra }),
          '/ukazky'
        )
        const problems = inspect(html, 200)
        if (problems.length) {
          failures++
          console.log(`⚠ ${demo} (${compact ? 'compact' : 'plné'}) — ${problems.join(', ')}`)
        } else {
          sizes.push(`${compact ? 'compact' : 'plné'} ${(html.length / 1024).toFixed(0)} kB`)
        }
      }
      if (sizes.length === 2) console.log(`✓ ${demo.padEnd(18)} ${sizes.join(' · ')}`)
    } catch (err) {
      failures++
      console.log(`✗ ${demo}\n   ${err.stack?.split('\n').slice(0, 4).join('\n   ')}`)
    }
  }

  // --- 4. detail automatizace pro každou složku v katalogu ---
  console.log('\n— katalog automatizací —')
  try {
    const catalog = (await server.ssrLoadModule('virtual:automations')).default
    const detail = (await server.ssrLoadModule('/src/pages/AutomationDetailPage.jsx')).default

    if (catalog.length === 0) {
      console.log('  (katalog je prázdný — žádná složka s meta.json)')
    }

    for (const item of catalog) {
      try {
        const html = render(
          React.createElement(detail),
          `/automatizace/${item.slug}`,
          '/automatizace/:slug'
        )
        const problems = inspect(html, 1800)
        if (/404/.test(html)) problems.push('vyrenderovalo se 404 místo detailu')
        if (problems.length) {
          failures++
          console.log(`⚠ ${item.dir} — ${problems.join(', ')}`)
        } else {
          console.log(
            `✓ ${item.dir.padEnd(36)} ${(html.length / 1024).toFixed(0).padStart(3)} kB  ` +
              `${item.hasWorkflow ? `${item.workflowStats?.nodes ?? '?'} nodů` : 'bez workflow'}`
          )
        }
      } catch (err) {
        failures++
        console.log(`✗ ${item.dir}\n   ${err.stack?.split('\n').slice(0, 3).join('\n   ')}`)
      }
    }
  } catch (err) {
    failures++
    console.log(`✗ katalog\n   ${err.message.split('\n')[0]}`)
  }
} finally {
  console.error = origError
  await server.close()
}

if (warnings.length) {
  console.log(`\n--- React varování (${warnings.length}) ---`)
  for (const w of [...new Set(warnings)].slice(0, 12)) console.log(`  • ${w}`)
}

console.log(failures === 0 ? '\nVŠE PROŠLO' : `\nSELHÁNÍ: ${failures}`)
process.exit(failures === 0 ? 0 : 1)
