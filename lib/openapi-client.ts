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
    // Always return a schema object, never null
    const baseSchema = {
      type: "object",
      properties: {},
      title: `${method} Request`,
      description: `Request configuration for ${method} operation`,
    }

    // For request body (POST, PUT, PATCH)
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const requestBody = operation.requestBody
      if (requestBody?.content?.["application/json"]?.schema) {
        return {
          ...requestBody.content["application/json"].schema,
          title: `${method} Request Body`,
          description: requestBody.description || `Request body for ${method} ${operation.summary || "operation"}`,
        }
      }
      return {
        ...baseSchema,
        title: `${method} Request Body`,
        description: `Request body for ${method} operation`,
      }
    }

    // For query parameters and path parameters (GET, DELETE, and others)
    const parameters = operation.parameters || []
    if (parameters.length > 0) {
      const properties: any = {}
      const required: string[] = []

      parameters.forEach((param: any) => {
        if (param.in === "query" || param.in === "path") {
          properties[param.name] = {
            type: param.schema?.type || "string",
            description: param.description,
            title: param.name,
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
          title: `${method} Parameters`,
          description: `Parameters for ${method} ${operation.summary || "operation"}`,
        }
      }
    }

    // For GET requests, add common query parameters
    if (method === "GET") {
      return {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            title: "Limit",
            description: "Number of items to return",
            minimum: 1,
            maximum: 1000,
          },
          offset: {
            type: "integer",
            title: "Offset",
            description: "Number of items to skip",
            minimum: 0,
          },
          search: {
            type: "string",
            title: "Search",
            description: "Search query",
          },
        },
        title: `${method} Query Parameters`,
        description: `Query parameters for ${method} requests`,
      }
    }

    // Return base schema for all other cases
    return baseSchema
  }
}
