'use client'
import { useEffect, useRef, useState } from 'react'

type DayData = { date: string; sent: number; received: number }

// Loads Chart.js from CDN and returns true when ready
function useChartJS() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // @ts-ignore
    if (window.Chart) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])
  return ready
}

function LineChart({ data }: { data: DayData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)
  const ready = useChartJS()

  useEffect(() => {
    if (!ready || !canvasRef.current) return
    // @ts-ignore
    const Chart = window.Chart
    if (chartRef.current) chartRef.current.destroy()

    const labels = data.map(d => d.date)
    const sparse = labels.map((l, i) => i % 5 === 0 ? l : '')

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: sparse,
        datasets: [
          {
            label: 'Sent',
            data: data.map(d => d.sent),
            borderColor: '#4338ca',
            backgroundColor: 'rgba(67,56,202,0.08)',
            borderWidth: 2, fill: true, tension: 0.4,
            pointRadius: 2, pointHoverRadius: 5,
          },
          {
            label: 'Received',
            data: data.map(d => d.received),
            borderColor: '#1D9E75',
            backgroundColor: 'rgba(29,158,117,0.08)',
            borderWidth: 2, fill: true, tension: 0.4,
            pointRadius: 2, pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
          tooltip: { callbacks: { title: (items: any) => labels[items[0].dataIndex] } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#f0f0ee' }, ticks: { font: { size: 11 }, precision: 0 } },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [ready, data])

  if (!ready) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Loading chart...</div>
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

function DonutChart({ tagCounts }: { tagCounts: Record<string, number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)
  const ready = useChartJS()

  useEffect(() => {
    if (!ready || !canvasRef.current) return
    // @ts-ignore
    const Chart = window.Chart
    if (chartRef.current) chartRef.current.destroy()

    const labels = Object.keys(tagCounts)
    const values = Object.values(tagCounts)
    const colors: Record<string, string> = {
      Lead: '#378add', Paid: '#639922', Pending: '#ef9f27', Untagged: '#b4b2a9',
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map(l => colors[l] ?? '#888'),
          borderWidth: 2, borderColor: '#fff',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 }, padding: 12 } },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [ready, tagCounts])

  if (!ready) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Loading chart...</div>
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

function BarChart({ broadcasts }: { broadcasts: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)
  const ready = useChartJS()

  useEffect(() => {
    if (!ready || !canvasRef.current) return
    // @ts-ignore
    const Chart = window.Chart
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: broadcasts.map(b => b.name.length > 14 ? b.name.slice(0, 14) + '…' : b.name),
        datasets: [{
          label: 'Messages sent',
          data: broadcasts.map(b => b.sent_count ?? 0),
          backgroundColor: 'rgba(67,56,202,0.75)',
          borderRadius: 6, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { title: (items: any) => broadcasts[items[0].dataIndex]?.name } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#f0f0ee' }, ticks: { font: { size: 11 }, precision: 0 } },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [ready, broadcasts])

  if (!ready) return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>Loading chart...</div>
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

export default function AnalyticsCharts({
  metrics,
  dailyData,
  tagCounts,
  templates,
  broadcasts,
}: {
  metrics: { label: string; value: number | string; sub: string }[]
  dailyData: DayData[]
  tagCounts: Record<string, number>
  templates: any[]
  broadcasts: any[]
}) {
  const totalMessages = dailyData.reduce((s, d) => s + d.sent + d.received, 0)
  const hasTagData    = Object.values(tagCounts).some(v => v > 0)
  const hasBroadcasts = broadcasts.length > 0

  return (
    <>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: '1.5rem' }}
        className="analytics-grid">
        {metrics.map(({ label, value, sub }) => (
          <div key={label} className="metric-card">
            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 500 }}>{value}</p>
            <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="card" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 15 }}>Message activity</p>
            <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Sent vs received — last 30 days</p>
          </div>
          <span style={{ fontSize: 13, color: '#888' }}>{totalMessages} total</span>
        </div>
        <div style={{ height: 220, width: '100%', position: 'relative' }}>
          {totalMessages > 0
            ? <LineChart data={dailyData} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No messages in the last 30 days</div>
          }
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        {/* Donut */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Contacts by tag</p>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            {Object.values(tagCounts).reduce((a, b) => a + b, 0)} total
          </p>
          <div style={{ height: 220, width: '100%', position: 'relative' }}>
            {hasTagData
              ? <DonutChart tagCounts={tagCounts} />
              : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No contacts yet</div>
            }
          </div>
        </div>

        {/* Bar */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Broadcast performance</p>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Messages sent per broadcast</p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
            <div style={{ height: 220, minWidth: Math.max(280, broadcasts.length * 80), position: 'relative' }}>
              {hasBroadcasts
                ? <BarChart broadcasts={broadcasts} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13 }}>No broadcasts sent yet</div>
              }
            </div>
          </div>
          {hasBroadcasts && broadcasts.length > 3 && (
            <p style={{ fontSize: 11, color: '#bbb', marginTop: 8, textAlign: 'center' }}>← Scroll to see all →</p>
          )}
        </div>
      </div>

      {/* Auto-reply table */}
      <div className="card">
        <p style={{ fontWeight: 500, fontSize: 15, marginBottom: 16 }}>Auto-reply rules</p>
        {templates.length > 0 ? templates.map((t: any, i: number) => (
          <div key={t.name} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', fontSize: 13,
            borderBottom: i < templates.length - 1 ? '1px solid #f0f0ee' : 'none',
          }}>
            <div>
              <p style={{ fontWeight: 500 }}>{t.name}</p>
              <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {t.trigger_keywords.slice(0, 4).join(', ')}
                {t.trigger_keywords.length > 4 && ` +${t.trigger_keywords.length - 4} more`}
              </p>
            </div>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500,
              background: t.is_active ? '#eaf3de' : '#f3f3f1',
              color: t.is_active ? '#27500a' : '#888',
            }}>
              {t.is_active ? 'Active' : 'Paused'}
            </span>
          </div>
        )) : (
          <p style={{ color: '#bbb', fontSize: 13 }}>No auto-reply rules yet.</p>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .analytics-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 480px) { .analytics-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}
