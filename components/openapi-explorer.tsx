"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { OpenAPIClient } from "@/lib/openapi-client"
import { EndpointForm } from "./endpoint-form"
import type { OpenAPIEndpoint, HttpMethod } from "@/types/openapi"

interface OpenAPIExplorerProps {
  openapiUrl: string
}

export function OpenAPIExplorer({ openapiUrl }: OpenAPIExplorerProps) {
  const [endpoints, setEndpoints] = useState<OpenAPIEndpoint[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenAPIEndpoint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEndpoints()
  }, [openapiUrl])

  const loadEndpoints = async () => {
    setLoading(true)
    setError(null)

    try {
      const client = new OpenAPIClient(openapiUrl)
      const fetchedEndpoints = await client.getEndpoints()
      setEndpoints(fetchedEndpoints)
      setSelectedEndpoint(fetchedEndpoints[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load OpenAPI specification")
      setEndpoints([])
      setSelectedEndpoint(null)
    } finally {
      setLoading(false)
    }
  }

  const getMethodColor = (method: HttpMethod): string => {
    const colors = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      PATCH: "bg-orange-500",
      DELETE: "bg-red-500",
    }
    return colors[method] || "bg-gray-500"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading OpenAPI specification...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p className="font-semibold">Error loading OpenAPI specification</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (endpoints.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No endpoints found in the OpenAPI specification</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEndpoint?.id || ""}
            onValueChange={(value) => {
              const endpoint = endpoints.find((e) => e.id === value)
              setSelectedEndpoint(endpoint || null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an endpoint to test" />
            </SelectTrigger>
            <SelectContent>
              {endpoints.map((endpoint) => (
                <SelectItem key={endpoint.id} value={endpoint.id}>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getMethodColor(endpoint.method)} text-white`}>{endpoint.method}</Badge>
                    <span>{endpoint.path}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEndpoint && (
        <EndpointForm endpoint={selectedEndpoint} baseUrl={openapiUrl.replace("/swagger/v1/swagger.json", "")} />
      )}
    </div>
  )
}
