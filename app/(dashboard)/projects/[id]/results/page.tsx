import ResultsView from "./client"

export function generateStaticParams() {
  return [{ id: "_" }]
}

export default function ResultsPage() {
  return <ResultsView />
}
