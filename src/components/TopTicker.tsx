import TickerScroll from './ticker/TickerScroll'
import { useTickerItems } from '../hooks/useTickerItems'
import type { FdSyncMeta } from '../services/footballData'
import type { LiveSyncMeta } from '../services/apiFootball'
import type { DataSource } from '../hooks/useLiveSync'

interface Props {
  dataSource?: DataSource
  fdMeta?: FdSyncMeta
  apiMeta?: LiveSyncMeta
  dataConfigured?: boolean
}

function syncLabel(dataSource: DataSource, dataConfigured: boolean, fdMeta?: FdSyncMeta, apiMeta?: LiveSyncMeta): string {
  if (!dataConfigured) return 'LOCAL'
  if (dataSource === 'football-data') {
    if (fdMeta?.lastError) return 'SYNC'
    if (fdMeta?.finishedCount) return `${fdMeta.finishedCount} FT`
    return 'LIVE'
  }
  if (apiMeta?.planBlocked) return 'MANUAL'
  if (apiMeta?.liveCount) return `${apiMeta.liveCount} LIVE`
  return 'LIVE'
}

export default function TopTicker({ dataSource = 'manual', fdMeta, apiMeta, dataConfigured = false }: Props) {
  const { top } = useTickerItems()
  const label = syncLabel(dataSource, dataConfigured, fdMeta, apiMeta)
  const hasLive = top.some(s => s.type === 'live')

  return (
    <TickerScroll
      segments={top}
      label={label}
      speed={36}
      variant="top"
      topOffset={68}
      badgePulse={hasLive || label.includes('LIVE')}
    />
  )
}
