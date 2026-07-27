import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { INFORMES, RUTAS_ESTATICAS, SITE_NAME } from '@/lib/informesRegistry'

/* Mantiene el <title> correcto al navegar dentro de la SPA.
   En la carga inicial el title ya viene correcto en el HTML estático
   generado por scripts/postbuild-seo.mjs. */
export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const informe = INFORMES.find(i => i.path === pathname)
    const ruta = RUTAS_ESTATICAS.find(r => r.path === pathname)
    document.title = informe
      ? `${informe.titulo} — ${SITE_NAME}`
      : ruta
        ? ruta.titulo
        : `${SITE_NAME} — Periodismo de datos sobre la provincia de Buenos Aires`
  }, [pathname])

  return null
}
