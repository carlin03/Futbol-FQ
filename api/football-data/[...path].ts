import type { VercelRequest, VercelResponse } from '@vercel/node'
import { proxyFetch, queryPath } from '../lib/proxy'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.FOOTBALL_DATA_TOKEN || process.env.VITE_FOOTBALL_DATA_TOKEN
  if (!token) {
    return res.status(503).json({
      error: 'Configura FOOTBALL_DATA_TOKEN (o VITE_FOOTBALL_DATA_TOKEN) en Vercel → Settings → Environment Variables',
    })
  }

  return proxyFetch(req, res, {
    upstreamBase: 'https://api.football-data.org/v4',
    path: queryPath(req),
    headers: {
      Accept: 'application/json',
      'X-Auth-Token': token,
    },
    cacheSeconds: 45,
  })
}
