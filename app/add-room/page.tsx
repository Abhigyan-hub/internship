'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AddRoomPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    rent_price: '',
    property_type: '',
    tenant_preference: '',
    contact_number: '',
    description: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth')
      } else if (userRole !== 'owner') {
        router.push('/')
      }
    }
  }, [user, userRole, authLoading, router])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImages(files)
      const previews = files.map((file) => URL.createObjectURL(file))
      setImagePreviews(previews)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const uploadImages = async (roomId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${roomId}/${Date.now()}-${i}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, file)
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        continue
      }
      
      uploadedUrls.push(fileName)
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setMessage('')

    try {
      // First, create the room record
      const roomDataToInsert: any = {
        title: formData.title,
        location: formData.location,
        rent_price: parseInt(formData.rent_price),
        property_type: formData.property_type,
        tenant_preference: formData.tenant_preference,
        contact_number: formData.contact_number,
        owner_id: user.id,
        images: [],
      }

      // Only include description if the column exists
      if (formData.description) {
        roomDataToInsert.description = formData.description
      }

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert(roomDataToInsert)
        .select()
        .single()

      if (roomError) throw roomError

      // Upload images if any
      if (images.length > 0 && roomData) {
        const uploadedUrls = await uploadImages(roomData.id)
        
        // Update room with image URLs
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ images: uploadedUrls })
          .eq('id', roomData.id)

        if (updateError) throw updateError
      }

      setMessage('Room added successfully! Redirecting to home page...')
      // Reset form
      setFormData({
        title: '',
        location: '',
        rent_price: '',
        property_type: '',
        tenant_preference: '',
        contact_number: '',
        description: '',
      })
      setImages([])
      setImagePreviews([])
      
      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (error: any) {
      setMessage(error.message || 'Error adding room')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || userRole !== 'owner') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Room</h1>
          <p className="text-gray-600">Create a new room listing</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="e.g., Spacious 2 BHK in Downtown"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="e.g., Mumbai, Andheri West"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent Price (₹) *
              </label>
              <input
                type="number"
                name="rent_price"
                value={formData.rent_price}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
              >
                <option value="">Select property type</option>
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="1 Bed">1 Bed</option>
                <option value="2 Bed">2 Bed</option>
                <option value="3 Bed">3 Bed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Preference *
              </label>
              <select
                name="tenant_preference"
                value={formData.tenant_preference}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
              >
                <option value="">Select tenant preference</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Family">Family</option>
                <option value="Girls">Girls</option>
                <option value="Working">Working</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
                placeholder="Describe your room, amenities, nearby facilities, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Images (Multiple)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white hover:border-gray-300 text-sm"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-2xl overflow-hidden group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="rounded-2xl object-cover group-hover:scale-105 transition-transform"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-xl w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all text-lg leading-none shadow-soft"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.includes('success')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 font-semibold"
            >
              {submitting ? 'Adding Room...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

