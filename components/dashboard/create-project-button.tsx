import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreateProjectButton() {
  return (
    <Button asChild>
      <Link href="/projects/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Project
      </Link>
    </Button>
  )
}
