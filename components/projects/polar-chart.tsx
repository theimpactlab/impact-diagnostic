"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Cell,
} from "recharts"

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

// Color palette for different domains
const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#ec4899", // Pink
  "#6366f1", // Indigo
]

export default function AssessmentPolarChart({ domainScores }: PolarChartProps) {
  // Transform domain scores for polar chart
  const chartData = domainScores
    .filter((domain) => domain.score > 0) // Only show domains with scores
    .map((domain, index) => ({
      name: domain.name.length > 15 ? domain.name.substring(0, 12) + "..." : domain.name,
      value: domain.score,
      fill: COLORS[index % COLORS.length],
      fullName: domain.name,
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>No assessment data available</p>
          <p className="text-sm">Complete domain assessments to see the polar chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          data={chartData}
          startAngle={90}
          endAngle={450}
        >
          <PolarGrid gridType="circle" />
          <PolarAngleAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#666" }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 9, fill: "#999" }}
            tickCount={6}
            axisLine={false}
          />
          <RadialBar dataKey="value" cornerRadius={4} fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-xs text-gray-600" title={entry.fullName}>
              {entry.name}: {entry.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
