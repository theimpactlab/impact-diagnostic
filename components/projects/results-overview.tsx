"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSESSMENT_DOMAINS, getScoreBackgroundColor } from "@/lib/constants"
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

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data for polar chart
    const labels = domainScores.map((d) => d.name)
    const data = domainScores.map((d) => d.score)
    const backgroundColors = domainScores.map((d) => getScoreBackgroundColor(d.score))

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
  }, [domainScores])

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
          <div className="text-7xl font-bold text-primary mb-4">{overallScore.toFixed(1)}</div>
          <p className="text-muted-foreground text-center">out of 10 possible points</p>
          <div className="mt-8 w-full">
            <h4 className="font-medium mb-2">Domain Completion</h4>
            <div className="space-y-2">
              {ASSESSMENT_DOMAINS.map((domain) => {
                const domainData = domainScores.find((d) => d.id === domain.id)
                const progress = domainData?.progress || 0

                return (
                  <div key={domain.id} className="flex items-center justify-between text-sm">
                    <span>{domain.name}</span>
                    <span className={progress === 100 ? "text-green-600" : "text-amber-600"}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
