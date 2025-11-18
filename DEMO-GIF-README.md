# Creating an Animated GIF Demo

## ✅ Screenshots Captured!

9 screenshots have been successfully captured in the `demo-screenshots/` folder showing all features of the MacroHelix application:

1. Dashboard overview - Summary metrics
2. Best/Worst pharmacies - Highlighted opportunities
3. Probability breakdown - High/Medium/Low distribution
4. Charts section (2x2 grid) - Trend visualizations
5. All charts visible - Complete chart view
6. Pharmacy list table - Scrollable list
7. Opening pharmacy detail - Navigation
8. Detail page metrics - Detailed analysis
9. What-if sandbox - Interactive scenario testing

## 🎬 Create the GIF

### Option 1: Using ImageMagick (Recommended)

1. **Install ImageMagick:**
   - Download from: https://imagemagick.org/script/download.php
   - Windows: Download the installer and add to PATH

2. **Create the GIF:**
   ```bash
   magick -delay 250 -loop 0 demo-screenshots/*.png demo.gif
   ```

### Option 2: Using Online Tool (Easiest)

1. Go to: https://ezgif.com/maker
2. Upload all PNG files from `demo-screenshots/` folder
3. Set delay to 250ms (0.25 seconds)
4. Click "Make a GIF!"
5. Download the result

### Option 3: Using FFmpeg (If installed)

```bash
ffmpeg -framerate 0.4 -i demo-screenshots/screenshot-%02d.png -vf "fps=4,scale=1280:720:flags=lanczos" -c:v gif demo.gif
```

### Option 4: Using Python (If you have PIL/Pillow)

```python
from PIL import Image
import glob

# Load images
images = [Image.open(f) for f in sorted(glob.glob("demo-screenshots/*.png"))]

# Save as GIF
images[0].save('demo.gif',
               save_all=True,
               append_images=images[1:],
               duration=250,  # milliseconds
               loop=0)
```

## 📝 Re-capture Screenshots

If you need to capture new screenshots:

1. Make sure the frontend is running: `npm run dev` (in frontend folder)
2. Make sure the backend is running: `uvicorn app.main:app --reload` (in backend folder)
3. Run: `node create-demo-gif.js`

## 🎨 Customization

Edit `create-demo-gif.js` to:
- Change delay between screenshots: `const DELAY = 2500` (milliseconds)
- Change GIF dimensions: `const WIDTH = 1280` and `const HEIGHT = 720`
- Add/remove screenshots by modifying the script

## 📦 Files

- `create-demo-gif.js` - Script to capture screenshots
- `create-gif-from-screenshots.js` - Script to create GIF (requires ImageMagick)
- `demo-screenshots/` - Folder containing all PNG screenshots
- `demo.gif` - Final animated GIF (created after running one of the options above)


