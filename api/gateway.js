// api/gateway.js
export default async function handler(req, res) {
  try {
    const API_FOOTBALL = 'https://v3.football.api-sports.io';
    const ODDS_API = 'https://api.the-odds-api.com/v4';

    const url = new URL(req.url, `https://${req.headers.host}`);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    const json = (code, body) => {
      res.status(code).setHeader('content-type', 'application/json');
      res.end(JSON.stringify(body));
    };

    const afetch = async (u, opts={}) => {
      const r = await fetch(u, opts);
      if (!r.ok) throw new Error(`${r.status} ${u}`);
      return r.json();
    };

    if (pathname === '/fixtures') {
      const date = searchParams.get('date') ?? new Date().toISOString().slice(0,10);
      const data = await afetch(`${API_FOOTBALL}/fixtures?date=${date}`, {
        headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY }
      });
      const out = (data.response || []).map(f => ({
        fixture_id: f.fixture?.id,
        league: f.league?.name,
        league_id: f.league?.id,
        kickoff: f.fixture?.date,
        home: f.teams?.home?.name,
        away: f.teams?.away?.name,
        status: f.fixture?.status?.short
      }));
      return json(200, { source: 'api-football', date, count: out.length, fixtures: out });
    }

    if (pathname === '/odds') {
      const fixture_id = searchParams.get('fixture_id') ?? 'demo';
      if (!process.env.ODDS_API_KEY) return json(500, { error: 'ODDS_API_KEY missing' });
      const sport = 'soccer_uefa_champions_league';
      const regions = 'eu';
      const markets = 'h2h,spreads,totals';
      const odds = await afetch(`${ODDS_API}/sports/${sport}/odds?apiKey=${process.env.ODDS_API_KEY}&regions=${regions}&markets=${markets}`);
      const sample = odds?.[0] ?? null;
      return json(200, {
        source: 'the-odds-api',
        fixture_id,
        markets: sample?.bookmakers?.[0]?.markets ?? [],
        note: 'MVP: mappa sport/lag exakt i v1.1 för bättre matchning.'
      });
    }

    if (pathname === '/xg') {
      const fixture_id = searchParams.get('fixture_id') ?? 'demo';
      return json(200, {
        source: 'proxy',
        fixture_id,
        xg: { home_att: 1.6, away_att: 1.3, home_def: 0.9, away_def: 1.1 }
      });
    }

    return json(404, { error: 'Not found', hint: 'Use /fixtures, /odds or /xg' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
