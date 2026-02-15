# Dashboard Animation GIF Creator

This script creates an animated GIF of the dashboard that progressively reveals elements and shows hover states.

## Animation Sequence

1. **Frame 1**: Shows only the summary row (Total Pharmacies, Avg Go-Live Probability, Avg Annual Profit, Total Potential)
2. **Frame 2**: Adds the second row of charts (Probability Distribution, Profitability Distribution)
3. **Frame 3**: Adds all remaining charts (Probability Trend, Profitability Trend, Predictor Profile, Distance Trend)
4. **Frames 4-9**: Hovers over each chart one by one to show the technique boxes and tooltips

## Prerequisites

1. **Install Puppeteer** (if not already installed):
   ```bash
   cd frontend
   npm install puppeteer --save-dev
   ```

2. **Install ImageMagick** (for creating the GIF):
   - Windows: Download from https://imagemagick.org/script/download.php
   - Mac: `brew install imagemagick`
   - Linux: `sudo apt-get install imagemagick`

3. **Start the frontend server**:
   ```bash
   cd frontend
   npm run dev
   ```

## Usage

1. Make sure the frontend is running on `http://localhost:5173`

2. Run the animation script:
   ```bash
   cd frontend
   npm run dashboard:gif
   ```

   Or directly:
   ```bash
   node create-dashboard-animation.js
   ```

3. The script will:
   - Capture screenshots in `dashboard-animation-screenshots/` directory
   - Create `dashboard-animation.gif` in the project root

## Output

- **Screenshots**: `dashboard-animation-screenshots/frame-001.png`, `frame-002.png`, etc.
- **GIF**: `dashboard-animation.gif`

## Customization

You can adjust the timing in `create-dashboard-animation.js`:
- `DELAY`: Time between frames (default: 2000ms)
- `HOVER_DELAY`: Time for hover states (default: 1500ms)
- `WIDTH` / `HEIGHT`: Viewport size (default: 1400x900)

## Troubleshooting

**If Puppeteer fails to launch:**
- Make sure Chrome/Chromium is installed
- Puppeteer will download Chromium automatically on first run

**If ImageMagick is not found:**
- The script will still create screenshots
- Create the GIF manually: `magick -delay 200 -loop 0 dashboard-animation-screenshots/*.png dashboard-animation.gif`
- Or use an online tool: https://ezgif.com/maker

**If charts don't appear correctly:**
- Make sure the frontend is fully loaded before the script runs
- Increase the initial wait time in the script (currently 3000ms)

