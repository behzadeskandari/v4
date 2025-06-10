"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface JsonSchemaFormProps {
  schema: any
  formData: any
  onChange: (data: any) => void
  onSubmit: (data: any) => void
}

interface DynamicField {
  key: string
  value: any
  type: string
}

export function JsonSchemaForm({ schema, formData, onChange, onSubmit }: JsonSchemaFormProps) {
  const [localData, setLocalData] = useState<any>(formData || {})
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([])

  useEffect(() => {
    setLocalData(formData || {})

    // Initialize dynamic fields from existing form data
    if (formData && Object.keys(formData).length > 0) {
      const fields = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        type: typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string",
      }))
      setDynamicFields(fields)
    }
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

  const addDynamicField = () => {
    const newField: DynamicField = {
      key: `field_${dynamicFields.length + 1}`,
      value: "",
      type: "string",
    }
    setDynamicFields([...dynamicFields, newField])
  }

  const removeDynamicField = (index: number) => {
    const newFields = dynamicFields.filter((_, i) => i !== index)
    setDynamicFields(newFields)

    // Remove from form data
    const fieldToRemove = dynamicFields[index]
    const newData = { ...localData }
    delete newData[fieldToRemove.key]
    setLocalData(newData)
    onChange(newData)
  }

  const updateDynamicField = (index: number, updates: Partial<DynamicField>) => {
    const newFields = [...dynamicFields]
    const oldKey = newFields[index].key
    newFields[index] = { ...newFields[index], ...updates }
    setDynamicFields(newFields)

    // Update form data
    const newData = { ...localData }
    if (updates.key && updates.key !== oldKey) {
      // Key changed, remove old and add new
      delete newData[oldKey]
      newData[updates.key] = updates.value !== undefined ? updates.value : newFields[index].value
    } else if (updates.value !== undefined) {
      // Value changed
      newData[newFields[index].key] = updates.value
    }
    setLocalData(newData)
    onChange(newData)
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

  const renderDynamicField = (field: DynamicField, index: number) => {
    return (
      <Card key={index} className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Input
            placeholder="Field name"
            value={field.key}
            onChange={(e) => updateDynamicField(index, { key: e.target.value })}
            className="flex-1"
          />
          <Select value={field.type} onValueChange={(type) => updateDynamicField(index, { type })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" onClick={() => removeDynamicField(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {field.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(checked) => updateDynamicField(index, { value: checked })}
              />
              <Label>{field.key || "Boolean field"}</Label>
            </div>
          ) : (
            <Input
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "email"
                    ? "email"
                    : field.type === "date"
                      ? "date"
                      : "text"
              }
              placeholder={`Enter ${field.key || "value"}`}
              value={field.value || ""}
              onChange={(e) => {
                const value = field.type === "number" ? Number(e.target.value) : e.target.value
                updateDynamicField(index, { value })
              }}
            />
          )}
        </div>
      </Card>
    )
  }

  const hasSchemaFields = schema && schema.properties && Object.keys(schema.properties).length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Render schema-defined fields */}
      {hasSchemaFields && (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Schema Fields</h3>
          </div>
          {Object.entries(schema.properties).map(([key, property]: [string, any]) =>
            renderField(key, property, schema.required?.includes(key)),
          )}
        </div>
      )}

      {/* Dynamic fields section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-semibold text-sm text-muted-foreground">
            {hasSchemaFields ? "Additional Fields" : "Custom Fields"}
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addDynamicField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>

        {dynamicFields.length === 0 && !hasSchemaFields && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No fields defined yet</p>
            <p className="text-sm">Click "Add Field" to create custom form fields</p>
          </div>
        )}

        {dynamicFields.map((field, index) => renderDynamicField(field, index))}
      </div>

      {/* Submit button */}
      <div className="pt-4 border-t">
        <Button type="submit" className="w-full">
          Submit Form
        </Button>
      </div>
    </form>
  )
}
