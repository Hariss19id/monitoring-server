import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

type Params = Promise<{ server_id: string }>

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { server_id } = await params
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('metrics_history')
    .select('*')
    .eq('server_id', server_id)
    .order('recorded_at', { ascending: false })
    .limit(288) // 24 jam @ 1 per 5 menit

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.reverse())
}
