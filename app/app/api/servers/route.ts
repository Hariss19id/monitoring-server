import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { randomBytes } from 'crypto'

// GET: list semua server
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('servers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: register server baru
export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const server_id = randomBytes(8).toString('hex')
  const api_key = randomBytes(16).toString('hex')

  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.from('servers').insert({
    id: server_id,
    name,
    api_key,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'
  const scriptUrl    = `${baseUrl}/api/agent/${server_id}/${api_key}`
  const uninstallUrl = `${baseUrl}/api/uninstall/${server_id}/${api_key}`

  const install_command =
    `script_name="monitor-agent.sh"; ` +
    `curl -fsSL "${scriptUrl}" -o "$PWD/$script_name" ` +
    `|| wget -O "$PWD/$script_name" "${scriptUrl}"; ` +
    `chmod +x "$PWD/$script_name"; ` +
    `(crontab -l 2>/dev/null | grep -v "$script_name"; ` +
    `echo "* * * * * /bin/bash $PWD/$script_name") | crontab -; ` +
    `echo "✅ Monitor berhasil diinstal!"`

  const uninstall_command =
    `u="uninstall-monitor.sh"; ` +
    `curl -fsSL "${uninstallUrl}" -o "$PWD/$u" ` +
    `|| wget -O "$PWD/$u" "${uninstallUrl}"; ` +
    `chmod +x "$PWD/$u"; bash "$PWD/$u"`

  return NextResponse.json({ server_id, api_key, install_command, uninstall_command })
}
