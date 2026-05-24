import { proxyFetch, queryPath } from '../lib/proxy'

type Query = Record<string, string | string[] | undefined>
type VercelReq = { method?: string; query: Query }
type VercelRes = {
  status: (code: number) => VercelRes
  setHeader: (name: string, value: string) => void
  send: (body: string) => void
  json: (body: unknown) => void
}

export default async function handler(req: VercelReq, res: VercelRes) {
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
