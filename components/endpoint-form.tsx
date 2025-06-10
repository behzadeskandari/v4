"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Code, Eye, FileText } from "lucide-react"
import { JsonSchemaForm } from "./json-schema-form"
import { ResponseViewer } from "./response-viewer"
import { RequestOverrideModal } from "./request-override-modal"
import { JsonTestingPanel } from "./json-testing-panel"
import type { OpenAPIEndpoint, ApiResponse } from "@/types/openapi"

interface EndpointFormProps {
  endpoint: OpenAPIEndpoint
  baseUrl: string
}

export function EndpointForm({ endpoint, baseUrl }: EndpointFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [jsonData, setJsonData] = useState<string>("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"form" | "json">("form")

  const hasRequestPayload = endpoint.schema !== null

  const hasFormFields = endpoint.schema?.properties && Object.keys(endpoint.schema.properties).length > 0

  const handleFormChange = (data: any) => {
    setFormData(data)
    // Sync JSON when form changes
    setJsonData(JSON.stringify(data, null, 2))
  }

  const handleJsonChange = (json: string) => {
    setJsonData(json)
    // Try to sync form when JSON changes
    try {
      const parsed = JSON.parse(json)
      setFormData(parsed)
    } catch {
      // Invalid JSON, keep form as is
    }
  }

  const handleSubmit = async (data?: any) => {
    const requestData = data || (activeTab === "json" ? (jsonData ? JSON.parse(jsonData) : {}) : formData)

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
      if (["POST", "PUT", "PATCH"].includes(endpoint.method) && requestData) {
        options.body = JSON.stringify(requestData)
      }

      // Add query parameters for GET requests
      if (endpoint.method === "GET" && requestData && Object.keys(requestData).length > 0) {
        const params = new URLSearchParams()
        Object.entries(requestData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value))
          }
        })
        const queryString = params.toString()
        if (queryString) {
          const separator = url.includes("?") ? "&" : "?"
          const finalUrl = `${url}${separator}${queryString}`
          const response = await fetch(finalUrl, { ...options, method: "GET" })
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
    return colors[method as keyof typeof colors] || "bg-gray-500"
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
          {endpoint.description && <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {hasRequestPayload ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Request Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "json")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Form {!hasFormFields && "(Empty)"}
                    </TabsTrigger>
                    <TabsTrigger value="json" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="form" className="space-y-4 mt-4">
                    <JsonSchemaForm
                      schema={endpoint.schema}
                      formData={formData}
                      onChange={handleFormChange}
                      onSubmit={handleSubmit}
                    />
                  </TabsContent>

                  <TabsContent value="json" className="space-y-4 mt-4">
                    <JsonTestingPanel
                      value={jsonData}
                      onChange={handleJsonChange}
                      schema={endpoint.schema}
                      onSubmit={() => handleSubmit()}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleSubmit()} disabled={loading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : `Send ${endpoint.method} Request`}
                  </Button>
                  <RequestOverrideModal
                    currentValue={activeTab === "json" ? (jsonData ? JSON.parse(jsonData || "{}") : {}) : formData}
                    onSave={(data) => {
                      setFormData(data)
                      setJsonData(JSON.stringify(data, null, 2))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">This endpoint doesn't require a request payload.</p>
                <Button onClick={() => handleSubmit({})} disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : `Send ${endpoint.method} Request`}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Current Request Payload</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={activeTab === "json" ? jsonData : JSON.stringify(formData, null, 2)}
                readOnly
                className="font-mono text-sm min-h-[200px]"
                placeholder="No request data"
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
