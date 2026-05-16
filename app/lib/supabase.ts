import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for client-side use
let _client: ReturnType<typeof createSupabaseClient> | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: always create fresh (but shouldn't be called during build)
    return createSupabaseClient()
  }
  if (!_client) {
    _client = createSupabaseClient()
  }
  return _client
}

// Default export used in hooks/components
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createSupabaseClient>]
  },
})
