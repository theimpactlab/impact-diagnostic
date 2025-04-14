import { getScoreBackgroundColor, getScoreColor } from "@/lib/constants"

interface ResultsOverviewProps {
  domainScores: {
    id: string
    name: string
    score: number
  }[]
  overallScore: number
}

export default function ResultsOverview({ domainScores, overallScore }: ResultsOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overall Score</h2>
        <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore.toFixed(1)}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {domainScores.map((domain) => (
          <div
            key={domain.id}
            className="p-4 rounded-lg shadow-sm"
            style={{ backgroundColor: getScoreBackgroundColor(domain.score) }}
          >
            <h3 className="text-lg font-medium">{domain.name}</h3>
            <p className={`text-2xl font-bold ${getScoreColor(domain.score)}`}>{domain.score.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
