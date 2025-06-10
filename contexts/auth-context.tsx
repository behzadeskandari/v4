"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface AuthConfig {
  type: "none" | "bearer" | "apikey" | "basic"
  bearerToken?: string
  apiKey?: {
    key: string
    value: string
    location: "header" | "query"
  }
  basicAuth?: {
    username: string
    password: string
  }
}

interface AuthContextType {
  authConfig: AuthConfig
  setAuthConfig: (config: AuthConfig) => void
  getAuthHeaders: () => Record<string, string>
  getAuthQuery: () => Record<string, string>
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authConfig, setAuthConfigState] = useState<AuthConfig>({ type: "none" })

  // Load auth config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openapi-auth-config")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAuthConfigState(parsed)
      } catch {
        // Invalid saved config, ignore
      }
    }
  }, [])

  // Save auth config to localStorage when it changes
  const setAuthConfig = (config: AuthConfig) => {
    setAuthConfigState(config)
    localStorage.setItem("openapi-auth-config", JSON.stringify(config))
  }

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {}

    switch (authConfig.type) {
      case "bearer":
        if (authConfig.bearerToken) {
          headers.Authorization = `Bearer ${authConfig.bearerToken}`
        }
        break
      case "apikey":
        if (authConfig.apiKey && authConfig.apiKey.location === "header") {
          headers[authConfig.apiKey.key] = authConfig.apiKey.value
        }
        break
      case "basic":
        if (authConfig.basicAuth) {
          const credentials = btoa(`${authConfig.basicAuth.username}:${authConfig.basicAuth.password}`)
          headers.Authorization = `Basic ${credentials}`
        }
        break
    }

    return headers
  }

  const getAuthQuery = (): Record<string, string> => {
    const query: Record<string, string> = {}

    if (authConfig.type === "apikey" && authConfig.apiKey && authConfig.apiKey.location === "query") {
      query[authConfig.apiKey.key] = authConfig.apiKey.value
    }

    return query
  }

  const clearAuth = () => {
    setAuthConfig({ type: "none" })
  }

  return (
    <AuthContext.Provider
      value={{
        authConfig,
        setAuthConfig,
        getAuthHeaders,
        getAuthQuery,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
