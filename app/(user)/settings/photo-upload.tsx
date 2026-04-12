"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { updateProfile, removePhoto } from "./profile"

interface PhotoUploadProps {
  currentImage: string | null | undefined
  originalDiscordImage?: string | null
}

export function PhotoUpload({ currentImage, originalDiscordImage }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [localImage, setLocalImage] = useState(currentImage) // add local state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    
    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }
    
    setIsUploading(true)
    
    try {
      // Convert file to base64 string
      const base64Image = await convertFileToBase64(file)
      
      // Use the existing server action to update the profile
      await updateProfile({ image: base64Image })
      
      toast.success("Profile photo updated!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update profile photo")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleRemovePhoto = async () => {
    if (!localImage) return

    setIsUploading(true)

    try {
      await updateProfile({ image: "https://cdn.discordapp.com/embed/avatars/5.png" })
      setLocalImage("https://cdn.discordapp.com/embed/avatars/5.png") // update local state
      toast.success("Profile photo removed!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to remove profile photo")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }
  
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
  
  return (
    <div className="flex gap-2">
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRemovePhoto}
    >
      Remove photo
    </Button>
      <Button 
        size="sm" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Change photo"}
      </Button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
        ref={fileInputRef}
      />
    </div>
  )
}
