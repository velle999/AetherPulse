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

    console.log('📡 Fetching fresh stock data (Alpha Vantage)...');
    const stockTarget = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${CONFIG.STOCK_API_KEY}`;
    const stockUrl = CONFIG.CORS_PROXY + encodeURIComponent(stockTarget);

    const response = await fetch(stockUrl);
    if (!response.ok) throw new Error(`Alpha Vantage fetch failed`);

    const data = await response.json();
    if (data['Note'] || data['Error Message'] || data['Information']) {
      throw new Error(data['Note'] || data['Error Message'] || data['Information']);
    }

    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
    updateStockMood(parseStockMood(data));
  } catch (err) {
    console.warn('🟡 Alpha Vantage failed, trying Yahoo fallback:', err.message || err);
    await fetchYahooFinanceFallback(symbol, cacheKey);
  }
}

async function fetchYahooFinanceFallback(symbol, cacheKey) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Yahoo fetch failed`);

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) throw new Error('Malformed Yahoo data');

    const quotes = result.indicators?.quote?.[0];
    const close = quotes?.close;
    if (!Array.isArray(close) || close.length < 2) throw new Error('Not enough Yahoo data');

    const latest = close[close.length - 1];
    const previous = close[close.length - 2];
    if (isNaN(latest) || isNaN(previous)) throw new Error('Bad Yahoo price values');

    const parsed = {
      'Time Series (5min)': {
        now: { '4. close': latest },
        prev: { '4. close': previous }
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
