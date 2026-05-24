import { createContext, useContext, useEffect, useState } from 'react'
import { Chart as ChartJS } from 'chart.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    // Update Chart.js global defaults so new chart renders pick them up
    if (ChartJS.defaults) {
      ChartJS.defaults.color = isDark ? '#94a3b8' : '#475569'
      ChartJS.defaults.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.08)'
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
