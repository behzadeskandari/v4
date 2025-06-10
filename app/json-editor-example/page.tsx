"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JsonTestingPanel } from "@/components/json-testing-panel"
import { ResponseViewer } from "@/components/response-viewer"
import { Code, Play, RotateCcw } from "lucide-react"
import SwaggerClient from "swagger-client"
import  { ApiResponse } from "@/types/openapi"

/**
 * @typedef {Object} DynamicScenario
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {any} schema
 * @property {string} initialJson
 * @property {string} method
 * @property {string} endpoint
 * @property {any[]} parameters
 */

export default function JsonEditorExamplePage() {
  const [openapiURL, setOpenapiURL] = useState<string>("http://localhost:5029/swagger/v1/swagger.json")
  const [scenarios, setScenarios] = useState<DynamicScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [jsonData, setJsonData] = useState<string>("")
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // Fetch OpenAPI schema and populate scenarios
  useEffect(() => {
    async function fetchSchemas() {
      try {
        setError(null)
        const client = await new SwaggerClient(openapiURL)
        const paths = client.spec.paths
        const newScenarios: DynamicScenario[] = []
        const methods = ["get", "post", "put", "patch", "delete"]

        for (const [url, path] of Object.entries(paths)) {
          for (const method of methods) {
            const operation = path?.[method]
            if (operation) {
              const schema = operation.requestBody?.content?.["application/json"]?.schema || {
                type: "object",
                title: `${method.toUpperCase()} ${url}`,
                properties: {},
              }
              const initialJson = JSON.stringify({}, null, 2) // Default empty JSON
              newScenarios.push({
                id: `${method}|${url}`,
                title: operation.summary || `${method.toUpperCase()} ${url}`,
                description: operation.description || `Perform a ${method.toUpperCase()} request to ${url}`,
                method: method.toUpperCase(),
                endpoint: url,
                schema,
                initialJson,
                parameters: operation.parameters || [],
              })
            }
          }
        }

        setScenarios(newScenarios)
        if (newScenarios.length > 0) {
          setSelectedScenario(newScenarios[0].id)
          setJsonData(newScenarios[0].initialJson)
        } else {
          setError("No endpoints found in the OpenAPI specification.")
        }
      } catch (err) {
        console.error("Error fetching OpenAPI schema:", err)
        setError("Failed to load OpenAPI schema. Please check the URL.")
        setScenarios([])
      }
    }

    fetchSchemas()
  }, [openapiURL])

  const currentScenario = scenarios.find((s) => s.id === selectedScenario) || {
    id: "",
    title: "No Endpoint Selected",
    description: "Please select an endpoint or enter a valid OpenAPI URL",
    method: "POST",
    endpoint: "",
    schema: { type: "object", properties: {} },
    initialJson: "{}",
    parameters: [],
  }

  const handleScenarioChange = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId)
    if (scenario) {
      setSelectedScenario(scenarioId)
      setJsonData(scenario.initialJson)
      setResponse(null)
      setParameters({})
    }
  }

  const handleReset = () => {
    setJsonData(currentScenario.initialJson)
    setResponse(null)
    setParameters({})
  }

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters((prev) => ({ ...prev, [paramName]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResponse(null)

    try {
      let url = currentScenario.endpoint
      // Replace path parameters
      currentScenario.parameters.forEach((param) => {
        if (param.in === "path" && parameters[param.name]) {
          url = url.replace(`{${param.name}}`, encodeURIComponent(parameters[param.name]))
        }
      })

      // Add query parameters for GET
      let queryString = ""
      if (currentScenario.method.toLowerCase() === "get") {
        const queryParams = currentScenario.parameters
          .filter((param) => param.in === "query" && parameters[param.name])
          .map((param) => `${param.name}=${encodeURIComponent(parameters[param.name])}`)
          .join("&")
        if (queryParams) {
          queryString = `?${queryParams}`
        }
      }

      const fetchOptions: RequestInit = {
        method: currentScenario.method,
        headers: {
          "Accept": "application/json, text/plain",
          "Content-Type": "application/json",
        },
        mode: "cors",
      }

      if (["POST", "PUT", "PATCH"].includes(currentScenario.method)) {
        fetchOptions.body = jsonData
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      url = `${baseUrl}${currentScenario.endpoint}`
      const response = await fetch(`${url}${queryString}`, fetchOptions)
      const data = await response.text().then((text) => (text ? JSON.parse(text) : {}))
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (error: any) {
      setResponse({
        status: 500,
        statusText: "Internal Server Error",
        data: { error: error.message || "Something went wrong" },
        headers: {},
      })
    } finally {
      setLoading(false)
    }
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Dynamic JSON Editor</h1>
        <p className="text-muted-foreground">
          Interactive JSON editor for testing API endpoints defined in an OpenAPI specification
        </p>
      </div>

      {/* OpenAPI URL Input */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAPI Specification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={openapiURL}
              onChange={(e) => setOpenapiURL(e.target.value)}
              placeholder="Enter OpenAPI URL (e.g., http://localhost:5029/swagger/v1/swagger.json)"
              className="w-full"
            />
            <Button onClick={() => setOpenapiURL(openapiURL)} variant="outline">
              Refresh
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Endpoint Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose an Endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          {scenarios.length > 0 ? (
            <Select value={selectedScenario} onValueChange={handleScenarioChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an endpoint" />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getMethodColor(scenario.method)} text-white`}>
                        {scenario.method}
                      </Badge>
                      {scenario.endpoint}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-muted-foreground">No endpoints available. Please enter a valid OpenAPI URL.</p>
          )}
        </CardContent>
      </Card>

      {/* Current Endpoint Details and Parameters */}
      {currentScenario.id && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${getMethodColor(currentScenario.method)} text-white`}>
                  {currentScenario.method}
                </Badge>
                <CardTitle className="font-mono text-lg">{currentScenario.endpoint}</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{currentScenario.title}</h2>
              <p className="text-muted-foreground">{currentScenario.description}</p>
            </div>
          </CardHeader>
          {currentScenario.parameters.length > 0 && (
            <CardContent>
              <h3 className="font-semibold mb-2">Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScenario.parameters.map((param) => (
                  <div key={param.name} className="space-y-1">
                    <label htmlFor={`param-${param.name}`} className="text-sm font-medium">
                      {param.name} ({param.in})
                      {param.required && <span className="text-red-500">*</span>}
                    </label>
                    <Input
                      id={`param-${param.name}`}
                      value={parameters[param.name] || ""}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      placeholder={`Enter ${param.name}`}
                    />
                    {param.description && (
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* JSON Editor and Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              JSON Request Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {["POST", "PUT", "PATCH"].includes(currentScenario.method) ? (
              <JsonTestingPanel
                value={jsonData || currentScenario.initialJson}
                onChange={setJsonData}
                schema={currentScenario.schema}
                onSubmit={handleSubmit}
              />
            ) : (
              <p className="text-muted-foreground">
                {currentScenario.method} requests do not require a JSON body.
              </p>
            )}
            <div className="mt-4">
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                {loading ? "Sending Request..." : `Send ${currentScenario.method} Request`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseViewer response={response} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Editor Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">🎯 Dynamic Endpoints</h3>
              <p className="text-xs text-muted-foreground">
                Automatically loads endpoints from OpenAPI specifications
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">✅ Real-time Validation</h3>
              <p className="text-xs text-muted-foreground">
                Live JSON syntax validation with detailed error messages
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">⚡ Parameter Support</h3>
              <p className="text-xs text-muted-foreground">
                Supports path and query parameters for dynamic API testing
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">🎨 Syntax Highlighting</h3>
              <p className="text-xs text-muted-foreground">
                Monospace font with proper indentation for better readability
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">🔄 Form Sync</h3>
              <p className="text-xs text-muted-foreground">
                Seamless synchronization between form inputs and JSON editor
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">📱 Responsive Design</h3>
              <p className="text-xs text-muted-foreground">
                Works perfectly on desktop, tablet, and mobile devices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}