// Tag Cloud
const TAG_CLOUD_WORDS = [
  { text: 'Immunology', size: 'lg' }, { text: 'Rheumatology', size: 'lg' },
  { text: 'Autoimmune', size: 'lg' }, { text: 'T Cell', size: 'md' },
  { text: 'B Cell', size: 'md' }, { text: 'Cytokine', size: 'md' },
  { text: 'Lupus', size: 'md' }, { text: 'RA', size: 'md' },
  { text: 'TNF', size: 'sm' }, { text: 'Interferon', size: 'sm' },
  { text: 'IL-6', size: 'sm' }, { text: 'JAK Inhibitor', size: 'md' },
  { text: 'Biologic', size: 'md' }, { text: 'DMARD', size: 'sm' },
  { text: 'Vasculitis', size: 'sm' }, { text: 'Sjogren', size: 'sm' },
  { text: 'Psoriatic Arthritis', size: 'md' }, { text: 'Inflammation', size: 'lg' },
  { text: 'Complement', size: 'sm' }, { text: 'Antibody', size: 'md' },
  { text: 'CAR-T', size: 'sm' }, { text: 'Immunotherapy', size: 'md' },
  { text: 'Methotrexate', size: 'sm' }, { text: 'Rituximab', size: 'sm' },
  { text: 'Scleroderma', size: 'sm' }, { text: 'Gout', size: 'sm' },
];

function renderTagCloud() {
  const cloud = document.getElementById('tag-cloud');
  const shuffled = [...TAG_CLOUD_WORDS].sort(() => Math.random() - 0.5);
  cloud.innerHTML = shuffled.map(tag =>
    `<span class="tag-cloud-tag size-${tag.size}">${tag.text}</span>`
  ).join('');
}

renderTagCloud();

const feed = document.getElementById('feed');
const filterBtns = document.querySelectorAll('.filter-btn');
const refreshBtn = document.getElementById('refresh-btn');
const lastUpdated = document.getElementById('last-updated');

let currentFilter = 'all';
let allItems = [];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function renderItems(items) {
  if (items.length === 0) {
    feed.innerHTML = '<div class="empty-state">No items found for this filter. Try refreshing or selecting a different category.</div>';
    return;
  }

  feed.innerHTML = items.map((item, i) => `
    <a class="card" href="${item.link}" target="_blank" rel="noopener">
      <div class="card-header">
        <span class="card-rank">#${i + 1}</span>
        <span class="card-title">${escapeHtml(item.title)}</span>
        <span class="source-tag ${item.sourceType}">${item.sourceType}</span>
      </div>
      ${item.snippet ? `<div class="card-snippet">${escapeHtml(stripHtml(item.snippet))}</div>` : ''}
      <div class="card-footer">
        <div class="card-source">
          <span class="source-dot ${item.icon}"></span>
          <span class="card-source-name">${escapeHtml(item.source)}</span>
        </div>
        <span class="card-time">${timeAgo(item.pubDate)}</span>
      </div>
    </a>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchItems(endpoint = '/api/curated') {
  feed.innerHTML = '<div class="loading">Loading curated content...</div>';

  try {
    const params = currentFilter !== 'all' ? `?type=${currentFilter}` : '';
    const res = await fetch(`${endpoint}${params}`);
    const data = await res.json();
    allItems = data.items;
    renderItems(allItems);

    if (data.lastUpdated) {
      const d = new Date(data.lastUpdated);
      lastUpdated.textContent = `Updated ${timeAgo(data.lastUpdated)}`;
    }
  } catch (err) {
    feed.innerHTML = '<div class="empty-state">Failed to load content. Is the server running?</div>';
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.type;
    fetchItems();
  });
});

refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('spinning');
  await fetchItems('/api/refresh');
  refreshBtn.classList.remove('spinning');
});

fetchItems();
