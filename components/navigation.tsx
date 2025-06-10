"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Zap } from "lucide-react"
import JsonEditorExamplePage from "@/app/json-editor-example/page"
import { AuthProvider } from "@/contexts/auth-context";
export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "OpenAPI Forms",
      icon: Home,
      description: "Main application",
    },
    {
    href: "/json-editor-example",
    label: "Dynamic JSON Editor",
    icon: Zap,
    description: "Real API testing",
    component: JsonEditorExamplePage, // add this line
    },
  ]

    return (
    <Card className="mb-6">
        <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
                <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "outline"} size="sm" className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                </Button>
             
                </Link>
            )
            })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
            Navigate between the main application and the JSON editor example.
        </p>
        </CardContent>
    </Card>
    )
}