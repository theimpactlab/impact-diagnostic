"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getScoreBackgroundColor, getScoreColor } from "@/lib/constants"
import Chart from "chart.js/auto"

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
}

interface ResultsOverviewProps {
  domainScores: DomainScore[]
  overallScore: number
}

export default function ResultsOverview({ domainScores, overallScore }: ResultsOverviewProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Filter out the "details" domain if it exists
  const assessmentDomainScores = domainScores.filter((d) => d.id !== "details")

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data for radar chart
    const labels = assessmentDomainScores.map((d) => d.name)
    const data = assessmentDomainScores.map((d) => d.score)

    // Explicit RAG colors based on score ranges
    const getChartColor = (score: number) => {
      if (score < 3.5) return "rgba(239, 68, 68, 0.7)" // Red with transparency
      if (score < 7) return "rgba(245, 158, 11, 0.7)" // Amber with transparency
      return "rgba(34, 197, 94, 0.7)" // Green with transparency
    }

    const getBorderColor = (score: number) => {
      if (score < 3.5) return "rgb(239, 68, 68)" // Red
      if (score < 7) return "rgb(245, 158, 11)" // Amber
      return "rgb(34, 197, 94)" // Green
    }

    const backgroundColors = assessmentDomainScores.map((d) => getChartColor(d.score))
    const borderColors = assessmentDomainScores.map((d) => getBorderColor(d.score))

    // Create radar chart
    chartInstance.current = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels,
        datasets: [
          {
            label: "Domain Scores",
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Impact Diagnostic Assessment",
            font: {
              size: 18,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw || 0
                return `${label}: ${value.toFixed(1)}`
              },
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
  }, [assessmentDomainScores])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Impact Assessment Results</CardTitle>
          <CardDescription>Overview of scores across all assessment domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-square">
            <canvas ref={chartRef} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
          <CardDescription>Average score across all completed domains</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <div className={`text-7xl font-bold ${getScoreColor(overallScore)} mb-4`}>{overallScore.toFixed(1)}</div>
          <p className="text-muted-foreground text-center">out of 10 possible points</p>

          <div className="mt-8 w-full">
            <h4 className="font-medium mb-4">Domain Scores</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessmentDomainScores.map((domain) => (
                <div
                  key={domain.id}
                  className="p-3 rounded-lg shadow-sm flex justify-between items-center"
                  style={{ backgroundColor: getScoreBackgroundColor(domain.score) }}
                >
                  <span className="text-sm font-medium">{domain.name}</span>
                  <span className={`text-lg font-bold ${getScoreColor(domain.score)}`}>{domain.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
