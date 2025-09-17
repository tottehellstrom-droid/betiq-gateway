// /api/odds.js
export default async function handler(req, res) {
  try {
    if (!process.env.ODDS_API_KEY) {
      return res.status(500).json({ error: 'ODDS_API_KEY missing' });
    }

    const ODDS_API = 'https://api.the-odds-api.com/v4';
    const url = new URL(req.url, `https://${req.headers.host}`);
    const league_id = url.searchParams.get('league_id');
    const fixture_id = url.searchParams.get('fixture_id'); // ny parameter

    // Mappa league_id (API-Football) → sport key (TheOddsAPI)
    const leagueMap = {
      39: 'soccer_epl',
      140: 'soccer_spain_la_liga',
      135: 'soccer_italy_serie_a',
      78: 'soccer_germany_bundesliga',
      61: 'soccer_france_ligue_one',
      2: 'soccer_uefa_champs_league',
      3: 'soccer_uefa_europa_league'
    };

    const sport = leagueMap[league_id] || 'soccer_epl';
    const regions = 'eu';
    const markets = 'h2h,spreads,totals';

    // 🟢 1) Hämta odds för hela ligan (default)
    const r = await fetch(`${ODDS_API}/sports/${sport}/odds?apiKey=${process.env.ODDS_API_KEY}&regions=${regions}&markets=${markets}`);
    if (!r.ok) {
      return res.status(200).json({
        source: 'the-odds-api',
        league_id,
        fixture_id,
        sport,
        odds: [],
        note: `No odds available for ${sport} right now, fallback to Delvis.`
      });
    }

    const data = await r.json();

    // 🟢 2) Om fixture_id anges → filtrera fram den matchen
    let filtered = data;
    if (fixture_id) {
      filtered = data.filter(d => String(d.id) === String(fixture_id));
    }

    res.status(200).json({
      source: 'the-odds-api',
      league_id,
      fixture_id,
      sport,
      count: filtered.length,
      odds: filtered
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
