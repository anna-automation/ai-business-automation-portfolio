import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './components/landing/landing.css'
import LandingHeader from './components/landing/LandingHeader.jsx'
import LandingFooter from './components/landing/LandingFooter.jsx'
import { Backdrop } from './components/landing/parts.jsx'
import CookieBar from './components/layout/CookieBar.jsx'
import CommandPalette from './components/layout/CommandPalette.jsx'
import { CustomCursor, ScrollProgress } from './components/layout/Chrome.jsx'
import { usePrefs } from './lib/prefs.jsx'
import { posunNaPrvek } from './lib/scroll.js'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.jsx'))
const AutomationsPage = lazy(() => import('./pages/AutomationsPage.jsx'))
const AutomationDetailPage = lazy(() => import('./pages/AutomationDetailPage.jsx'))
const AudiencesPage = lazy(() => import('./pages/AudiencesPage.jsx'))
const LearningPage = lazy(() => import('./pages/LearningPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const LegalPage = lazy(() => import('./pages/LegalPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

/** Po přechodu na jinou stránku začínáme nahoře — kromě odkazů s #kotvou. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        posunNaPrvek(el)
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function PageShell({ children }) {
  const { reducedMotion } = usePrefs()
  const location = useLocation()

  if (reducedMotion) return <div key={location.pathname}>{children}</div>

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<HomePage />} />
      <Route path="/ukazky" element={<ProductsPage />} />
      <Route path="/ukazky/:slug" element={<ProductDetailPage />} />
      <Route path="/automatizace" element={<AutomationsPage />} />
      <Route path="/automatizace/:slug" element={<AutomationDetailPage />} />
      <Route path="/pro-koho" element={<AudiencesPage />} />
      <Route path="/skoleni" element={<LearningPage />} />
      <Route path="/o-mne" element={<AboutPage />} />
      <Route path="/kontakt" element={<ContactPage />} />
      <Route path="/ochrana-osobnich-udaju" element={<LegalPage doc="privacy" />} />
      <Route path="/podminky" element={<LegalPage doc="terms" />} />
      <Route path="/cookies" element={<LegalPage doc="cookies" />} />
      <Route path="/pristupnost" element={<LegalPage doc="accessibility" />} />
      <Route path="/odstoupeni-od-smlouvy" element={<LegalPage doc="withdrawal" />} />
      <Route path="/bezpecnost-ai" element={<LegalPage doc="security" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function RouteLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="size-7 animate-spin rounded-full border-2 border-line border-t-accent" />
        <span className="label-mono">Načítám</span>
      </div>
    </div>
  )
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()

  // Celý web běží v jednom světě: tmavé pozadí, neonová hlavička i patička.
  // Stránky, které si nesou vlastní úvodní blok, jen nedostanou odsazení
  // shora — hlavičku pod sebou řeší samy ve svém hero.
  const VLASTNI_HERO = ['/', '/kontakt', '/ukazky']
  const vlastniHero = VLASTNI_HERO.includes(location.pathname)
  const uvodka = location.pathname === '/'

  useEffect(() => {
    document.documentElement.dataset.landing = 'on'
  }, [])

  // Ctrl/Cmd + K otevře vyhledávání odkudkoliv.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
      >
        Přeskočit na obsah
      </a>

      <ScrollProgress />
      <CustomCursor />
      <ScrollManager />

      <div className="lp relative min-h-screen">
        <Backdrop />
        <LandingHeader onOpenPalette={() => setPaletteOpen(true)} />

        <main id="obsah" className={vlastniHero ? undefined : 'relative z-10 pt-28 lg:pt-32'}>
          <Suspense fallback={<RouteLoader />}>
            {/* Úvodka jde mimo přechodovou animaci — AnimatePresence s ní exit
                nedokončí a další stránka se pak nevykreslí. */}
            {uvodka ? (
              <AppRoutes location={location} />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <PageShell key={location.pathname}>
                  <AppRoutes location={location} />
                </PageShell>
              </AnimatePresence>
            )}
          </Suspense>
        </main>

        <LandingFooter />
      </div>

      <CookieBar />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
