import { createContext, useContext, useEffect } from 'react'
import { Chart as ChartJS } from 'chart.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Dark mode disabled site-wide: always force light and clear any
    // previously stored preference so returning visitors are reset too.
    const root = document.documentElement
    root.classList.remove('dark')
    try {
      localStorage.removeItem('theme')
    } catch {}

    if (ChartJS.defaults) {
      ChartJS.defaults.color = '#475569'
      ChartJS.defaults.borderColor = 'rgba(13,17,23,0.08)'
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark: false, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
