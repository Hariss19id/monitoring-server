import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

type Params = Promise<{ server_id: string }>

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { server_id } = await params

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('servers')
    .delete()
    .eq('id', server_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
