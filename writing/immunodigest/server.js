const express = require('express');
const Parser = require('rss-parser');
const path = require('path');
const { FEEDS } = require('./feeds');
const { rankItems } = require('./scorer');

const app = express();
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ImmunoDigest/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml'
  }
});

// Cache
let cache = { items: [], timestamp: 0 };
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

app.use(express.static(path.join(__dirname, 'public')));

async function fetchFeed(feedConfig) {
  try {
    if (feedConfig.isJson) {
      return await fetchRedditJson(feedConfig);
    }
    const feed = await parser.parseURL(feedConfig.url);
    return feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      snippet: (item.contentSnippet || item.content || '').slice(0, 300),
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: feedConfig.source,
      sourceType: feedConfig.sourceType,
      quality: feedConfig.quality,
      icon: feedConfig.icon,
      categories: (item.categories || []).join(', '),
      engagement: extractEngagement(item)
    }));
  } catch (err) {
    console.error(`Failed to fetch ${feedConfig.source}: ${err.message}`);
    return [];
  }
}

async function fetchRedditJson(feedConfig) {
  const fetch = require('node-fetch');
  const res = await fetch(feedConfig.url, {
    headers: { 'User-Agent': 'ImmunoDigest/1.0' }
  });
  const data = await res.json();
  const posts = data.data?.children || [];
  return posts.map(p => {
    const d = p.data;
    return {
      title: d.title || '',
      link: `https://www.reddit.com${d.permalink}`,
      snippet: (d.selftext || '').slice(0, 300),
      pubDate: new Date(d.created_utc * 1000).toISOString(),
      source: feedConfig.source,
      sourceType: feedConfig.sourceType,
      quality: feedConfig.quality,
      icon: feedConfig.icon,
      categories: d.link_flair_text || '',
      engagement: d.score || 0
    };
  });
}

function extractEngagement(item) {
  // Reddit includes score in content sometimes
  if (item['slash:comments']) return parseInt(item['slash:comments']) || 0;
  return 0;
}

async function fetchAllFeeds() {
  const now = Date.now();
  if (cache.items.length > 0 && now - cache.timestamp < CACHE_TTL) {
    return cache.items;
  }

  console.log('Fetching feeds...');
  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
  const allItems = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  const ranked = rankItems(allItems);
  cache = { items: ranked, timestamp: now };
  console.log(`Fetched ${allItems.length} items, curated top ${ranked.length}`);
  return ranked;
}

app.get('/api/curated', async (req, res) => {
  try {
    const items = await fetchAllFeeds();
    const { type } = req.query;
    const filtered = type && type !== 'all'
      ? items.filter(i => i.sourceType === type)
      : items;
    res.json({ items: filtered, lastUpdated: new Date(cache.timestamp).toISOString() });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch curated content' });
  }
});

app.get('/api/refresh', async (req, res) => {
  cache = { items: [], timestamp: 0 };
  const items = await fetchAllFeeds();
  res.json({ items, lastUpdated: new Date(cache.timestamp).toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ImmunoDigest running at http://localhost:${PORT}`);
  fetchAllFeeds(); // pre-warm cache
});
