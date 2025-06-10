"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface JsonSchemaFormProps {
  schema: any
  formData: any
  onChange: (data: any) => void
  onSubmit: (data: any) => void
}

export function JsonSchemaForm({ schema, formData, onChange, onSubmit }: JsonSchemaFormProps) {
  const [localData, setLocalData] = useState<any>(formData || {})

  useEffect(() => {
    setLocalData(formData || {})
  }, [formData])

  const handleChange = (key: string, value: any) => {
    const newData = { ...localData, [key]: value }
    setLocalData(newData)
    onChange(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(localData)
  }

  const renderField = (key: string, property: any, required = false) => {
    const value = localData[key] || ""
    const fieldId = `field-${key}`

    const commonProps = {
      id: fieldId,
      required,
      value: value || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(key, e.target.value),
    }

    switch (property.type) {
      case "string":
        if (property.enum) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId}>
                {property.title || key}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select value={value} onValueChange={(val) => handleChange(key, val)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${key}`} />
                </SelectTrigger>
                <SelectContent>
                  {property.enum.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
            </div>
          )
        }

        if (property.format === "textarea" || (property.maxLength && property.maxLength > 100)) {
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={fieldId}>
                {property.title || key}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea
                {...commonProps}
                placeholder={property.description || `Enter ${key}`}
                className="min-h-[100px]"
              />
              {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
            </div>
          )
        }

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {property.title || key}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={property.format === "email" ? "email" : property.format === "password" ? "password" : "text"}
              placeholder={property.description || `Enter ${key}`}
            />
            {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
          </div>
        )

      case "number":
      case "integer":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {property.title || key}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              min={property.minimum}
              max={property.maximum}
              step={property.type === "integer" ? 1 : "any"}
              placeholder={property.description || `Enter ${key}`}
              onChange={(e) => {
                const val = e.target.value
                handleChange(
                  key,
                  val === "" ? undefined : property.type === "integer" ? Number.parseInt(val) : Number.parseFloat(val),
                )
              }}
            />
            {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
          </div>
        )

      case "boolean":
        return (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox id={fieldId} checked={!!value} onCheckedChange={(checked) => handleChange(key, checked)} />
            <Label htmlFor={fieldId}>
              {property.title || key}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {property.description && <p className="text-sm text-muted-foreground ml-2">{property.description}</p>}
          </div>
        )

      case "object":
        return (
          <Card key={key}>
            <CardContent className="pt-6">
              <Label className="text-base font-semibold">
                {property.title || key}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {property.description && <p className="text-sm text-muted-foreground mb-4">{property.description}</p>}
              <div className="space-y-4 ml-4">
                {property.properties &&
                  Object.entries(property.properties).map(([subKey, subProperty]: [string, any]) =>
                    renderField(`${key}.${subKey}`, subProperty, property.required?.includes(subKey)),
                  )}
              </div>
            </CardContent>
          </Card>
        )

      case "array":
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {property.title || key}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              placeholder={`Enter ${key} as JSON array (e.g., ["item1", "item2"])`}
              className="min-h-[80px]"
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleChange(key, Array.isArray(parsed) ? parsed : [])
                } catch {
                  // Keep the raw value for now
                  handleChange(key, e.target.value)
                }
              }}
            />
            {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
          </div>
        )

      default:
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={fieldId}>
              {property.title || key}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input {...commonProps} placeholder={property.description || `Enter ${key}`} />
            {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}
          </div>
        )
    }
  }

  if (!schema || !schema.properties) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No form schema available for this endpoint</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(schema.properties).map(([key, property]: [string, any]) =>
        renderField(key, property, schema.required?.includes(key)),
      )}
    </form>
  )
}
