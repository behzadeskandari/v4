import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "JSON Editor Examples - OpenAPI Forms",
  description: "Interactive examples showcasing JSON editor capabilities",
}

export default function JsonEditorExampleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
