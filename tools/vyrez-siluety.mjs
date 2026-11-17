/**
 * Vyřízne z předlohy siluetu Anny — odstraní jen fialové pozadí,
 * samotná fotka (barvy, neonová záře ve vlasech) zůstává beze změny.
 *
 * Pozadí se hledá zaplavením od okrajů: co je tmavé, fialové a souvisle
 * napojené na kraj výřezu, je pozadí. Černý svetr tím neprojde, protože je
 * neutrálně tmavý, ne fialový.
 */
// Spouští se z kořene projektu: node tools/vyrez-siluety.mjs [slozka-nahledu]
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SRC = 'pages/kontakt/Moderní neonová kontaktní stránka s Annou.png'
const OUT = 'web/public/media/anna-kontakt.png'
const PREVIEW = process.argv[2]

// Výřez v podílech předlohy. Dole končí nad pásem s ikonami, které jsou
// do předlohy vypálené a nešly by oddělit.
const X1 = 0.297
const X2 = 0.503
const Y1 = 0.135
const Y2 = 0.773

const b64 = fs.readFileSync(SRC).toString('base64')
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 400, height: 300 } })

const res = await page.evaluate(
  async ({ data, X1, X2, Y1, Y2 }) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + data
    await img.decode()

    const sx = Math.round(img.width * X1)
    const sy = Math.round(img.height * Y1)
    const W = Math.round(img.width * (X2 - X1))
    const H = Math.round(img.height * (Y2 - Y1))

    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, sx, sy, W, H, 0, 0, W, H)
    const image = ctx.getImageData(0, 0, W, H)
    const px = image.data

    const jas = (i) => 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]

    /**
     * Pozadí je tmavé a má fialový spád — modrá nad zelenou. Postava je buď
     * světlá (pleť, vlasy), nebo neutrálně tmavá (svetr).
     */
    const jePozadi = (i) => {
      const r = px[i]
      const g = px[i + 1]
      const b = px[i + 2]
      const j = jas(i)
      if (j > 86) return false
      const fialovost = b - g
      return fialovost > 9 && j < 74
    }

    // Zaplavení od okrajů. Spodní hranu vynecháme — tam postava z výřezu
    // vybíhá a zaplavení by jí prošlo dovnitř.
    const stav = new Uint8Array(W * H) // 1 = pozadí
    const fronta = []
    const pridej = (x, y) => {
      const k = y * W + x
      if (stav[k]) return
      if (!jePozadi(k * 4)) return
      stav[k] = 1
      fronta.push(k)
    }
    for (let x = 0; x < W; x++) pridej(x, 0)
    for (let y = 0; y < H; y++) {
      pridej(0, y)
      pridej(W - 1, y)
    }

    while (fronta.length) {
      const k = fronta.pop()
      const y = (k / W) | 0
      const x = k - y * W
      if (x > 0) pridej(x - 1, y)
      if (x < W - 1) pridej(x + 1, y)
      if (y > 0) pridej(x, y - 1)
      if (y < H - 1) pridej(x, y + 1)
    }

    // Měkký okraj: pixel sousedící s pozadím dostane částečnou průhlednost,
    // aby silueta neměla zubatou hranu.
    const alfa = new Uint8ClampedArray(W * H)
    for (let k = 0; k < W * H; k++) alfa[k] = stav[k] ? 0 : 255

    const kopie = Uint8ClampedArray.from(alfa)
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const k = y * W + x
        let suma = 0
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) suma += kopie[k + dy * W + dx]
        alfa[k] = suma / 9
      }
    }

    let odstraneno = 0
    for (let k = 0; k < W * H; k++) {
      px[k * 4 + 3] = alfa[k]
      if (alfa[k] < 128) odstraneno++
    }

    ctx.putImageData(image, 0, 0)

    // Ořez na skutečnou siluetu
    let x1 = W, y1 = H, x2 = -1, y2 = -1
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (px[(y * W + x) * 4 + 3] > 12) {
          if (x < x1) x1 = x
          if (x > x2) x2 = x
          if (y < y1) y1 = y
          if (y > y2) y2 = y
        }
      }
    }
    const w = x2 - x1 + 1
    const h = y2 - y1 + 1
    const k2 = document.createElement('canvas')
    k2.width = w
    k2.height = h
    k2.getContext('2d').drawImage(c, x1, y1, w, h, 0, 0, w, h)

    return {
      vyrez: { W, H },
      odstranenoPct: Math.round((odstraneno / (W * H)) * 100),
      silueta: { w, h, pomer: Math.round((w / h) * 1000) / 1000 },
      dataUrl: k2.toDataURL('image/png'),
    }
  },
  { data: b64, X1, X2, Y1, Y2 }
)

const buf = Buffer.from(res.dataUrl.split(',')[1], 'base64')
fs.writeFileSync(OUT, buf)
console.log(`výřez ${res.vyrez.W}×${res.vyrez.H}, odstraněno pozadí: ${res.odstranenoPct} %`)
console.log(`silueta ${res.silueta.w}×${res.silueta.h} (poměr ${res.silueta.pomer})`)
console.log(`uloženo: ${OUT} (${(buf.length / 1024).toFixed(0)} kB)`)

if (PREVIEW) {
  fs.mkdirSync(PREVIEW, { recursive: true })
  const b = buf.toString('base64')
  const p2 = await browser.newPage({ viewport: { width: 1180, height: 820 } })
  await p2.setContent(
    `<html><body style="margin:0;background:#0a0616;padding:26px;display:flex;gap:30px;font-family:system-ui">
      <div>
        <p style="color:#9a8aa8;font:600 11px system-ui;letter-spacing:.12em;margin:0 0 10px">NA TMAVÉM</p>
        <img src="data:image/png;base64,${b}" style="height:700px">
      </div>
      <div style="background:
          linear-gradient(45deg,#c8c8c8 25%,transparent 25%),
          linear-gradient(-45deg,#c8c8c8 25%,transparent 25%),
          linear-gradient(45deg,transparent 75%,#c8c8c8 75%),
          linear-gradient(-45deg,transparent 75%,#c8c8c8 75%);
          background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;background-color:#fff;padding:10px">
        <p style="color:#333;font:600 11px system-ui;letter-spacing:.12em;margin:0 0 10px">PRŮHLEDNOST</p>
        <img src="data:image/png;base64,${b}" style="height:680px">
      </div>
     </body></html>`,
    { waitUntil: 'load' }
  )
  await p2.waitForTimeout(400)
  await p2.screenshot({ path: path.join(PREVIEW, 'silueta.png') })
  console.log('náhled: silueta.png')
}

await browser.close()
