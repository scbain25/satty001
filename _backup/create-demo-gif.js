// Script to create an animated GIF demo of the MacroHelix application
// Requires: puppeteer, gifencoder, canvas
// Install: npm install puppeteer gifencoder canvas

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const DELAY = 2500 // 2.5 seconds between screenshots
const WIDTH = 1280
const HEIGHT = 720
const OUTPUT_DIR = './demo-screenshots'

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function captureScreenshots() {
  console.log('🚀 Starting demo GIF creation...')
  console.log('📸 Make sure the frontend is running on http://localhost:5173')
  
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: WIDTH, height: HEIGHT }
  })

  try {
    const page = await browser.newPage()
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Wait for initial load
    console.log('⏳ Waiting for page to load...')
    await wait(3000)
    
    let screenshotNum = 1
    
    // 1. Dashboard overview - Summary metrics
    console.log(`📸 Screenshot ${screenshotNum}: Dashboard overview`)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 2. Scroll to best/worst section
    console.log(`📸 Screenshot ${screenshotNum}: Best/Worst pharmacies`)
    await page.evaluate(() => {
      window.scrollTo({ top: 350, behavior: 'smooth' })
    })
    await wait(DELAY)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 3. Scroll to probability breakdown
    console.log(`📸 Screenshot ${screenshotNum}: Probability breakdown`)
    await page.evaluate(() => {
      window.scrollTo({ top: 650, behavior: 'smooth' })
    })
    await wait(DELAY)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 4. Scroll to charts section
    console.log(`📸 Screenshot ${screenshotNum}: Charts section (2x2 grid)`)
    await page.evaluate(() => {
      window.scrollTo({ top: 850, behavior: 'smooth' })
    })
    await wait(DELAY)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 5. Scroll down more to see all charts
    console.log(`📸 Screenshot ${screenshotNum}: All charts visible`)
    await page.evaluate(() => {
      window.scrollTo({ top: 1200, behavior: 'smooth' })
    })
    await wait(DELAY)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 6. Scroll to pharmacy list
    console.log(`📸 Screenshot ${screenshotNum}: Pharmacy list table`)
    await page.evaluate(() => {
      window.scrollTo({ top: 1800, behavior: 'smooth' })
    })
    await wait(DELAY)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // 7. Double-click a pharmacy to open detail
    console.log(`📸 Screenshot ${screenshotNum}: Opening pharmacy detail`)
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    await wait(1000)
    
    // Find and double-click on first pharmacy row
    const pharmacyRow = await page.$('tbody tr')
    if (pharmacyRow) {
      await pharmacyRow.click({ clickCount: 2 })
      await wait(3000) // Wait for detail page to load
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
        fullPage: false
      })
      screenshotNum++
      await wait(DELAY)
      
      // 8. Scroll detail page to see metrics
      console.log(`📸 Screenshot ${screenshotNum}: Detail page metrics`)
      await page.evaluate(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' })
      })
      await wait(DELAY)
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
        fullPage: false
      })
      screenshotNum++
      await wait(DELAY)
      
      // 9. Scroll to what-if sandbox
      console.log(`📸 Screenshot ${screenshotNum}: What-if sandbox`)
      await page.evaluate(() => {
        window.scrollTo({ top: 800, behavior: 'smooth' })
      })
      await wait(DELAY)
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `screenshot-${String(screenshotNum).padStart(2, '0')}.png`),
        fullPage: false
      })
      screenshotNum++
    }
    
    console.log(`✅ Captured ${screenshotNum - 1} screenshots in ${OUTPUT_DIR}/`)
    console.log('')
    console.log('📝 To create the GIF, run one of these:')
    console.log('   1. npm run demo:gif (if ImageMagick is installed)')
    console.log('   2. magick -delay 250 -loop 0 demo-screenshots/*.png demo.gif')
    console.log('   3. Use online tool: https://ezgif.com/maker (upload all PNGs)')
    
  } catch (error) {
    console.error('❌ Error creating screenshots:', error)
  } finally {
    await browser.close()
  }
}

captureScreenshots()

