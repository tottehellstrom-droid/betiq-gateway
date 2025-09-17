// /api/odds.js
export default async function handler(req, res) {
  try {
    if (!process.env.ODDS_API_KEY) {
      return res.status(500).json({ error: 'ODDS_API_KEY missing' });
    }
    const ODDS_API = 'https://api.the-odds-api.com/v4';
    // MVP: Champions League i EU-regionen (du kan mappa liga->sport senare)
    const sport = 'soccer_uefa_champions_league';
    const regions = 'eu';
    const markets = 'h2h,spreads,totals';

    const r = await fetch(`${ODDS_API}/sports/${sport}/odds?apiKey=${process.env.ODDS_API_KEY}&regions=${regions}&markets=${markets}`);
    if (!r.ok) throw new Error(`TheOddsAPI ${r.status}`);
    const data = await r.json();

    // Returnera första bookmaker-marknader som demo
    const sample = data?.[0] ?? null;
    const marketsOut = sample?.bookmakers?.[0]?.markets ?? [];

    res.status(200).json({
      source: 'the-odds-api',
      markets: marketsOut,
      note: 'MVP: mappa sport/lag exakt i v1.1 för bättre matchning.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
