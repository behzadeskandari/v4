"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"

interface RequestOverrideModalProps {
  currentValue: any
  onSave: (value: any) => void
}

export function RequestOverrideModal({ currentValue, onSave }: RequestOverrideModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonValue, setJsonValue] = useState("")
  const [error, setError] = useState("")

  const handleOpen = () => {
    setJsonValue(JSON.stringify(currentValue, null, 2))
    setError("")
    setIsOpen(true)
  }

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonValue)
      onSave(parsed)
      setIsOpen(false)
      setError("")
    } catch (err) {
      setError("Invalid JSON format. Please check your syntax.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <Edit className="h-4 w-4 mr-2" />
          Edit JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Request Payload</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="json-editor">Request JSON</Label>
            <Textarea
              id="json-editor"
              value={jsonValue}
              onChange={(e) => setJsonValue(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              placeholder="Enter valid JSON..."
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
