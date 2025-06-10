"use client"

import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { ApiResponse } from "@/types/openapi"

interface ResponseViewerProps {
  response: ApiResponse | null
  loading: boolean
}

export function ResponseViewer({ response, loading }: ResponseViewerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Sending request...
      </div>
    )
  }

  if (!response) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No response yet. Send a request to see the results.</p>
      </div>
    )
  }

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return "bg-green-500"
    if (status >= 300 && status < 400) return "bg-yellow-500"
    if (status >= 400 && status < 500) return "bg-orange-500"
    if (status >= 500) return "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className={`${getStatusColor(response.status)} text-white`}>{response.status}</Badge>
        <span className="text-sm font-medium">{response.statusText}</span>
      </div>

      <Tabs defaultValue="body" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="body">Response Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="space-y-2">
          <Label>Response Data</Label>
          <Textarea
            value={typeof response.data === "string" ? response.data : JSON.stringify(response.data, null, 2)}
            readOnly
            className="font-mono text-sm min-h-[300px]"
          />
        </TabsContent>

        <TabsContent value="headers" className="space-y-2">
          <Label>Response Headers</Label>
          <Card>
            <CardContent className="pt-4">
              {Object.keys(response.headers).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b last:border-b-0">
                      <span className="font-medium text-sm">{key}:</span>
                      <span className="text-sm text-muted-foreground font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No headers available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
