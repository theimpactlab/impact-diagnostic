import DetailsView from "./client"

export function generateStaticParams() {
  return [{ id: "_" }]
}

export default function DetailsPage() {
  return <DetailsView />
}
