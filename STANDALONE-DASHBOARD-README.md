# Standalone Dashboard for PowerPoint

This guide explains how to create a standalone HTML file of the dashboard that can be embedded in PowerPoint.

## Quick Start

1. **Build the standalone dashboard:**
   ```bash
   cd frontend
   npm run standalone
   ```

2. **The standalone file will be created at:**
   ```
   dashboard-standalone.html
   ```

3. **Embed in PowerPoint:**
   - **Option 1 (Recommended):** Use PowerPoint's "Web Viewer" add-in
     - Insert → Get Add-ins → Search for "Web Viewer"
     - Enter the file path or URL to `dashboard-standalone.html`
   
   - **Option 2:** Use LiveWeb add-in (third-party)
     - Install LiveWeb add-in for PowerPoint
     - Insert → LiveWeb → Select the HTML file
   
   - **Option 3:** Hyperlink to the file
     - Insert → Hyperlink → Link to `dashboard-standalone.html`
     - Clicking will open the dashboard in a browser

## How It Works

The `create-standalone-dashboard.js` script:
1. Builds the React application using Vite
2. Reads the built HTML, CSS, and JavaScript files
3. Inlines all assets into a single HTML file
4. Creates `dashboard-standalone.html` that works offline

## Features

- ✅ Fully interactive dashboard
- ✅ All charts and visualizations
- ✅ Embedded data (no server required)
- ✅ Works offline
- ✅ Single file (easy to share)

## Notes

- The standalone file includes all pharmacy data embedded in the HTML
- The file is self-contained and doesn't require a server
- File size may be large (several MB) due to embedded React and Recharts libraries
- For best results in PowerPoint, use the Web Viewer add-in

## Troubleshooting

**If the build fails:**
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript errors are resolved

**If the dashboard doesn't load:**
- Open `dashboard-standalone.html` directly in a browser (double-click the file)
- Check the browser console (F12) for any errors
- Make sure you're using a modern browser (Chrome, Edge, Firefox, Safari)
- ES modules require the file to be served via HTTP, not file:// protocol
  - Solution: Use a local web server:
    ```bash
    # Python 3
    python -m http.server 8000
    
    # Node.js (if you have http-server installed)
    npx http-server -p 8000
    ```
  - Then open: `http://localhost:8000/dashboard-standalone.html`

**If charts don't appear in PowerPoint:**
- Try opening the HTML file directly in a browser first to verify it works
- Use the Web Viewer add-in instead of embedding as an object
- Ensure PowerPoint has internet access if using Web Viewer with a URL
- For best results, host the HTML file on a web server and use the URL in PowerPoint

