'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  contact_number: string
  description?: string
  images: string[]
  created_at: string
}

interface RoomDetailModalProps {
  room: Room | null
  isOpen: boolean
  onClose: () => void
}

export function RoomDetailModal({ room, isOpen, onClose }: RoomDetailModalProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (room?.images && room.images.length > 0) {
      const urls = room.images.map((imagePath) => {
        const { data } = supabase.storage
          .from('room-images')
          .getPublicUrl(imagePath)
        return data?.publicUrl || ''
      }).filter(Boolean)
      setImageUrls(urls)
    } else {
      setImageUrls([])
    }
    setCurrentImageIndex(0)
  }, [room])

  useEffect(() => {
    if (imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [imageUrls.length])

  if (!isOpen || !room) return null

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Sb29tIEltYWdlPC90ZXh0Pjwvc3ZnPg=='

  const nextImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
    }
  }

  const prevImage = () => {
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const currentImage = imageUrls.length > 0 ? imageUrls[currentImageIndex] : placeholderImage

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-lg animate-scaleIn border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl backdrop-blur-sm bg-white/95">
          <h2 className="text-2xl font-bold text-gray-900">{room.title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-2xl transition-all text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-8">
          {/* Image Gallery */}
          <div className="relative h-64 sm:h-96 w-full mb-6 rounded-2xl overflow-hidden bg-gray-100 group">
            <Image
              src={currentImage}
              alt={room.title}
              fill
              className="object-cover"
            />
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              </>
            )}
          </div>

          {/* Room Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center text-gray-600 mb-4">
                <svg className="w-6 h-6 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xl font-bold">{room.location}</span>
              </div>
              <div className="text-4xl font-bold text-black mb-6">
                ₹{room.rent_price.toLocaleString()}
                <span className="text-xl font-normal text-gray-500">/month</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-5 py-2.5 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                {room.property_type}
              </span>
              <span className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-bold">
                {room.tenant_preference}
              </span>
            </div>

            {room.description && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{room.description}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={`tel:${room.contact_number}`}
                  className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  📞 {room.contact_number}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

