// /api/xg.js
export default async function handler(req, res) {
  try {
    const fixture_id = new URL(req.url, `https://${req.headers.host}`).searchParams.get('fixture_id') ?? 'demo';
    // MVP: proxy-värden så modellen kan räkna EV
    res.status(200).json({
      source: 'proxy',
      fixture_id,
      xg: { home_att: 1.6, away_att: 1.3, home_def: 0.9, away_def: 1.1 }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
