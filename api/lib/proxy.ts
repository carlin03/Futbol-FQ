import type { VercelRequest, VercelResponse } from '@vercel/node'

export function queryPath(req: VercelRequest): string {
  const segments = req.query?.path
  if (Array.isArray(segments)) return segments.join('/')
  if (typeof segments === 'string') return segments
  return ''
}

export function forwardQuery(req: VercelRequest, target: URL, skip = new Set(['path'])) {
  const query = req.query ?? {}
  Object.entries(query).forEach(([key, val]) => {
    if (skip.has(key) || val == null) return
    if (Array.isArray(val)) val.forEach(v => target.searchParams.append(key, String(v)))
    else target.searchParams.set(key, String(val))
  })
}

export async function proxyFetch(
  req: VercelRequest,
  res: VercelResponse,
  opts: {
    upstreamBase: string
    path: string
    headers: Record<string, string>
    cacheSeconds?: number
  }
) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const target = new URL(`${opts.upstreamBase.replace(/\/$/, '')}/${opts.path.replace(/^\//, '')}`)
  forwardQuery(req, target)

  const upstream = await fetch(target.toString(), {
    method: req.method || 'GET',
    headers: opts.headers,
  })

  const body = await upstream.text()
  res.status(upstream.status)
  res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'application/json')
  if (opts.cacheSeconds != null) {
    res.setHeader('Cache-Control', `s-maxage=${opts.cacheSeconds}, stale-while-revalidate=60`)
  }
  return res.send(body)
}
