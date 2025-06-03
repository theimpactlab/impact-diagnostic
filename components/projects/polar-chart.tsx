"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Cell,
  Legend,
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
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="30%"
          outerRadius="70%"
          data={chartData}
          startAngle={90}
          endAngle={450}
        >
          <PolarGrid gridType="circle" />
          <PolarAngleAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#666" }} className="text-xs" />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "#999" }}
            tickCount={6}
            axisLine={false}
          />
          <RadialBar dataKey="value" cornerRadius={3} fill="#8884d8" background={{ fill: "#f1f5f9" }} minAngle={15}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </RadialBar>
          <Legend
            iconSize={8}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
            formatter={(value, entry) => `${entry.payload.fullName}: ${entry.payload.value.toFixed(1)}`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}
