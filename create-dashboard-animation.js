// Script to create an animated GIF of the dashboard with progressive reveals
// Requires: puppeteer
// Install: npm install puppeteer

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const DELAY = 2000 // 2 seconds between frames
const HOVER_DELAY = 1500 // 1.5 seconds for hover states
const WIDTH = 1400
const HEIGHT = 900
const OUTPUT_DIR = './dashboard-animation-screenshots'

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function captureDashboardAnimation() {
  console.log('🚀 Starting dashboard animation GIF creation...')
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
    
    // Helper function to hide elements
    const hideElements = async (selectors) => {
      await page.evaluate((sel) => {
        sel.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            el.style.display = 'none'
          })
        })
      }, selectors)
    }
    
    // Helper function to show elements
    const showElements = async (selectors) => {
      await page.evaluate((sel) => {
        sel.forEach(selector => {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            el.style.display = ''
          })
        })
      }, selectors)
    }
    
    // Helper function to find chart containers by their titles
    const findChartByTitle = async (titleText) => {
      return await page.evaluate((text) => {
        const headings = Array.from(document.querySelectorAll('h3'))
        const heading = headings.find(h => h.textContent?.includes(text))
        if (heading) {
          // Find the parent container (usually 2-3 levels up)
          let parent = heading.parentElement
          while (parent && !parent.style.display) {
            parent = parent.parentElement
          }
          return parent ? heading.closest('div[style*="background"]') : null
        }
        return null
      }, titleText)
    }
    
    // Step 1: Hide all charts, show only summary row
    console.log(`📸 Frame ${screenshotNum}: Summary row only`)
    await page.evaluate(() => {
      // Find all chart containers by looking for h3 headings with chart titles
      const chartTitles = [
        'Probability Distribution',
        'Profitability Distribution', 
        'Probability Trend',
        'Profitability Trend',
        'Predictor Profile',
        'Distance Trend'
      ]
      
      chartTitles.forEach(title => {
        const headings = Array.from(document.querySelectorAll('h3'))
        const heading = headings.find(h => h.textContent?.includes(title))
        if (heading) {
          // Find the parent div with white background (chart container)
          let current = heading.parentElement
          for (let i = 0; i < 10 && current; i++) {
            const style = window.getComputedStyle(current)
            const bgColor = style.backgroundColor
            if (bgColor && (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('white') || bgColor === 'white')) {
              const rect = current.getBoundingClientRect()
              if (rect.height > 200) { // Chart containers are tall
                // Use !important to override inline styles
                current.setAttribute('style', current.getAttribute('style') + '; display: none !important;')
                break
              }
            }
            current = current.parentElement
          }
        }
      })
    })
    await wait(1000) // Wait longer for React to settle
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `frame-${String(screenshotNum).padStart(3, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // Step 2: Show second row (Probability Distribution and Profitability Distribution)
    console.log(`📸 Frame ${screenshotNum}: Adding Probability & Profitability Distribution charts`)
    await page.evaluate(() => {
      const titlesToShow = ['Probability Distribution', 'Profitability Distribution']
      
      titlesToShow.forEach(title => {
        const headings = Array.from(document.querySelectorAll('h3'))
        const heading = headings.find(h => h.textContent?.includes(title))
        if (heading) {
          let current = heading.parentElement
          for (let i = 0; i < 10 && current; i++) {
            const style = window.getComputedStyle(current)
            const bgColor = style.backgroundColor
            if (bgColor && (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('white') || bgColor === 'white')) {
              const rect = current.getBoundingClientRect()
              if (rect.height > 200) {
                // Remove display:none
                const currentStyle = current.getAttribute('style') || ''
                const newStyle = currentStyle.replace(/display\s*:\s*none[^;]*;?/gi, '').replace(/!important/gi, '')
                current.setAttribute('style', newStyle)
                break
              }
            }
            current = current.parentElement
          }
        }
      })
    })
    await wait(500)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `frame-${String(screenshotNum).padStart(3, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // Step 3: Show third row (Probability Trend, Profitability Trend, Predictor Profile, Distance Trend)
    console.log(`📸 Frame ${screenshotNum}: Adding all remaining charts`)
    await page.evaluate(() => {
      const titlesToShow = ['Probability Trend', 'Profitability Trend', 'Predictor Profile', 'Distance Trend']
      
      titlesToShow.forEach(title => {
        const headings = Array.from(document.querySelectorAll('h3'))
        const heading = headings.find(h => h.textContent?.includes(title))
        if (heading) {
          let current = heading.parentElement
          for (let i = 0; i < 10 && current; i++) {
            const style = window.getComputedStyle(current)
            const bgColor = style.backgroundColor
            if (bgColor && (bgColor.includes('rgb(255, 255, 255)') || bgColor.includes('white') || bgColor === 'white')) {
              const rect = current.getBoundingClientRect()
              if (rect.height > 200) {
                // Remove display:none
                const currentStyle = current.getAttribute('style') || ''
                const newStyle = currentStyle.replace(/display\s*:\s*none[^;]*;?/gi, '').replace(/!important/gi, '')
                current.setAttribute('style', newStyle)
                break
              }
            }
            current = current.parentElement
          }
        }
      })
    })
    await wait(1000)
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, `frame-${String(screenshotNum).padStart(3, '0')}.png`),
      fullPage: false
    })
    screenshotNum++
    await wait(DELAY)
    
    // Step 4: Hover over each chart
    const chartTitles = [
      'Probability Distribution',
      'Profitability Distribution',
      'Probability Trend',
      'Profitability Trend',
      'Predictor Profile',
      'Distance Trend'
    ]
    
    for (const chartTitle of chartTitles) {
      console.log(`📸 Frame ${screenshotNum}: Hovering over ${chartTitle}`)
      
      // Find and hover over the chart container
      await page.evaluate((title) => {
        const headings = Array.from(document.querySelectorAll('h3'))
        const heading = headings.find(h => h.textContent?.includes(title))
        if (heading) {
          // Find the chart container (parent with white background)
          let current = heading.parentElement
          for (let i = 0; i < 10 && current; i++) {
            const style = window.getComputedStyle(current)
            if (style.backgroundColor && (style.backgroundColor.includes('rgb(255, 255, 255)') || style.backgroundColor.includes('white'))) {
              const rect = current.getBoundingClientRect()
              if (rect.height > 200) {
                // Get the center of the container
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                
                // Create and dispatch mouseenter event
                const mouseEnterEvent = new MouseEvent('mouseenter', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: centerX,
                  clientY: centerY
                })
                current.dispatchEvent(mouseEnterEvent)
                
                // Also trigger onMouseEnter if it's a React component
                if (current.onMouseEnter) {
                  current.onMouseEnter(mouseEnterEvent)
                }
                break
              }
            }
            current = current.parentElement
          }
        }
      }, chartTitle)
      
      // Also use Puppeteer's hover method for better reliability
      try {
        const heading = await page.evaluateHandle((title) => {
          const headings = Array.from(document.querySelectorAll('h3'))
          return headings.find(h => h.textContent?.includes(title))
        }, chartTitle)
        
        if (heading) {
          const container = await heading.evaluateHandle((h) => {
            let current = h.parentElement
            for (let i = 0; i < 10 && current; i++) {
              const style = window.getComputedStyle(current)
              if (style.backgroundColor && (style.backgroundColor.includes('rgb(255, 255, 255)') || style.backgroundColor.includes('white'))) {
                const rect = current.getBoundingClientRect()
                if (rect.height > 200) {
                  return current
                }
              }
              current = current.parentElement
            }
            return null
          })
          
          if (container) {
            await container.asElement()?.hover()
          }
        }
      } catch (e) {
        // Fallback to event dispatch if hover fails
      }
      
      await wait(HOVER_DELAY)
      await page.screenshot({ 
        path: path.join(OUTPUT_DIR, `frame-${String(screenshotNum).padStart(3, '0')}.png`),
        fullPage: false
      })
      screenshotNum++
      
      // Remove hover by moving mouse away
      await page.mouse.move(10, 10)
      
      await wait(500)
    }
    
    console.log(`✅ Captured ${screenshotNum - 1} frames in ${OUTPUT_DIR}/`)
    console.log('')
    console.log('🔄 Creating GIF...')
    
    // Create GIF using ImageMagick
    try {
      const files = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.endsWith('.png'))
        .sort()
        .map(f => path.join(OUTPUT_DIR, f))
        .map(f => `"${f}"`)
        .join(' ')
      
      const outputGif = './dashboard-animation.gif'
      await execAsync(
        `magick -delay 200 -loop 0 ${files} "${outputGif}"`,
        { maxBuffer: 1024 * 1024 * 10 }
      )
      console.log(`✅ GIF created: ${outputGif}`)
    } catch (error) {
      console.log('⚠️  ImageMagick not found or error creating GIF')
      console.log('📝 To create the GIF manually, run:')
      console.log(`   magick -delay 200 -loop 0 ${OUTPUT_DIR}/*.png dashboard-animation.gif`)
      console.log('   OR use an online tool: https://ezgif.com/maker')
    }
    
  } catch (error) {
    console.error('❌ Error creating animation:', error)
  } finally {
    await browser.close()
  }
}

captureDashboardAnimation()

