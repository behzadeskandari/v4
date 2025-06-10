"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OpenAPIExplorer } from "@/components/openapi-explorer"

export default function HomePage() {
  const [openapiUrl, setOpenapiUrl] = useState("http://localhost:5029/swagger/v1/swagger.json")
  const [isValidUrl, setIsValidUrl] = useState(true)

  const handleUrlChange = (value: string) => {
    setOpenapiUrl(value)
    // Basic URL validation
    try {
      new URL(value)
      setIsValidUrl(true)
    } catch {
      setIsValidUrl(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OpenAPI Forms Generator</h1>
        <p className="text-muted-foreground">Generate interactive forms from your OpenAPI specifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenAPI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openapi-url">OpenAPI Specification URL</Label>
            <Input
              id="openapi-url"
              type="url"
              value={openapiUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter your OpenAPI/Swagger JSON URL"
              className={!isValidUrl ? "border-red-500" : ""}
            />
            {!isValidUrl && <p className="text-sm text-red-500">Please enter a valid URL</p>}
          </div>
        </CardContent>
      </Card>

      {isValidUrl && openapiUrl && <OpenAPIExplorer openapiUrl={openapiUrl} />}
    </div>
  )
}
