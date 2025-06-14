"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OpenAPIExplorer } from "@/components/openapi-explorer"
import { AuthConfig } from "@/components/auth-config"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  const [openapiUrl, setOpenapiUrl] = useState("http://localhost:5029/swagger/v1/swagger.json")
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">OpenAPI Forms Generator</h1>
          <p className="text-muted-foreground">Generate interactive forms from your OpenAPI specifications</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">OpenAPI Forms Generator</h1>
        <p className="text-muted-foreground">Generate interactive forms from your OpenAPI specifications</p>
      </div>

      <Navigation />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <AuthConfig />
      </div>

      {isValidUrl && openapiUrl && <OpenAPIExplorer openapiUrl={openapiUrl} />}
    </div>
  )
}
