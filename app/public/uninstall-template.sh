#!/bin/bash
# ================================================
# Monitor Agent - UNINSTALL
# ServerWatch - monitoring-server
# ================================================

SCRIPT_NAME="monitor-agent.sh"
SERVER_ID="{{SERVER_ID}}"
SUPABASE_URL="{{SUPABASE_URL}}"
SUPABASE_KEY="{{SUPABASE_KEY}}"

echo "🗑️  Menghapus ServerWatch Monitor Agent..."

# 1. Hapus dari crontab
echo "  → Menghapus cron job..."
crontab -l 2>/dev/null | grep -v "$SCRIPT_NAME" | crontab - 2>/dev/null
echo "  ✓ Cron job dihapus"

# 2. Hapus file agent
AGENT_PATH=""
for loc in "$HOME/$SCRIPT_NAME" "/home/zaki/$SCRIPT_NAME" "/root/$SCRIPT_NAME" "$(pwd)/$SCRIPT_NAME"; do
  if [ -f "$loc" ]; then
    AGENT_PATH="$loc"
    break
  fi
done

if [ -n "$AGENT_PATH" ]; then
  rm -f "$AGENT_PATH"
  echo "  ✓ File agent dihapus: $AGENT_PATH"
else
  echo "  ⚠ File agent tidak ditemukan (mungkin sudah dihapus)"
fi

# 3. Hapus file uninstall ini sendiri
SELF_SCRIPT="uninstall-monitor.sh"
for loc in "$HOME/$SELF_SCRIPT" "/home/zaki/$SELF_SCRIPT" "/root/$SELF_SCRIPT" "$(pwd)/$SELF_SCRIPT"; do
  if [ -f "$loc" ]; then
    rm -f "$loc"
    break
  fi
done

# 4. Update status server ke Supabase (last_seen lama → deteksi offline)
if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "{{SUPABASE_URL}}" ]; then
  echo "  → Notifikasi server dihapus..."
  curl -s -X PATCH \
    "${SUPABASE_URL}/rest/v1/servers?id=eq.${SERVER_ID}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"last_seen\": \"2000-01-01T00:00:00Z\"}" > /dev/null 2>&1
  echo "  ✓ Server ditandai offline"
fi

echo ""
echo "✅ ServerWatch Monitor Agent berhasil diuninstall!"
echo "   Server akan otomatis offline di dashboard dalam ~90 detik."
echo "   Untuk menghapus server permanen, gunakan halaman Servers di dashboard."
