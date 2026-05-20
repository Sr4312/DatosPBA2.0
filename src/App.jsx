import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LazyMotion, domAnimation } from 'framer-motion'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'

const Home            = lazy(() => import('./pages/Home'))
const Informes        = lazy(() => import('./pages/Informes'))
const Datos           = lazy(() => import('./pages/Datos'))
const Hilos           = lazy(() => import('./pages/Hilos'))
const ReportesRapidos = lazy(() => import('./pages/ReportesRapidos'))
const InformeDetalle  = lazy(() => import('./pages/InformeDetalle'))
const InformeKPMGIIBB         = lazy(() => import('./pages/InformeKPMGIIBB'))
const InformeCAFEstadoMunicipal = lazy(() => import('./pages/InformeCAFEstadoMunicipal'))
const InformeRENABAP          = lazy(() => import('./pages/InformeRENABAP'))
const InformeSaludConurbano   = lazy(() => import('./pages/InformeSaludConurbano'))
const InformeMineriaPBA       = lazy(() => import('./pages/InformeMineriaPBA'))
const InformeMedicamentosTISH   = lazy(() => import('./pages/InformeMedicamentosTISH'))
const InformeAgroindustriaPBA   = lazy(() => import('./pages/InformeAgroindustriaPBA'))
const InformeEmpleoPblicoPBA    = lazy(() => import('./pages/InformeEmpleoPblicoPBA'))
const Beta            = lazy(() => import('./pages/Beta'))
const QuienesSomos    = lazy(() => import('./pages/QuienesSomos'))

export default function App() {
  return (
    <LazyMotion features={domAnimation}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Suspense fallback={null}><Home /></Suspense>} />
            <Route path="informes" element={<Suspense fallback={null}><Informes /></Suspense>} />
            <Route path="informes/kpmg-iibb-2025" element={<Suspense fallback={null}><InformeKPMGIIBB /></Suspense>} />
            <Route path="informes/caf-estado-municipal-pba" element={<Suspense fallback={null}><InformeCAFEstadoMunicipal /></Suspense>} />
            <Route path="informes/renabap-pba-2026" element={<Suspense fallback={null}><InformeRENABAP /></Suspense>} />
            <Route path="informes/salud-conurbano-pec-2026" element={<Suspense fallback={null}><InformeSaludConurbano /></Suspense>} />
            <Route path="informes/mineria-pba-2025" element={<Suspense fallback={null}><InformeMineriaPBA /></Suspense>} />
            <Route path="informes/medicamentos-tish-pba-2025" element={<Suspense fallback={null}><InformeMedicamentosTISH /></Suspense>} />
            <Route path="informes/agroindustria-pba-2026" element={<Suspense fallback={null}><InformeAgroindustriaPBA /></Suspense>} />
            <Route path="informes/empleo-publico-pba-2026" element={<Suspense fallback={null}><InformeEmpleoPblicoPBA /></Suspense>} />
            <Route path="informes/:id" element={<Suspense fallback={null}><InformeDetalle /></Suspense>} />
            <Route path="datos" element={<Suspense fallback={null}><Datos /></Suspense>} />
            <Route path="hilos" element={<Suspense fallback={null}><Hilos /></Suspense>} />
            <Route path="reportes" element={<Suspense fallback={null}><ReportesRapidos /></Suspense>} />
            <Route path="beta" element={<Suspense fallback={null}><Beta /></Suspense>} />
            <Route path="quienes-somos" element={<Suspense fallback={null}><QuienesSomos /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LazyMotion>
  )
}
