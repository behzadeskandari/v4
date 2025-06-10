import type { OpenAPIEndpoint, HttpMethod } from "@/types/openapi"

export class OpenAPIClient {
  private spec: any = null

  constructor(private openapiUrl: string) {}

  async getEndpoints(): Promise<OpenAPIEndpoint[]> {
    if (!this.spec) {
      await this.loadSpec()
    }

    const endpoints: OpenAPIEndpoint[] = []
    const paths = this.spec.paths || {}

    for (const [path, pathItem] of Object.entries(paths)) {
      const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

      for (const method of methods) {
        const operation = (pathItem as any)[method.toLowerCase()]
        if (operation) {
          const endpoint: OpenAPIEndpoint = {
            id: `${method}-${path}`,
            path,
            method,
            summary: operation.summary,
            description: operation.description,
            schema: this.extractSchema(operation, method),
          }
          endpoints.push(endpoint)
        }
      }
    }

    return endpoints
  }

  private async loadSpec(): Promise<void> {
    try {
      const response = await fetch(this.openapiUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      this.spec = await response.json()
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private extractSchema(operation: any, method: HttpMethod): any {
    // For request body (POST, PUT, PATCH)
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const requestBody = operation.requestBody
      if (requestBody?.content?.["application/json"]?.schema) {
        return requestBody.content["application/json"].schema
      }
    }

    // For query parameters (GET, DELETE)
    if (["GET", "DELETE"].includes(method)) {
      const parameters = operation.parameters || []
      if (parameters.length > 0) {
        const properties: any = {}
        const required: string[] = []

        parameters.forEach((param: any) => {
          if (param.in === "query") {
            properties[param.name] = {
              type: param.schema?.type || "string",
              description: param.description,
              ...param.schema,
            }
            if (param.required) {
              required.push(param.name)
            }
          }
        })

        if (Object.keys(properties).length > 0) {
          return {
            type: "object",
            properties,
            required: required.length > 0 ? required : undefined,
          }
        }
      }
    }

    // Default empty schema
    return {
      type: "object",
      properties: {},
      title: `${method} ${operation.summary || "Request"}`,
    }
  }
}
