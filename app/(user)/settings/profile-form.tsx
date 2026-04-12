'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "./profile"

interface ProfileFormProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState<'name' | 'email' | null>(null)
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  })

  const handleSubmit = async (field: 'name' | 'email') => {
    await updateProfile({
      [field]: formData[field]
    })
    setIsEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Username</Label>
                <div className="flex items-center gap-4">
          {isEditing === 'name' ? (
            <>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Button onClick={() => handleSubmit('name')}>Save</Button>
              <Button variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">{user.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email address</Label>
        <div className="flex items-center gap-4">
          {isEditing === 'email' ? (
            <>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Button onClick={() => handleSubmit('email')}>Save</Button>
              <Button variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">{user.email}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

