import { ArrowUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import Login from "./components/Login"

export default function App() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row p-8">
      <Button variant="outline"><Login /></Button>
    </div>
  )
}
