/* Post-build SEO: para cada informe del registro genera dist/<ruta>/index.html
   con title, description, canonical y OG/Twitter propios, e inyecta un
   fallback semántico (h1 + bajada) dentro de #root para crawlers sin JS.
   Además genera sitemap.xml y rss.xml.

   Vercel sirve archivos del filesystem antes de aplicar el rewrite SPA,
   así que /informes/<id> entrega su HTML propio y el resto cae en index.html. */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { INFORMES, RUTAS_ESTATICAS, SITE_URL, SITE_NAME, SITE_DESC } from '../src/lib/informesRegistry.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const base = readFileSync(join(DIST, 'index.html'), 'utf8')

function conMeta(html, { titulo, descripcion, url, tipo = 'article', fecha }) {
  let out = html
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titulo)}</title>`)
  out = out.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${esc(descripcion)}" />`)
  out = out.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${esc(titulo)}" />`)
  out = out.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${esc(descripcion)}" />`)
  out = out.replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
  out = out.replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${tipo}" />`)
  out = out.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${esc(titulo)}" />`)
  out = out.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${esc(descripcion)}" />`)
  // canonical + article metadata antes de </head>
  let extra = `    <link rel="canonical" href="${url}" />\n`
  if (tipo === 'article' && fecha) {
    extra += `    <meta property="article:published_time" content="${fecha}" />\n`
  }
  out = out.replace('</head>', extra + '  </head>')
  return out
}

function conFallback(html, { titulo, descripcion }) {
  /* Contenido semántico visible hasta que React monta: útil para crawlers
     sin JS y para la primera pintura. React lo reemplaza al montar. */
  const fallback = `<div style="max-width:68ch;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif"><h1 style="font-size:1.6rem;line-height:1.2;color:#0F172A">${esc(titulo)}</h1><p style="color:#3F4A5A;line-height:1.6">${esc(descripcion)}</p></div>`
  return html.replace(/(<div id="root">)(<\/div>)/, `$1${fallback}$2`)
}

let generados = 0
for (const inf of INFORMES) {
  const url = SITE_URL + inf.path
  let html = conMeta(base, { titulo: `${inf.titulo} — ${SITE_NAME}`, descripcion: inf.descripcion, url, fecha: inf.fecha })
  html = conFallback(html, inf)
  const dir = join(DIST, ...inf.path.split('/').filter(Boolean))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
  generados++
}

/* Shells con title/canonical propios para las rutas estáticas (menos '/'). */
for (const r of RUTAS_ESTATICAS.filter(r => r.path !== '/')) {
  const url = SITE_URL + r.path
  const html = conMeta(base, { titulo: r.titulo, descripcion: SITE_DESC, url, tipo: 'website' })
  const dir = join(DIST, ...r.path.split('/').filter(Boolean))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
  generados++
}

/* ── sitemap.xml ── */
const hoy = new Date().toISOString().slice(0, 10)
const urls = [
  ...RUTAS_ESTATICAS.map(r => ({ loc: SITE_URL + r.path, lastmod: hoy })),
  ...INFORMES.map(i => ({ loc: SITE_URL + i.path, lastmod: i.fecha })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)

/* ── rss.xml ── */
const items = [...INFORMES]
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .map(i => `    <item>
      <title>${esc(i.titulo)}</title>
      <link>${SITE_URL + i.path}</link>
      <guid isPermaLink="true">${SITE_URL + i.path}</guid>
      <description>${esc(i.descripcion)}</description>
      <category>${esc(i.tema)}</category>
      <pubDate>${new Date(i.fecha + 'T12:00:00-03:00').toUTCString()}</pubDate>
    </item>`)
  .join('\n')
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Informes</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE_DESC)}</description>
    <language>es-AR</language>
${items}
  </channel>
</rss>
`
writeFileSync(join(DIST, 'rss.xml'), rss)

console.log(`[postbuild-seo] ${generados} shells HTML + sitemap.xml (${urls.length} urls) + rss.xml (${INFORMES.length} items)`)
