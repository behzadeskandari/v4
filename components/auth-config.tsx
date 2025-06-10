"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Key, User, X, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth, type AuthConfig } from "@/contexts/auth-context"

export function AuthConfig() {
  const { authConfig, setAuthConfig, clearAuth, isLoaded } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [tempConfig, setTempConfig] = useState<AuthConfig>(authConfig)

  // Don't render until auth context is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading authentication settings...
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleSave = () => {
    setAuthConfig(tempConfig)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempConfig(authConfig)
    setIsOpen(false)
  }

  const handleOpenDialog = () => {
    setTempConfig(authConfig)
    setIsOpen(true)
  }

  const getAuthStatusBadge = () => {
    switch (authConfig.type) {
      case "bearer":
        return (
          <Badge variant="default" className="bg-green-500">
            <Shield className="h-3 w-3 mr-1" />
            Bearer Token
          </Badge>
        )
      case "apikey":
        return (
          <Badge variant="default" className="bg-blue-500">
            <Key className="h-3 w-3 mr-1" />
            API Key
          </Badge>
        )
      case "basic":
        return (
          <Badge variant="default" className="bg-purple-500">
            <User className="h-3 w-3 mr-1" />
            Basic Auth
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <X className="h-3 w-3 mr-1" />
            No Auth
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
          <div className="flex items-center gap-2">
            {getAuthStatusBadge()}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Authentication Configuration</DialogTitle>
                </DialogHeader>

                <Tabs
                  value={tempConfig.type}
                  onValueChange={(value) => setTempConfig({ ...tempConfig, type: value as any })}
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="none">None</TabsTrigger>
                    <TabsTrigger value="bearer">Bearer</TabsTrigger>
                    <TabsTrigger value="apikey">API Key</TabsTrigger>
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                  </TabsList>

                  <TabsContent value="none" className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No authentication will be used for requests</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="bearer" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bearer-token">Bearer Token</Label>
                        <div className="relative">
                          <Input
                            id="bearer-token"
                            type={showToken ? "text" : "password"}
                            placeholder="Enter your JWT or Bearer token"
                            value={tempConfig.bearerToken || ""}
                            onChange={(e) =>
                              setTempConfig({
                                ...tempConfig,
                                bearerToken: e.target.value,
                              })
                            }
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowToken(!showToken)}
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The token will be sent as:{" "}
                          <code className="bg-muted px-1 rounded">
                            Authorization: Bearer {tempConfig.bearerToken ? "***" : "[token]"}
                          </code>
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="apikey" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="api-key-name">Key Name</Label>
                          <Input
                            id="api-key-name"
                            placeholder="X-API-Key"
                            value={tempConfig.apiKey?.key || ""}
                            onChange={(e) =>
                              setTempConfig({
                                ...tempConfig,
                                apiKey: {
                                  ...tempConfig.apiKey,
                                  key: e.target.value,
                                  value: tempConfig.apiKey?.value || "",
                                  location: tempConfig.apiKey?.location || "header",
                                },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="api-key-location">Location</Label>
                          <Select
                            value={tempConfig.apiKey?.location || "header"}
                            onValueChange={(value) =>
                              setTempConfig({
                                ...tempConfig,
                                apiKey: {
                                  ...tempConfig.apiKey,
                                  key: tempConfig.apiKey?.key || "",
                                  value: tempConfig.apiKey?.value || "",
                                  location: value as "header" | "query",
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="header">Header</SelectItem>
                              <SelectItem value="query">Query Parameter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api-key-value">API Key Value</Label>
                        <div className="relative">
                          <Input
                            id="api-key-value"
                            type={showToken ? "text" : "password"}
                            placeholder="Enter your API key"
                            value={tempConfig.apiKey?.value || ""}
                            onChange={(e) =>
                              setTempConfig({
                                ...tempConfig,
                                apiKey: {
                                  ...tempConfig.apiKey,
                                  key: tempConfig.apiKey?.key || "",
                                  value: e.target.value,
                                  location: tempConfig.apiKey?.location || "header",
                                },
                              })
                            }
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowToken(!showToken)}
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Will be sent as:{" "}
                          <code className="bg-muted px-1 rounded">
                            {tempConfig.apiKey?.location === "header"
                              ? `${tempConfig.apiKey?.key || "[key]"}: ***`
                              : `?${tempConfig.apiKey?.key || "[key]"}=***`}
                          </code>
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="basic-username">Username</Label>
                          <Input
                            id="basic-username"
                            placeholder="Enter username"
                            value={tempConfig.basicAuth?.username || ""}
                            onChange={(e) =>
                              setTempConfig({
                                ...tempConfig,
                                basicAuth: {
                                  ...tempConfig.basicAuth,
                                  username: e.target.value,
                                  password: tempConfig.basicAuth?.password || "",
                                },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="basic-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="basic-password"
                              type={showToken ? "text" : "password"}
                              placeholder="Enter password"
                              value={tempConfig.basicAuth?.password || ""}
                              onChange={(e) =>
                                setTempConfig({
                                  ...tempConfig,
                                  basicAuth: {
                                    ...tempConfig.basicAuth,
                                    username: tempConfig.basicAuth?.username || "",
                                    password: e.target.value,
                                  },
                                })
                              }
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowToken(!showToken)}
                            >
                              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Will be sent as:{" "}
                        <code className="bg-muted px-1 rounded">Authorization: Basic [base64-encoded-credentials]</code>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={clearAuth}>
                    Clear All
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Configuration</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      {authConfig.type !== "none" && (
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {authConfig.type === "bearer" && authConfig.bearerToken && (
              <p>Bearer token configured ({authConfig.bearerToken.substring(0, 10)}...)</p>
            )}
            {authConfig.type === "apikey" && authConfig.apiKey && (
              <p>
                API Key: {authConfig.apiKey.key} ({authConfig.apiKey.location})
              </p>
            )}
            {authConfig.type === "basic" && authConfig.basicAuth && <p>Basic Auth: {authConfig.basicAuth.username}</p>}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
