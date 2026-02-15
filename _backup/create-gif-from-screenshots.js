// Simple script to create GIF from screenshots using sharp
// Install: npm install sharp --save-dev

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function createGif() {
  const screenshotsDir = './demo-screenshots'
  const outputGif = './demo.gif'
  
  if (!fs.existsSync(screenshotsDir)) {
    console.error('❌ Screenshots directory not found. Run create-demo-gif.js first.')
    return
  }
  
  const files = fs.readdirSync(screenshotsDir)
    .filter(f => f.endsWith('.png'))
    .sort()
    .map(f => path.join(screenshotsDir, f))
  
  if (files.length === 0) {
    console.error('❌ No screenshots found in demo-screenshots/')
    return
  }
  
  console.log(`📸 Found ${files.length} screenshots`)
  console.log('🔄 Creating GIF...')
  
  // Try using ImageMagick if available
  try {
    const { stdout } = await execAsync('magick -version')
    console.log('✅ ImageMagick found, using it to create GIF...')
    
    const fileList = files.map(f => `"${f}"`).join(' ')
    await execAsync(
      `magick -delay 250 -loop 0 ${fileList} "${outputGif}"`,
      { maxBuffer: 1024 * 1024 * 10 }
    )
    console.log(`✅ GIF created: ${outputGif}`)
  } catch (error) {
    console.log('⚠️  ImageMagick not found. Trying alternative method...')
    console.log('📝 Please install ImageMagick from https://imagemagick.org/script/download.php')
    console.log('   Then run: magick -delay 250 -loop 0 demo-screenshots/*.png demo.gif')
    console.log('   OR use an online tool: https://ezgif.com/maker')
  }
}

createGif()


