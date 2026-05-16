#!/bin/bash
# ================================================
# Monitor Agent - monitoring-server
# Generated: auto-injected credentials
# ================================================

SUPABASE_URL="{{SUPABASE_URL}}"
SUPABASE_KEY="{{SUPABASE_KEY}}"
SERVER_ID="{{SERVER_ID}}"
INTERVAL=5
LOOP_COUNT=11

supabase_insert() {
  local table=$1
  local payload=$2
  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/${table}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$payload" > /dev/null 2>&1
}

supabase_upsert() {
  local table=$1
  local payload=$2
  local on_conflict=$3
  curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/${table}?on_conflict=${on_conflict}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates,return=minimal" \
    -d "$payload" > /dev/null 2>&1
}

supabase_patch() {
  local table=$1
  local filter=$2
  local payload=$3
  curl -s -X PATCH \
    "${SUPABASE_URL}/rest/v1/${table}?${filter}" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$payload" > /dev/null 2>&1
}

get_cpu_usage() {
  local cpu1=$(grep '^cpu ' /proc/stat)
  sleep 0.3
  local cpu2=$(grep '^cpu ' /proc/stat)
  local idle1=$(echo $cpu1 | awk '{print $5}')
  local total1=$(echo $cpu1 | awk '{s=0; for(i=2;i<=NF;i++) s+=$i; print s}')
  local idle2=$(echo $cpu2 | awk '{print $5}')
  local total2=$(echo $cpu2 | awk '{s=0; for(i=2;i<=NF;i++) s+=$i; print s}')
  local diff_idle=$((idle2 - idle1))
  local diff_total=$((total2 - total1))
  if [ $diff_total -eq 0 ]; then echo "0.0"; return; fi
  awk "BEGIN {printf \"%.1f\", (1 - $diff_idle/$diff_total) * 100}"
}

get_cpu_temp() {
  local temp=0
  for zone in /sys/class/thermal/thermal_zone*/temp; do
    if [ -f "$zone" ]; then
      local t=$(cat "$zone" 2>/dev/null)
      if [ -n "$t" ] && [ "$t" -gt 0 ] 2>/dev/null; then
        temp=$(awk "BEGIN {printf \"%.1f\", $t/1000}")
        break
      fi
    fi
  done
  echo "$temp"
}

get_cpu_cores() { nproc --all 2>/dev/null || echo 1; }

get_ram() {
  local mem_total=$(awk '/MemTotal/{print $2}' /proc/meminfo)
  local mem_avail=$(awk '/MemAvailable/{print $2}' /proc/meminfo)
  local mem_used=$((mem_total - mem_avail))
  local swap_total=$(awk '/SwapTotal/{print $2}' /proc/meminfo)
  local swap_free=$(awk '/SwapFree/{print $2}' /proc/meminfo)
  local swap_used=$((swap_total - swap_free))
  echo "$((mem_total*1024)) $((mem_used*1024)) $((mem_avail*1024)) $((swap_total*1024)) $((swap_used*1024))"
}

get_disk_json() {
  if command -v python3 &>/dev/null; then
    python3 -c "
import subprocess, json
r = subprocess.run(['df','-B1','--output=target,size,used,avail,pcent'],capture_output=True,text=True)
lines = r.stdout.strip().split('\n')[1:]
disks = []
for line in lines:
  p = line.split()
  if len(p)>=5 and not p[0].startswith('/dev/loop') and p[0] not in ['tmpfs','devtmpfs','udev']:
    try:
      disks.append({'path':p[0],'total':int(p[1]),'used':int(p[2]),'free':int(p[3]),'use_pct':int(p[4].replace('%',''))})
    except: pass
print(json.dumps(disks))
" 2>/dev/null
  else
    echo "[]"
  fi
}

get_net_stats() {
  local iface=$(ip route 2>/dev/null | awk '/default/{print $5; exit}')
  [ -z "$iface" ] && iface=$(ls /sys/class/net | grep -v lo | head -1)
  [ -z "$iface" ] && echo "0 0 lo" && return
  local line=$(grep " $iface:" /proc/net/dev 2>/dev/null | head -1)
  local rx=$(echo "$line" | awk '{print $2}')
  local tx=$(echo "$line" | awk '{print $10}')
  rx=${rx:-0}; tx=${tx:-0}
  echo "$rx $tx $iface"
}

get_services_json() {
  if command -v systemctl &>/dev/null && command -v python3 &>/dev/null; then
    python3 -c "
import subprocess, json
r = subprocess.run(['systemctl','list-units','--type=service','--no-pager','--no-legend','--all'],capture_output=True,text=True)
services=[]
for line in r.stdout.strip().split('\n')[:30]:
  p=line.split()
  if len(p)>=4:
    services.append({'name':p[0].replace('.service',''),'status':p[3],'sub':p[4] if len(p)>4 else ''})
print(json.dumps(services))
" 2>/dev/null || echo "[]"
  else
    echo "[]"
  fi
}

get_os_info() {
  local hostname=$(hostname 2>/dev/null || echo "unknown")
  local kernel=$(uname -r 2>/dev/null || echo "unknown")
  local arch=$(uname -m 2>/dev/null || echo "unknown")
  local distro="Linux"
  [ -f /etc/os-release ] && distro=$(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)
  local uptime_sec=$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo 0)
  echo "${hostname}|${kernel}|${arch}|${distro}|${uptime_sec}"
}

get_load_avg() {
  awk '{print $1}' /proc/loadavg 2>/dev/null || echo "0"
}

# === MAIN ===
OS_INFO=$(get_os_info)
OS_HOSTNAME=$(echo "$OS_INFO" | cut -d'|' -f1)
OS_KERNEL=$(echo "$OS_INFO"   | cut -d'|' -f2)
OS_ARCH=$(echo "$OS_INFO"     | cut -d'|' -f3)
OS_DISTRO=$(echo "$OS_INFO"   | cut -d'|' -f4)
OS_UPTIME=$(echo "$OS_INFO"   | cut -d'|' -f5)

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Update server info
supabase_patch "servers" "id=eq.${SERVER_ID}" "{
  \"last_seen\": \"$NOW\",
  \"hostname\": \"$OS_HOSTNAME\",
  \"kernel\": \"$OS_KERNEL\",
  \"distro\": \"$OS_DISTRO\",
  \"arch\": \"$OS_ARCH\",
  \"uptime_sec\": $OS_UPTIME
}"

NET_INIT=$(get_net_stats)
PREV_RX=$(echo "$NET_INIT" | awk '{print $1}')
PREV_TX=$(echo "$NET_INIT" | awk '{print $2}')
NET_IFACE=$(echo "$NET_INIT" | awk '{print $3}')

DISK_JSON=$(get_disk_json)

for i in $(seq 1 $LOOP_COUNT); do
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  CPU_USAGE=$(get_cpu_usage)
  CPU_TEMP=$(get_cpu_temp)
  CPU_CORES=$(get_cpu_cores)
  LOAD_AVG=$(get_load_avg)

  RAM_DATA=$(get_ram)
  RAM_TOTAL=$(echo "$RAM_DATA" | awk '{print $1}')
  RAM_USED=$(echo "$RAM_DATA"  | awk '{print $2}')
  RAM_FREE=$(echo "$RAM_DATA"  | awk '{print $3}')
  SWAP_TOTAL=$(echo "$RAM_DATA"| awk '{print $4}')
  SWAP_USED=$(echo "$RAM_DATA" | awk '{print $5}')

  NET_NOW=$(get_net_stats)
  CUR_RX=$(echo "$NET_NOW" | awk '{print $1}')
  CUR_TX=$(echo "$NET_NOW" | awk '{print $2}')

  NET_UP=$(( (CUR_TX - PREV_TX) / INTERVAL ))
  NET_DOWN=$(( (CUR_RX - PREV_RX) / INTERVAL ))
  [ "$NET_UP" -lt 0 ] 2>/dev/null && NET_UP=0
  [ "$NET_DOWN" -lt 0 ] 2>/dev/null && NET_DOWN=0
  PREV_RX=$CUR_RX; PREV_TX=$CUR_TX

  UPTIME_SEC=$(awk '{print int($1)}' /proc/uptime 2>/dev/null || echo 0)

  supabase_insert "metrics_snapshots" "{
    \"server_id\": \"$SERVER_ID\",
    \"created_at\": \"$TIMESTAMP\",
    \"cpu_usage\": $CPU_USAGE,
    \"cpu_temp\": $CPU_TEMP,
    \"cpu_cores\": $CPU_CORES,
    \"ram_total\": $RAM_TOTAL,
    \"ram_used\": $RAM_USED,
    \"ram_free\": $RAM_FREE,
    \"swap_total\": $SWAP_TOTAL,
    \"swap_used\": $SWAP_USED,
    \"disk\": $DISK_JSON,
    \"net_up\": $NET_UP,
    \"net_down\": $NET_DOWN,
    \"net_total_up\": $CUR_TX,
    \"net_total_down\": $CUR_RX,
    \"uptime_sec\": $UPTIME_SEC
  }"

  if [ "$i" -eq "$LOOP_COUNT" ]; then
    supabase_insert "metrics_history" "{
      \"server_id\": \"$SERVER_ID\",
      \"cpu_usage\": $CPU_USAGE,
      \"ram_used\": $RAM_USED,
      \"ram_total\": $RAM_TOTAL,
      \"net_up\": $NET_UP,
      \"net_down\": $NET_DOWN
    }"

    TODAY=$(date -u +%Y-%m-%d)
    supabase_upsert "bandwidth_daily" "{
      \"server_id\": \"$SERVER_ID\",
      \"date\": \"$TODAY\",
      \"total_up\": $CUR_TX,
      \"total_down\": $CUR_RX
    }" "server_id,date"

    SERVICES_JSON=$(get_services_json)
    DISK_JSON=$(get_disk_json)

    supabase_upsert "services_status" "{
      \"server_id\": \"$SERVER_ID\",
      \"services\": $SERVICES_JSON,
      \"updated_at\": \"$TIMESTAMP\"
    }" "server_id"

    supabase_patch "servers" "id=eq.${SERVER_ID}" "{
      \"last_seen\": \"$TIMESTAMP\",
      \"uptime_sec\": $UPTIME_SEC
    }"
  fi

  sleep $INTERVAL
done
