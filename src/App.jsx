import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Informes from './pages/Informes'
import Datos from './pages/Datos'
import Hilos from './pages/Hilos'
import ReportesRapidos from './pages/ReportesRapidos'
import Visualizaciones from './pages/Visualizaciones'
import InformeDetalle from './pages/InformeDetalle'
import Beta from './pages/Beta'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="informes" element={<Informes />} />
          <Route path="informes/:id" element={<InformeDetalle />} />
          <Route path="datos" element={<Datos />} />
          <Route path="hilos" element={<Hilos />} />
          <Route path="reportes" element={<ReportesRapidos />} />
          <Route path="beta" element={<Beta />} />
          <Route path="visualizaciones" element={<Visualizaciones />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
