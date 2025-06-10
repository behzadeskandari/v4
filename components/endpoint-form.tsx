"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Send, Code, Eye } from "lucide-react"
import { JsonSchemaForm } from "./json-schema-form"
import { ResponseViewer } from "./response-viewer"
import { RequestOverrideModal } from "./request-override-modal"
import type { OpenAPIEndpoint, ApiResponse } from "@/types/openapi"

interface EndpointFormProps {
  endpoint: OpenAPIEndpoint
  baseUrl: string
}

export function EndpointForm({ endpoint, baseUrl }: EndpointFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFormChange = (data: any) => {
    setFormData(data)
  }

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setResponse(null)

    try {
      const url = `${baseUrl}${endpoint.path}`
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }

      // Add body for methods that support it
      if (["POST", "PUT", "PATCH"].includes(endpoint.method) && data) {
        options.body = JSON.stringify(data)
      }

      // Add query parameters for GET requests
      if (endpoint.method === "GET" && data && Object.keys(data).length > 0) {
        const params = new URLSearchParams()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value))
          }
        })
        const queryString = params.toString()
        if (queryString) {
          const separator = url.includes("?") ? "&" : "?"
          options.method = "GET"
          // For GET requests, we need to modify the URL
          const finalUrl = `${url}${separator}${queryString}`
          const response = await fetch(finalUrl, options)
          await handleResponse(response)
          return
        }
      }

      const response = await fetch(url, options)
      await handleResponse(response)
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: { error: error instanceof Error ? error.message : "Unknown error occurred" },
        headers: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (response: Response) => {
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    let data: any
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : null
    } catch {
      data = await response.text()
    }

    setResponse({
      status: response.status,
      statusText: response.statusText,
      data,
      headers,
    })
  }

  const getMethodColor = (method: string): string => {
    const colors = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      PATCH: "bg-orange-500",
      DELETE: "bg-red-500",
    }
    return colors[method] || "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Badge className={`${getMethodColor(endpoint.method)} text-white`}>{endpoint.method}</Badge>
            <CardTitle className="font-mono text-lg">{endpoint.path}</CardTitle>
          </div>
          {endpoint.summary && <p className="text-muted-foreground">{endpoint.summary}</p>}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoint.schema && (
                <JsonSchemaForm
                  schema={endpoint.schema}
                  formData={formData}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                />
              )}

              <div className="flex gap-2">
                <Button onClick={() => handleSubmit(formData)} disabled={loading} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : `Send ${endpoint.method} Request`}
                </Button>
                <RequestOverrideModal currentValue={formData} onSave={setFormData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Payload</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(formData, null, 2)}
                readOnly
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponseViewer response={response} loading={loading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
