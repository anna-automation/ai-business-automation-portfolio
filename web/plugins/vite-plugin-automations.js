/**
 * Sesbírá katalog automatizací ze sousední složky `automations/`.
 *
 * Každá automatizace je samostatná složka, která drží sama sebe:
 *   automations/01-email-triage/
 *     meta.json      ← metadata pro web (povinné)
 *     README.md      ← dokumentace, zobrazí se na detailu (volitelné)
 *     workflow.json  ← n8n export (volitelné)
 *
 * Web si z nich za běhu i při buildu udělá `virtual:automations`.
 * Složku je tak možné vzít a ukázat samostatně — web na ní nic nemění.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../../automations')
const VIRTUAL_ID = 'virtual:automations'
const RESOLVED_ID = '\0' + VIRTUAL_ID

function readCatalog() {
  if (!fs.existsSync(ROOT)) return []

  const entries = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
    .map((d) => d.name)
    .sort()

  const catalog = []

  for (const slug of entries) {
    const dir = path.join(ROOT, slug)
    const metaPath = path.join(dir, 'meta.json')
    if (!fs.existsSync(metaPath)) continue

    let meta
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
    } catch (err) {
      console.warn(`[automations] ${slug}/meta.json se nepodařilo načíst: ${err.message}`)
      continue
    }

    const readmePath = path.join(dir, 'README.md')
    const workflowPath = path.join(dir, 'workflow.json')

    let workflowStats = null
    if (fs.existsSync(workflowPath)) {
      try {
        const wf = JSON.parse(fs.readFileSync(workflowPath, 'utf8'))
        workflowStats = {
          nodes: Array.isArray(wf.nodes) ? wf.nodes.length : 0,
          name: wf.name ?? null,
          nodeTypes: Array.isArray(wf.nodes)
            ? [...new Set(wf.nodes.map((n) => String(n.type ?? '').split('.').pop()))]
            : [],
        }
      } catch {
        workflowStats = null
      }
    }

    catalog.push({
      ...meta,
      slug: meta.slug ?? slug.replace(/^\d+-/, ''),
      dir: slug,
      readme: fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : null,
      hasWorkflow: fs.existsSync(workflowPath),
      workflowStats,
    })
  }

  return catalog
}

export default function automationsPlugin() {
  return {
    name: 'vite-plugin-automations',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    load(id) {
      if (id !== RESOLVED_ID) return
      const catalog = readCatalog()
      return `export const automations = ${JSON.stringify(catalog)}\nexport default automations\n`
    },

    configureServer(server) {
      if (!fs.existsSync(ROOT)) return
      server.watcher.add(path.join(ROOT, '**/*'))
      const reload = (file) => {
        if (!file.startsWith(ROOT)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('change', reload)
      server.watcher.on('unlink', reload)
    },
  }
}
