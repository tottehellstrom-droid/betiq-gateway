// /api/odds.js
export default async function handler(req, res) {
  try {
    if (!process.env.ODDS_API_KEY) {
      return res.status(500).json({ error: 'ODDS_API_KEY missing' });
    }

    const ODDS_API = 'https://api.the-odds-api.com/v4';

    // Läs in league_id från query (?league_id=39)
    const url = new URL(req.url, `https://${req.headers.host}`);
    const league_id = url.searchParams.get('league_id');

    // Mappa API-Football league_id till TheOddsAPI sport key
    const leagueMap = {
      39: 'soccer_epl', // Premier League
      140: 'soccer_spain_la_liga',
      135: 'soccer_italy_serie_a',
      78: 'soccer_germany_bundesliga',
      61: 'soccer_france_ligue_one',
      2: 'soccer_uefa_champions_league',
      3: 'soccer_uefa_europa_league'
    };

    const sport = leagueMap[league_id] || 'soccer_epl'; // fallback EPL
    const regions = 'eu';
    const markets = 'h2h,spreads,totals';

    const r = await fetch(`${ODDS_API}/sports/${sport}/odds?apiKey=${process.env.ODDS_API_KEY}&regions=${regions}&markets=${markets}`);
    if (!r.ok) throw new Error(`TheOddsAPI ${r.status}`);
    const data = await r.json();

    res.status(200).json({
      source: 'the-odds-api',
      league_id,
      sport,
      count: data.length,
      odds: data
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
