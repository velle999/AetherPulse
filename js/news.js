const GNEWS_API_KEY = 'd15435981f78f19499693079c3cea81a'; // 🔑 Replace with your GNews API key

async function fetchNewsMood() {
  const url = `https://gnews.io/api/v4/top-headlines?lang=en&token=${GNEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const headlines = data.articles.map(a => a.title);
    const moodScore = getNewsMoodScore(headlines);
    const moodType = moodFromValue(moodScore);

    window.dispatchEvent(new CustomEvent("moodUpdate", {
      detail: {
        type: "news",
        mood: moodType,
        description: `🗞️ Top headline: "${headlines[0]}" (${moodType})`
      }
    }));
  } catch (err) {
    console.error("📰 Failed to fetch news mood:", err);
  }
}

// Simple naive sentiment estimation
function getNewsMoodScore(headlines) {
  const badWords = ["crisis", "death", "war", "recession", "shooting"];
  const goodWords = ["growth", "peace", "recovery", "breakthrough", "win"];

  let score = 0;

  headlines.forEach(h => {
    const text = h.toLowerCase();
    badWords.forEach(word => { if (text.includes(word)) score -= 1; });
    goodWords.forEach(word => { if (text.includes(word)) score += 1; });
  });

  return Math.max(-1, Math.min(1, score)); // clamp to [-1, 1]
}
