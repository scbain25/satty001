const FEEDS = [
  // Reddit
  {
    url: 'https://www.reddit.com/r/rheumatology/.rss',
    source: 'r/rheumatology',
    sourceType: 'article',
    quality: 0.6,
    icon: 'reddit'
  },
  {
    url: 'https://www.reddit.com/r/immunology/.rss',
    source: 'r/immunology',
    sourceType: 'article',
    quality: 0.6,
    icon: 'reddit'
  },

  // Academic Journals — Top 3
  {
    url: 'https://ard.bmj.com/rss/current.xml',
    source: 'Annals of the Rheumatic Diseases',
    sourceType: 'academic',
    quality: 1.0,
    icon: 'academic'
  },
  {
    url: 'https://acrjournals.onlinelibrary.wiley.com/action/showFeed?jc=23265205&type=etoc&feed=rss',
    source: 'ACR - Arthritis & Rheumatology',
    sourceType: 'academic',
    quality: 1.0,
    icon: 'academic'
  },
  {
    url: 'https://www.nature.com/ni.rss',
    source: 'Nature Immunology',
    sourceType: 'academic',
    quality: 1.0,
    icon: 'academic'
  },

  // YouTube channels
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCZYTClx2T1of7BRZ86-8fow',
    source: 'Ninja Nerd (Immunology)',
    sourceType: 'video',
    quality: 0.8,
    icon: 'youtube'
  },
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNI0qOojpkhsUtaQ4_2NUhQ',
    source: 'ACR Education',
    sourceType: 'video',
    quality: 0.9,
    icon: 'youtube'
  },
  {
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0QHWhjbe5fGJEPz3sVb6nw',
    source: 'MedCram (Medical Education)',
    sourceType: 'video',
    quality: 0.7,
    icon: 'youtube'
  },

  // Substack newsletters
  {
    url: 'https://yourlocalepidemiologist.substack.com/feed',
    source: 'Your Local Epidemiologist',
    sourceType: 'article',
    quality: 0.8,
    icon: 'substack'
  },
  {
    url: 'https://groundtruths.substack.com/feed',
    source: 'Ground Truths (Eric Topol)',
    sourceType: 'article',
    quality: 0.9,
    icon: 'substack'
  },

  // PubMed — latest immunology/rheumatology publications
  {
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1f8VHVTHoZB3jdEu4qMXRX0RxjHCR-uflYZWh6ccPkwYJ5HLKZ/?limit=20&utm_campaign=pubmed-2&fc=20200101000000',
    source: 'PubMed (Rheumatology)',
    sourceType: 'academic',
    quality: 0.9,
    icon: 'academic'
  },

  // Twitter/X — Most public Nitter/RSSHub instances are down.
  // To enable Twitter feeds:
  // 1. Self-host RSSHub (https://docs.rsshub.app/) and update URLs below
  // 2. Or use Twitter API v2 with bearer token
  // Uncomment and update when you have a working RSS bridge:
  // {
  //   url: 'https://your-rsshub-instance/twitter/user/ACRheum',
  //   source: 'Twitter/X (ACR)',
  //   sourceType: 'tweet',
  //   quality: 0.8,
  //   icon: 'twitter'
  // },
  // {
  //   url: 'https://your-rsshub-instance/twitter/user/RheumNow',
  //   source: 'Twitter/X (RheumNow)',
  //   sourceType: 'tweet',
  //   quality: 0.8,
  //   icon: 'twitter'
  // }
];

const KEYWORDS = [
  // Core terms
  'immunology', 'rheumatology', 'autoimmune', 'autoimmunity',
  // Diseases
  'rheumatoid arthritis', 'lupus', 'sle', 'sjogren', 'vasculitis',
  'scleroderma', 'myositis', 'psoriatic arthritis', 'ankylosing spondylitis',
  'gout', 'osteoarthritis', 'fibromyalgia', 'antiphospholipid',
  // Immunology specifics
  't cell', 'b cell', 'cytokine', 'interleukin', 'tnf', 'interferon',
  'antibody', 'immunoglobulin', 'complement', 'inflammation',
  'innate immunity', 'adaptive immunity', 'immune response',
  // Treatments
  'biologic', 'dmard', 'methotrexate', 'rituximab', 'jak inhibitor',
  'corticosteroid', 'hydroxychloroquine', 'immunosuppressant',
  'checkpoint inhibitor', 'car-t', 'immunotherapy'
];

module.exports = { FEEDS, KEYWORDS };
