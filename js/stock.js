async function initializeStocks() {
  try {
    console.log('💹 Checking stock cache...');
    const cacheKey = `stockCache_${CONFIG.DEFAULT_STOCK}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    const now = Date.now();

    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      console.log('📦 Using cached stock data.');
      updateStockMood(parseStockMood(cached.data));
      return;
    }

    console.log('📡 Fetching fresh stock data...');
    const symbol = CONFIG.DEFAULT_STOCK;
    const stockTarget = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${CONFIG.STOCK_API_KEY}`;
    const stockUrl = CONFIG.CORS_PROXY + encodeURIComponent(stockTarget);

    const response = await fetch(stockUrl);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const data = await response.json();

    // Save to localStorage with timestamp
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    updateStockMood(parseStockMood(data));

  } catch (err) {
    console.error('📉 Stock API error:', err);
    updateStockMood({ mood: 'neutral', description: '⚠️ Market data unavailable' });
  }
}

function parseStockMood(data) {
  const timeSeries = data['Time Series (5min)'];

  if (!timeSeries || Object.keys(timeSeries).length < 2) {
    console.warn('⚠️ Invalid or insufficient stock data', data);
    return {
      mood: 'neutral',
      description: '❔ No data'
    };
  }

  const times = Object.keys(timeSeries).sort().reverse();
  const latest = parseFloat(timeSeries[times[0]]['4. close']);
  const previous = parseFloat(timeSeries[times[1]]['4. close']);

  if (isNaN(latest) || isNaN(previous)) {
    console.warn('⚠️ Stock price parse error', { latest, previous });
    return {
      mood: 'neutral',
      description: '❌ Parse error'
    };
  }

  const change = latest - previous;
  const pctChange = (change / previous) * 100;

  let mood = 'neutral';
  let icon = '📊';

  if (pctChange >= 1.5) {
    mood = 'euphoric';
    icon = '🚀';
  } else if (pctChange >= 0.5) {
    mood = 'serene';
    icon = '📈';
  } else if (pctChange <= -1.5) {
    mood = 'panic';
    icon = '💥';
  } else if (pctChange <= -0.5) {
    mood = 'gloomy';
    icon = '📉';
  }

  return {
    mood,
    description: `${icon} ${CONFIG.DEFAULT_STOCK}: ${latest.toFixed(2)} (${pctChange.toFixed(2)}%)`
  };
}

function updateStockMood({ mood, description }) {
  const stockEl = document.getElementById('market-status');
  if (stockEl) {
    stockEl.textContent = description;
    animateUpdate(stockEl);
  } else {
    console.warn('⚠️ Element #market-status not found.');
  }

  window.dispatchEvent(new CustomEvent('moodUpdate', {
    detail: { type: 'stock', mood, description }
  }));
}

function animateUpdate(el) {
  if (!el) return;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 500);
}

