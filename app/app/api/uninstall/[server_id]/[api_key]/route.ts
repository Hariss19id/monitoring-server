import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import path from 'path'
import fs from 'fs'

type Params = Promise<{ server_id: string; api_key: string }>

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { server_id, api_key } = await params

  // Validate credentials
  const supabaseAdmin = getSupabaseAdmin()
  const { data: server, error } = await supabaseAdmin
    .from('servers')
    .select('id')
    .eq('id', server_id)
    .eq('api_key', api_key)
    .single()

  if (error || !server) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Read uninstall template
  const templatePath = path.join(process.cwd(), 'public', 'uninstall-template.sh')
  let script = fs.readFileSync(templatePath, 'utf-8')

  // Inject credentials + normalize line endings
  script = script
    .replace(/\{\{SERVER_ID\}\}/g, server_id)
    .replace(/\{\{SUPABASE_URL\}\}/g, process.env.NEXT_PUBLIC_SUPABASE_URL!)
    .replace(/\{\{SUPABASE_KEY\}\}/g, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
