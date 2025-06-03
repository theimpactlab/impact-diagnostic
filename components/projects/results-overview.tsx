import type React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

interface ResultsOverviewProps {
  data: { subject: string; A: number; B: number; fullMark: number }[]
}

const ResultsOverview: React.FC<ResultsOverviewProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400} data-testid="radar-chart">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 150]} />
        <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default ResultsOverview
