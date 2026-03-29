const { KEYWORDS } = require('./feeds');

function scoreItem(item) {
  let score = 0;

  const text = `${item.title || ''} ${item.snippet || ''} ${item.categories || ''}`.toLowerCase();

  // Keyword relevance (0-40 points)
  let keywordHits = 0;
  for (const kw of KEYWORDS) {
    if (text.includes(kw)) keywordHits++;
  }
  score += Math.min(keywordHits * 5, 40);

  // Recency (0-30 points) — full points if < 12h, decays over 48h
  const ageHours = (Date.now() - new Date(item.pubDate).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 12) score += 30;
  else if (ageHours <= 24) score += 25;
  else if (ageHours <= 48) score += 15;
  else if (ageHours <= 72) score += 5;

  // Source quality (0-20 points)
  score += (item.quality || 0.5) * 20;

  // Engagement bonus (0-10 points) — from Reddit upvotes or similar
  if (item.engagement) {
    score += Math.min(Math.log10(item.engagement + 1) * 3, 10);
  }

  return Math.round(score * 10) / 10;
}

function rankItems(items) {
  return items
    .map(item => ({ ...item, score: scoreItem(item) }))
    .filter(item => item.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

module.exports = { scoreItem, rankItems };
