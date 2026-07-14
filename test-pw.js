import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()))
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message))
  
  try {
    await page.goto('http://localhost:5173/informes/indice-fada-pba-2026', { waitUntil: 'networkidle', timeout: 5000 })
    console.log('Page loaded successfully')
    const html = await page.content()
    if (html.includes('Qué es y qué mide el Índice FADA')) {
      console.log('Text found, page renders fine!')
    } else {
      console.log('Text NOT found! Something is wrong.')
    }
  } catch (err) {
    console.error('Playwright Error:', err)
  }
  
  await browser.close()
}
run()
