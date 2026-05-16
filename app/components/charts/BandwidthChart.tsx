'use client'

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface DataPoint { time: string; up: number; down: number }

interface Props { data: DataPoint[]; height?: number }

export default function BandwidthChart({ data, height = 180 }: Props) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Upload',
        data: data.map(d => Math.round(d.up / 1024)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Download',
        data: data.map(d => Math.round(d.down / 1024)),
        borderColor: '#60A5FA',
        backgroundColor: 'rgba(96,165,250,0.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: {
        display: true,
        labels: { color: '#9CA3AF', font: { size: 11 }, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        borderColor: '#374151',
        borderWidth: 1,
        titleColor: '#9CA3AF',
        bodyColor: '#F9FAFB',
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} KB/s`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(55,65,81,0.3)' },
        ticks: { color: '#6B7280', font: { size: 10 }, maxTicksLimit: 6 },
      },
      y: {
        grid: { color: 'rgba(55,65,81,0.3)' },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          callback: (v: any) => `${v} KB/s`,
        },
        min: 0,
      },
    },
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
