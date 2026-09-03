import DomainView from "./client"

export function generateStaticParams() {
  return [{ id: "_", domain: "_" }]
}

export default function DomainPage() {
  return <DomainView />
}
