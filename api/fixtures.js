// /api/fixtures.js
export default async function handler(req, res) {
  try {
    const API_FOOTBALL = 'https://v3.football.api-sports.io';
    const date = new URL(req.url, `https://${req.headers.host}`).searchParams.get('date')
      ?? new Date().toISOString().slice(0,10);

    const r = await fetch(`${API_FOOTBALL}/fixtures?date=${date}`, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY }
    });
    if (!r.ok) throw new Error(`API-Football ${r.status}`);
    const data = await r.json();

    const fixtures = (data.response || []).map(f => ({
      fixture_id: f.fixture?.id,
      league: f.league?.name,
      league_id: f.league?.id,
      kickoff: f.fixture?.date,
      home: f.teams?.home?.name,
      away: f.teams?.away?.name,
      status: f.fixture?.status?.short
    }));

    res.status(200).json({ source: 'api-football', date, count: fixtures.length, fixtures });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
