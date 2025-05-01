async function initializeStocks() {
  const symbol = CONFIG.DEFAULT_STOCK;
  const cacheKey = `stockCache_${symbol}`;
  const now = Date.now();
  const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');

  try {
    console.log('💹 Checking stock cache...');
    if (cached && now - cached.timestamp < 5 * 60 * 1000) {
      console.log('📦 Using cached stock data.');
      updateStockMood(parseStockMood(cached.data));
      return;
    }

    console.log('📡 Fetching fresh stock data (Finnhub)...');
    const finnhubUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d09sku9r01qus8rf65igd09sku9r01qus8rf65j0`;
    const response = await fetch(finnhubUrl);
    if (!response.ok) throw new Error('Finnhub fetch failed');

    const data = await response.json();
    if (!data || isNaN(data.c) || isNaN(data.pc)) {
      throw new Error('Finnhub returned invalid data');
    }

    const parsed = {
      'Time Series (5min)': {
        'now': { '4. close': data.c },
        'prev': { '4. close': data.pc }
      }
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data: parsed, timestamp: now }));
    updateStockMood(parseStockMood(parsed));
  } catch (err) {
    console.warn('🟡 Finnhub failed, trying Yahoo fallback:', err.message || err);
    await fetchYahooFinanceFallback(symbol, cacheKey);
  }
}

async function fetchYahooFinanceFallback(symbol, cacheKey) {
  try {
    const rawUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`;
    const proxiedUrl = CONFIG.CORS_PROXY + encodeURIComponent(rawUrl);

    const response = await fetch(proxiedUrl);
    if (!response.ok) throw new Error('Yahoo fetch failed');

    const data = await response.json();
    const result = data.chart?.result?.[0];
    const close = result?.indicators?.quote?.[0]?.close;
    if (!Array.isArray(close) || close.length < 2) throw new Error('Not enough Yahoo data');

    const latest = close[close.length - 1];
    const previous = close[close.length - 2];
    if (isNaN(latest) || isNaN(previous)) throw new Error('Invalid Yahoo values');

    const parsed = {
      'Time Series (5min)': {
        'now': { '4. close': latest },
        'prev': { '4. close': previous }
      }
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data: parsed, timestamp: Date.now() }));
    updateStockMood(parseStockMood(parsed));
  } catch (err) {
    console.error('🔴 Yahoo fallback also failed:', err.message || err);
    updateStockMood({
      mood: 'neutral',
      description: '⚠️ Market data unavailable'
    });
  }
}

function parseStockMood(data) {
  const ts = data['Time Series (5min)'];
  const keys = Object.keys(ts);
  const latest = parseFloat(ts[keys[0]]['4. close']);
  const previous = parseFloat(ts[keys[1]]['4. close']);

  if (isNaN(latest) || isNaN(previous)) {
    return {
      mood: 'neutral',
      description: '❌ Invalid price data'
    };
  }

  const change = latest - previous;
  const pctChange = (change / previous) * 100;

  let mood = 'neutral';
  let icon = '📊';
  if (pctChange >= 1.5) {
    mood = 'euphoric'; icon = '🚀';
  } else if (pctChange >= 0.5) {
    mood = 'serene'; icon = '📈';
  } else if (pctChange <= -1.5) {
    mood = 'panic'; icon = '💥';
  } else if (pctChange <= -0.5) {
    mood = 'gloomy'; icon = '📉';
  }

  return {
    mood,
    description: `${icon} ${CONFIG.DEFAULT_STOCK}: ${latest.toFixed(2)} (${pctChange.toFixed(2)}%)`
  };
}

function updateStockMood({ mood, description }) {
  const el = document.getElementById('market-status');
  if (el) {
    el.textContent = description;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 500);
  }

  window.dispatchEvent(new CustomEvent('moodUpdate', {
    detail: { type: 'stock', mood, description }
  }));
}
