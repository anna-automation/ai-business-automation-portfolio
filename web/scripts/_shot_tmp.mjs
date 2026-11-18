/** Dočasné: vyfotí routu. */
import { createServer } from 'vite'
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const [OUT, ROUTE = '/'] = process.argv.slice(2)
fs.mkdirSync(OUT, { recursive: true })
const server = await createServer({ server: { port: 5199, open: false, strictPort: true } })
await server.listen()
const browser = await chromium.launch({ executablePath: EDGE, headless: true })

for (const size of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
]) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    isMobile: size.isMobile ?? false,
    hasTouch: size.isMobile ?? false,
    reducedMotion: 'no-preference',
  })
  const chyby = []
  page.on('pageerror', (e) => chyby.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && chyby.push(m.text()))
  await page.addInitScript(() => { try { localStorage.setItem('abl-cookies', 'all') } catch {} })
  await page.goto(`http://localhost:5199${ROUTE}`, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 90))
    }
  })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: path.join(OUT, `${size.name}-full.png`), fullPage: true })
  console.log(`✓ ${size.name} ${size.width}${chyby.length ? '  CHYBY: ' + chyby.slice(0, 2).join(' | ').slice(0, 200) : ''}`)
  await page.close()
}
await browser.close()
await server.close()
