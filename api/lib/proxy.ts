type Query = Record<string, string | string[] | undefined>

export type VercelReq = { method?: string; query: Query }
export type VercelRes = {
  status: (code: number) => VercelRes
  setHeader: (name: string, value: string) => void
  send: (body: string) => void
  json: (body: unknown) => void
  end: () => void
}

export function queryPath(req: VercelReq): string {
  const segments = req.query.path
  if (Array.isArray(segments)) return segments.join('/')
  return segments ?? ''
}

export function forwardQuery(req: VercelReq, target: URL, skip = new Set(['path'])) {
  Object.entries(req.query).forEach(([key, val]) => {
    if (skip.has(key) || val == null) return
    if (Array.isArray(val)) val.forEach(v => target.searchParams.append(key, v))
    else target.searchParams.set(key, val)
  })
}

export async function proxyFetch(
  req: VercelReq,
  res: VercelRes,
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
