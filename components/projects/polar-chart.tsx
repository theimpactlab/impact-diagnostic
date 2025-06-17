"use client"

import { useRef, useEffect } from "react"
import Chart from "chart.js/auto"
import ChartDataLabels from "chartjs-plugin-datalabels"

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
}

interface PolarChartProps {
  domainScores: DomainScore[]
}

// Color function to match scores with colors
function getScoreBackgroundColor(score: number): string {
  if (score >= 8) return "rgba(34, 197, 94, 0.7)" // Green for high scores
  if (score >= 6) return "rgba(245, 158, 11, 0.7)" // Amber for good scores
  if (score >= 4) return "rgba(245, 158, 11, 0.7)" // Amber for medium scores
  if (score >= 2) return "rgba(239, 68, 68, 0.7)" // Red for low scores
  return "rgba(156, 163, 175, 0.7)" // Gray for very low scores
}

Chart.register(ChartDataLabels)

export default function AssessmentPolarChart({ domainScores }: PolarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Filter domains with scores > 0
    const validDomains = domainScores.filter((d) => d.score > 0)

    if (validDomains.length === 0) {
      return
    }

    // Prepare data for polar chart
    const labels = validDomains.map((d) => d.name)
    const data = validDomains.map((d) => d.score)
    const backgroundColors = validDomains.map((d) => getScoreBackgroundColor(d.score))

    // Create polar chart
    chartInstance.current = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels,
        datasets: [
          {
            label: "Domain Scores",
            data,
            backgroundColor: backgroundColors,
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: {
            top: 60,
            bottom: 60,
            left: 60,
            right: 60,
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
              font: {
                size: 12,
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            angleLines: {
              color: "rgba(0, 0, 0, 0.1)",
            },
            pointLabels: {
              display: false, // Hide default point labels to avoid confusion
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 14,
            },
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw || 0
                return `${label}: ${Number(value).toFixed(1)}/10`
              },
            },
          },
          datalabels: {
            display: true,
            color: "#374151",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderColor: "#d1d5db",
            borderWidth: 1,
            borderRadius: 4,
            font: {
              size: 11,
              weight: "600",
            },
            padding: {
              top: 4,
              bottom: 4,
              left: 6,
              right: 6,
            },
            align: "end",
            anchor: "end",
            offset: 15,
            formatter: (value: number, context: any) => {
              const label = context.chart.data.labels?.[context.dataIndex] || ""
              // Split long labels into multiple lines
              if (label.length > 15) {
                const words = label.split(" ")
                if (words.length > 1) {
                  const mid = Math.ceil(words.length / 2)
                  return words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ")
                }
              }
              return label
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [domainScores])

  // Check if there's any data to display
  const hasData = domainScores.some((d) => d.score > 0)

  if (!hasData) {
    return (
      <div className="h-[600px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No assessment data available</p>
          <p className="text-sm">Complete domain assessments to see the polar chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full flex items-center justify-center">
      <div className="h-full w-full">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
