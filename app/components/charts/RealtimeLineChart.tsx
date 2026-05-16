'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface DataPoint { time: string; value: number }

interface Props {
  data: DataPoint[]
  label: string
  color: string
  unit?: string
  height?: number
}

export default function RealtimeLineChart({ data, label, color, unit = '%', height = 160 }: Props) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label,
        data: data.map(d => d.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        borderWidth: 1,
        titleColor: '#9CA3AF',
        bodyColor: '#F9FAFB',
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y.toFixed(1)}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(55,65,81,0.3)' },
        ticks: {
          color: '#6B7280',
          font: { size: 10, family: 'JetBrains Mono' },
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: { color: 'rgba(55,65,81,0.3)' },
        ticks: {
          color: '#6B7280',
          font: { size: 10, family: 'JetBrains Mono' },
          callback: (v: any) => `${v}${unit}`,
        },
        min: 0,
        max: unit === '%' ? 100 : undefined,
      },
    },
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
