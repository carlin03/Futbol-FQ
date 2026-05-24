import type { VercelRequest, VercelResponse } from '@vercel/node'
import { proxyFetch, queryPath } from '../lib/proxy'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY
  if (!key) {
    return res.status(503).json({
      error: 'Configura API_FOOTBALL_KEY (o VITE_API_FOOTBALL_KEY) en Vercel → Settings → Environment Variables',
    })
  }

  return proxyFetch(req, res, {
    upstreamBase: 'https://v3.football.api-sports.io',
    path: queryPath(req),
    headers: {
      Accept: 'application/json',
      'x-apisports-key': key,
    },
    cacheSeconds: 30,
  })
}
