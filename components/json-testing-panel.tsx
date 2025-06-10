"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Copy, FileText, Zap } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface JsonTestingPanelProps {
  value: string
  onChange: (value: string) => void
  schema?: any
  onSubmit: () => void
}

interface JsonValidationResult {
  isValid: boolean
  error?: string
  parsedValue?: any
  characterCount?: number
}

export function JsonTestingPanel({ value, onChange, schema, onSubmit }: JsonTestingPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)
  const [validationResult, setValidationResult] = useState<JsonValidationResult>({ isValid: true })

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Safe JSON validation function
  const validateJson = (jsonString: string): JsonValidationResult => {
    if (!jsonString || jsonString.trim() === "") {
      return { isValid: true, characterCount: 0 }
    }

    try {
      const parsed = JSON.parse(jsonString)
      const stringified = JSON.stringify(parsed)
      return {
        isValid: true,
        parsedValue: parsed,
        characterCount: stringified.length,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Invalid JSON",
      }
    }
  }

  // Validate JSON on change
  useEffect(() => {
    if (!isMounted) return

    const result = validateJson(value)
    setValidationResult(result)
  }, [value, isMounted])

  const generateTemplates = () => {
    if (!schema || !schema.properties) return []

    const templates = []

    // Minimal template with required fields only
    const requiredFields = schema.required || []
    if (requiredFields.length > 0) {
      const minimalTemplate: any = {}
      requiredFields.forEach((field: string) => {
        const prop = schema.properties[field]
        minimalTemplate[field] = getDefaultValue(prop)
      })
      templates.push({
        name: "minimal",
        label: "Minimal (Required Only)",
        data: minimalTemplate,
      })
    }

    // Complete template with all fields
    const completeTemplate: any = {}
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      completeTemplate[key] = getDefaultValue(prop)
    })
    templates.push({
      name: "complete",
      label: "Complete (All Fields)",
      data: completeTemplate,
    })

    // Example template with realistic data
    const exampleTemplate: any = {}
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      exampleTemplate[key] = getExampleValue(key, prop)
    })
    templates.push({
      name: "example",
      label: "Example (Sample Data)",
      data: exampleTemplate,
    })

    return templates
  }

  const getDefaultValue = (prop: any): any => {
    switch (prop.type) {
      case "string":
        return prop.enum ? prop.enum[0] : ""
      case "number":
      case "integer":
        return prop.minimum || 0
      case "boolean":
        return false
      case "array":
        return []
      case "object":
        return {}
      default:
        return ""
    }
  }

  const getExampleValue = (key: string, prop: any): any => {
    const keyLower = key.toLowerCase()

    switch (prop.type) {
      case "string":
        if (prop.enum) return prop.enum[0]
        if (prop.format === "email" || keyLower.includes("email")) return "user@example.com"
        if (prop.format === "date") return "2024-01-01"
        if (prop.format === "date-time") return "2024-01-01T12:00:00Z"
        if (keyLower.includes("name")) return "John Doe"
        if (keyLower.includes("title")) return "Sample Title"
        if (keyLower.includes("description")) return "This is a sample description"
        if (keyLower.includes("url")) return "https://example.com"
        if (keyLower.includes("phone")) return "+1-555-123-4567"
        return "Sample text"
      case "number":
      case "integer":
        if (keyLower.includes("age")) return 25
        if (keyLower.includes("price") || keyLower.includes("cost")) return 99.99
        if (keyLower.includes("count") || keyLower.includes("quantity")) return 10
        return prop.minimum || 42
      case "boolean":
        return true
      case "array":
        return ["item1", "item2"]
      case "object":
        return { key: "value" }
      default:
        return "sample"
    }
  }

  const applyTemplate = (templateName: string) => {
    const templates = generateTemplates()
    const template = templates.find((t) => t.name === templateName)
    if (template) {
      const jsonString = JSON.stringify(template.data, null, 2)
      onChange(jsonString)
    }
  }

  const formatJson = () => {
    if (validationResult.isValid && validationResult.parsedValue !== undefined) {
      const formatted = JSON.stringify(validationResult.parsedValue, null, 2)
      onChange(formatted)
    }
  }

  const copyToClipboard = async () => {
    if (typeof window !== "undefined" && navigator.clipboard && value) {
      try {
        await navigator.clipboard.writeText(value)
      } catch (error) {
        console.warn("Failed to copy to clipboard:", error)
        // Fallback for older browsers
        try {
          const textArea = document.createElement("textarea")
          textArea.value = value
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand("copy")
          document.body.removeChild(textArea)
        } catch (fallbackError) {
          console.warn("Fallback copy also failed:", fallbackError)
        }
      }
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const templates = generateTemplates()

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">JSON Editor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="json-input">JSON Request Body</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={formatJson} disabled={!validationResult.isValid}>
                <Zap className="h-4 w-4 mr-1" />
                Format
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!value}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              id="json-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              placeholder="Enter JSON request body..."
            />

            {!validationResult.isValid && validationResult.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>JSON Error: {validationResult.error}</AlertDescription>
              </Alert>
            )}

            {validationResult.isValid && value.trim() && validationResult.characterCount !== undefined && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Valid JSON ({validationResult.characterCount} characters)</AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-select">Choose a Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a JSON template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(templates.find((t) => t.name === selectedTemplate)?.data, null, 2)}
                  </pre>
                  <Button className="w-full mt-3" onClick={() => applyTemplate(selectedTemplate)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            )}

            {templates.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No templates available. Schema information is required to generate templates.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={onSubmit} disabled={!validationResult.isValid || !value.trim()} className="flex-1">
          Test with JSON
        </Button>
      </div>
    </div>
  )
}
