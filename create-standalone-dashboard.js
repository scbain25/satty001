import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, generate the data file if it doesn't exist
const dataFilePath = path.join(__dirname, 'dashboard-data.json');
if (!fs.existsSync(dataFilePath)) {
  console.log('📊 Generating pharmacy data...');
  try {
    execSync('cd backend && python -c "from app.services import repo, features, explain, scorer; import json; repo.seed(); cards = []; [cards.append({\'id\': opp[\'id\'], \'pharmacyName\': opp[\'data\'].get(\'pharmacy_name\', opp[\'pharmacy_npi\']), \'entityName\': opp[\'covered_entity_id\'], \'stage\': opp[\'status_stage\'], \'distanceKm\': opp[\'data\'].get(\'distance_km\'), \'pGoLive\': scorer.score(features.build_features(opp, []))[0], \'profitP10\': scorer.score(features.build_features(opp, []))[2][0], \'profitP90\': scorer.score(features.build_features(opp, []))[2][2], \'topFactors\': explain.top_five(features.build_features(opp, [])), \'dispenseFee\': features.build_features(opp, []).get(\'dispense_fee\'), \'tpaFee\': features.build_features(opp, []).get(\'tpa_fee\'), \'dataCompleteness\': features.build_features(opp, []).get(\'data_completeness\')}) for opp in repo.list_opportunities()]; print(json.dumps(cards, indent=2))" > ../dashboard-data.json', { cwd: __dirname, shell: true });
  } catch (error) {
    console.warn('⚠️  Could not generate data file. Using empty data array.');
    fs.writeFileSync(dataFilePath, '[]');
  }
}

// Read the built HTML file
const distDir = path.join(__dirname, 'frontend', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: Build the frontend first by running: cd frontend && npm run build');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// Read the embedded data
let embeddedData = [];
if (fs.existsSync(dataFilePath)) {
  try {
    const dataContent = fs.readFileSync(dataFilePath, 'utf-8').replace(/^\uFEFF/, ''); // Remove BOM if present
    embeddedData = JSON.parse(dataContent);
  } catch (error) {
    console.warn('⚠️  Could not parse data file. Regenerating...');
    // Try to regenerate
    try {
      execSync('cd backend && python -c "from app.services import repo, features, explain, scorer; import json; repo.seed(); cards = []; [cards.append({\'id\': opp[\'id\'], \'pharmacyName\': opp[\'data\'].get(\'pharmacy_name\', opp[\'pharmacy_npi\']), \'entityName\': opp[\'covered_entity_id\'], \'stage\': opp[\'status_stage\'], \'distanceKm\': opp[\'data\'].get(\'distance_km\'), \'pGoLive\': scorer.score(features.build_features(opp, []))[0], \'profitP10\': scorer.score(features.build_features(opp, []))[2][0], \'profitP90\': scorer.score(features.build_features(opp, []))[2][2], \'topFactors\': explain.top_five(features.build_features(opp, [])), \'dispenseFee\': features.build_features(opp, []).get(\'dispense_fee\'), \'tpaFee\': features.build_features(opp, []).get(\'tpa_fee\'), \'dataCompleteness\': features.build_features(opp, []).get(\'data_completeness\')}) for opp in repo.list_opportunities()]; print(json.dumps(cards, indent=2))" > ../dashboard-data.json', { cwd: __dirname, shell: true });
      const dataContent = fs.readFileSync(dataFilePath, 'utf-8').replace(/^\uFEFF/, '');
      embeddedData = JSON.parse(dataContent);
    } catch (regenerateError) {
      console.warn('⚠️  Could not regenerate data. Using empty array.');
      embeddedData = [];
    }
  }
}

// Read all JS and CSS files referenced in the HTML
const jsMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g) || [];
const cssMatches = html.match(/<link[^>]*href="([^"]+)"[^>]*>/g) || [];

// Inline CSS files
for (const match of cssMatches) {
  const hrefMatch = match.match(/href="([^"]+)"/);
  if (hrefMatch) {
    const cssPath = path.join(distDir, hrefMatch[1]);
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      html = html.replace(match, `<style>${cssContent}</style>`);
    }
  }
}

// Inline JS files and modify to use embedded data
for (const match of jsMatches) {
  const srcMatch = match.match(/src="([^"]+)"/);
  if (srcMatch) {
    const jsPath = path.join(distDir, srcMatch[1]);
    if (fs.existsSync(jsPath)) {
      let jsContent = fs.readFileSync(jsPath, 'utf-8');
      
      // Replace API calls with embedded data
      // Replace axios.get calls to /api/v1/opportunities with embedded data
      jsContent = jsContent.replace(
        /axios\.get\([^)]*\/api\/v1\/opportunities[^)]*\)/g,
        `Promise.resolve({ data: ${JSON.stringify(embeddedData)} })`
      );
      
      // Remove type="module" to make it work in all contexts
      html = html.replace(match, `<script>${jsContent}</script>`);
    }
  }
}

// Also handle module scripts - keep as module but inline
const moduleMatches = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g) || [];
for (const match of moduleMatches) {
  const srcMatch = match.match(/src="([^"]+)"/);
  if (srcMatch) {
    const jsPath = path.join(distDir, srcMatch[1]);
    if (fs.existsSync(jsPath)) {
      let jsContent = fs.readFileSync(jsPath, 'utf-8');
      
      // Replace API calls with embedded data - handle various axios call patterns
      // Pattern 1: axios.get(url).then(...)
      jsContent = jsContent.replace(
        /axios\.get\([^)]*\/api\/v1\/opportunities[^)]*\)/g,
        `Promise.resolve({ data: ${JSON.stringify(embeddedData)} })`
      );
      
      // Pattern 2: axios.get(url, config).then(...)
      jsContent = jsContent.replace(
        /axios\.get\([^,)]*\/api\/v1\/opportunities[^)]*\)/g,
        `Promise.resolve({ data: ${JSON.stringify(embeddedData)} })`
      );
      
      // Keep as module script since Vite bundles as ES modules
      html = html.replace(match, `<script type="module">${jsContent}</script>`);
    }
  }
}

// Inject embedded data as a global variable before the main script
const dataScript = `<script>
  window.__EMBEDDED_DASHBOARD_DATA__ = ${JSON.stringify(embeddedData)};
</script>`;

// Find the first script tag and insert data before it
const firstScriptMatch = html.match(/<script[^>]*>/);
if (firstScriptMatch) {
  html = html.replace(firstScriptMatch[0], dataScript + '\n    ' + firstScriptMatch[0]);
} else {
  // If no script found, add before closing head
  html = html.replace('</head>', `  ${dataScript}\n</head>`);
}

// Update title
html = html.replace(/<title>.*?<\/title>/, '<title>MacroHelix AI Implementation Triage Dashboard</title>');

// Add base tag to handle relative paths
if (!html.includes('<base')) {
  html = html.replace('<head>', '<head>\n    <base href="./">');
}

// Also try to replace the actual API call in the minified code
// Look for patterns like: axios.get(...) or fetch(...) that might contain the API URL
// This is a fallback in case the regex replacement didn't work
const apiUrlPatterns = [
  /localhost:8000\/api\/v1\/opportunities/g,
  /\/api\/v1\/opportunities/g,
];

// Replace in the entire HTML (including inlined scripts)
for (const pattern of apiUrlPatterns) {
  // We'll handle this by modifying the component logic instead
  // The data is now available as window.__EMBEDDED_DASHBOARD_DATA__
}

// Write the standalone file
const outputPath = path.join(__dirname, 'dashboard-standalone.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log(`✅ Standalone dashboard created: ${outputPath}`);
console.log(`📊 Embedded ${embeddedData.length} pharmacy records`);
console.log('📄 You can now open this file in a browser or embed it in PowerPoint');

