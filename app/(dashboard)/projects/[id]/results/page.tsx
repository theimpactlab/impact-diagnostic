import NotesExportButton from "@/components/projects/notes-export-button"
import DownloadResultsButton from "@/components/projects/download-results-button"

const ResultsPage = ({ project, domainScores, overallScore }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name} - Assessment Results</h1>
        <div className="flex gap-2">
          <NotesExportButton
            projectName={project.name}
            organizationName={project.organizations?.name || "Unknown Organization"}
            domainNotes={domainScores.map((domain) => ({
              domainId: domain.id,
              domainName: domain.name,
              notes: domain.questionScores
                .filter((q) => q.notes && q.notes.trim() !== "")
                .map((q) => ({
                  question_id: q.question_id,
                  domain: domain.id,
                  score: q.score,
                  notes: q.notes || "",
                })),
              totalNotes: domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length,
            }))}
          />
          <DownloadResultsButton
            projectName={project.name}
            organizationName={project.organizations?.name || "Unknown Organization"}
            domainScores={domainScores}
            overallScore={overallScore}
          />
        </div>
      </div>
      {/* ** rest of code here **/}
    </div>
  )
}

export default ResultsPage
