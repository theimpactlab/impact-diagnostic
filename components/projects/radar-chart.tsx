"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
}

interface RadarChartProps {
  domainScores: DomainScore[]
}

export default function AssessmentRadarChart({ domainScores }: RadarChartProps) {
  // Transform domain scores for radar chart
  const chartData = domainScores
    .filter((domain) => domain.score > 0) // Only show domains with scores
    .map((domain) => ({
      domain: domain.name.length > 20 ? domain.name.substring(0, 17) + "..." : domain.name,
      score: domain.score,
      fullName: domain.name,
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No assessment data available</p>
          <p className="text-sm">Complete domain assessments to see the radar chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: "#666" }} className="text-xs" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: "#999" }} tickCount={6} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
