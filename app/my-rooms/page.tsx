'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  contact_number: string
  description: string
  images: string[]
  created_at: string
}

export default function MyRoomsPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth')
      } else if (userRole !== 'owner') {
        router.push('/')
      } else {
        fetchMyRooms()
      }
    }
  }, [user, userRole, authLoading, router])

  const fetchMyRooms = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    const { error } = await supabase.from('rooms').delete().eq('id', roomId)

    if (error) {
      alert('Error deleting room: ' + error.message)
    } else {
      fetchMyRooms()
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setExistingImages(room.images || [])
    setNewImages([])
    setNewImagePreviews([])
    setShowEditForm(true)
  }

  const handleDeleteExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...files])
      const previews = files.map((file) => URL.createObjectURL(file))
      setNewImagePreviews((prev) => [...prev, ...previews])
    }
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadNewImages = async (roomId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i]
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

  const deleteImageFromStorage = async (imagePath: string) => {
    const { error } = await supabase.storage
      .from('room-images')
      .remove([imagePath])
    
    if (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRoom) return

    const formData = new FormData(e.currentTarget)
    
    // Upload new images
    let finalImages = [...existingImages]
    if (newImages.length > 0) {
      const uploadedUrls = await uploadNewImages(editingRoom.id)
      finalImages = [...finalImages, ...uploadedUrls]
    }

    // Delete removed images from storage
    const originalImages = editingRoom.images || []
    const removedImages = originalImages.filter(
      (img) => !existingImages.includes(img)
    )
    for (const imgPath of removedImages) {
      await deleteImageFromStorage(imgPath)
    }

    const updates: any = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      rent_price: parseInt(formData.get('rent_price') as string),
      property_type: formData.get('property_type') as string,
      tenant_preference: formData.get('tenant_preference') as string,
      contact_number: formData.get('contact_number') as string,
      images: finalImages,
    }

    // Only include description if the column exists
    const descriptionValue = formData.get('description') as string
    if (descriptionValue) {
      updates.description = descriptionValue
    }

    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', editingRoom.id)

    if (error) {
      alert('Error updating room: ' + error.message)
    } else {
      setShowEditForm(false)
      setEditingRoom(null)
      setExistingImages([])
      setNewImages([])
      setNewImagePreviews([])
      fetchMyRooms()
    }
  }

  if (authLoading || loading) {
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rooms</h1>
            <p className="text-gray-600"></p>
          </div>
          <Link
            href="/add-room"
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all font-semibold text-sm"
          >
            ➕ Add New Room
          </Link>
        </div>

        {showEditForm && editingRoom && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">Edit Room</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingRoom.title}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingRoom.location}
                    required
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rent Price (₹)
                  </label>
                  <input
                    type="number"
                    name="rent_price"
                    defaultValue={editingRoom.rent_price}
                    required
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    defaultValue={editingRoom.property_type}
                    required
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="1 Bed">1 Bed</option>
                    <option value="2 Bed">2 Bed</option>
                    <option value="3 Bed">3 Bed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Preference
                  </label>
                  <select
                    name="tenant_preference"
                    defaultValue={editingRoom.tenant_preference}
                    required
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                  >
                    <option value="Bachelor">Bachelor</option>
                    <option value="Family">Family</option>
                    <option value="Girls">Girls</option>
                    <option value="Working">Working</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  defaultValue={editingRoom.contact_number}
                  required
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingRoom.description || ''}
                  required
                  rows={4}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Images
                </label>
                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {existingImages.map((imagePath, index) => {
                      const imageUrl = supabase.storage
                        .from('room-images')
                        .getPublicUrl(imagePath).data.publicUrl
                      return (
                        <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                          <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="rounded-xl object-cover group-hover:scale-105 transition-transform"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-lg w-7 h-7 flex items-center justify-center hover:bg-red-600 text-lg leading-none shadow-soft transition-all"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No existing images</p>
                )}
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add New Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mb-4 text-sm bg-white hover:border-gray-300 transition-colors"
                />
                {newImagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                        <Image
                          src={preview}
                          alt={`New preview ${index + 1}`}
                          fill
                          className="rounded-xl object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-lg w-7 h-7 flex items-center justify-center hover:bg-red-600 text-lg leading-none shadow-soft transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all font-semibold text-sm"
                >
                  Update Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingRoom(null)
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-soft border border-gray-100">
            <p className="text-gray-600 text-xl mb-6 font-medium">
              You haven't added any rooms yet.
            </p>
            <Link
              href="/add-room"
              className="inline-block bg-black text-white px-8 py-4 rounded-2xl hover:scale-105 hover:shadow-soft-lg transition-all font-bold text-lg"
            >
              Add Your First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const imageUrl =
                room.images && room.images.length > 0
                  ? supabase.storage
                      .from('room-images')
                      .getPublicUrl(room.images[0]).data.publicUrl
                  : '/placeholder-room.jpg'

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100 hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                    <Image
                      src={imageUrl}
                      alt={room.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-black">{room.title}</h3>
                    <p className="text-gray-600 mb-2 font-medium">{room.location}</p>
                    <p className="text-3xl font-bold text-black mb-4">
                      ₹{room.rent_price.toLocaleString()}/month
                    </p>
                    <div className="flex gap-2 mb-6">
                      <span className="px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {room.property_type}
                      </span>
                      <span className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-semibold">
                        {room.tenant_preference}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl hover:bg-primary-700 transition-all font-semibold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 transition-all font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

