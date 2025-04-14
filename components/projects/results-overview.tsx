"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Chart from "chart.js/auto"

interface DomainScore {
  id: string
  name: string
  score: number
  completion: number
}

interface ResultsOverviewProps {
  domainScores: DomainScore[]
  projectId: string
}

export function ResultsOverview({ domainScores, projectId }: ResultsOverviewProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Calculate overall score
  const totalScore = domainScores.reduce((sum, domain) => sum + domain.score, 0)
  const overallScore = domainScores.length > 0 ? Math.round((totalScore / domainScores.length) * 10) / 10 : 0

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score < 3.5) return "rgb(239, 68, 68)" // Red
    if (score < 7) return "rgb(245, 158, 11)" // Amber
    return "rgb(34, 197, 94)" // Green
  }

  // Function to get background color with transparency
  const getScoreBackgroundColor = (score: number) => {
    if (score < 3.5) return "rgba(239, 68, 68, 0.7)" // Red with transparency
    if (score < 7) return "rgba(245, 158, 11, 0.7)" // Amber with transparency
    return "rgba(34, 197, 94, 0.7)" // Green with transparency
  }

  // Create chart when component mounts
  useEffect(() => {
    if (!chartRef.current || domainScores.length === 0) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Prepare data for chart
    const labels = domainScores.map((domain) => domain.name)
    const data = domainScores.map((domain) => domain.score)
    const backgroundColors = domainScores.map((domain) => getScoreBackgroundColor(domain.score))
    const borderColors = domainScores.map((domain) => getScoreColor(domain.score))

    // Create chart
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
        responsive: true,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 2,
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [domainScores])

  if (domainScores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Results Available</CardTitle>
          <CardDescription>Complete at least one assessment to see your results.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Domain Scores</CardTitle>
          <CardDescription>Visual representation of your scores across all domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-square">
            <canvas ref={chartRef} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Average score across all assessed domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-center py-4" style={{ color: getScoreColor(overallScore) }}>
              {overallScore.toFixed(1)}
              <span className="text-base text-gray-500 ml-1">/ 10</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Domain Breakdown</CardTitle>
            <CardDescription>Individual scores for each domain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {domainScores.map((domain) => (
                <div key={domain.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{domain.name}</span>
                    <span className="font-bold" style={{ color: getScoreColor(domain.score) }}>
                      {domain.score.toFixed(1)}
                    </span>
                  </div>
                  <Progress
                    value={domain.score * 10}
                    className="h-2"
                    style={
                      {
                        backgroundColor: "rgba(0,0,0,0.1)",
                        "--progress-background": getScoreColor(domain.score),
                      } as any
                    }
                  />
                  <div className="text-xs text-gray-500 text-right">{domain.completion}% complete</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
