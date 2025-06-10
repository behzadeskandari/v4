export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface OpenAPIEndpoint {
  id: string
  path: string
  method: HttpMethod
  summary?: string
  description?: string
  schema?: any
}

export interface ApiResponse {
  status: number
  statusText: string
  data: any
  headers: Record<string, string>
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers?: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, any>
  components?: {
    schemas?: Record<string, any>
    securitySchemes?: Record<string, any>
  }
}
