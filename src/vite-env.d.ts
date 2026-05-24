/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_FOOTBALL_KEY: string
  readonly VITE_API_FOOTBALL_LEAGUE: string
  readonly VITE_API_FOOTBALL_SEASON: string
  readonly VITE_FOOTBALL_DATA_TOKEN: string
  readonly VITE_FOOTBALL_DATA_ENABLED: string
  readonly VITE_FOOTBALL_DATA_COMP: string
  readonly VITE_FOOTBALL_DATA_SEASON: string
  readonly VITE_FD_POLL_MS: string
  readonly VITE_LIVE_POLL_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
