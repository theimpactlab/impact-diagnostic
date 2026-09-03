import ProjectView from "./client"

export function generateStaticParams() {
  // Static export placeholder — the real id is parsed from the URL at runtime
  return [{ id: "_" }]
}

export default function ProjectPage() {
  return <ProjectView />
}
