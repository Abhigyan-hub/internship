'use client'

import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

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

interface RoomCardProps {
  room: Room
  onClick?: () => void
  onChatClick?: () => void
}

export function RoomCard({ room, onClick, onChatClick }: RoomCardProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (room.images && room.images.length > 0) {
      const urls = room.images.map((imagePath) => {
        const { data } = supabase.storage
          .from('room-images')
          .getPublicUrl(imagePath)
        return data?.publicUrl || ''
      }).filter(Boolean)
      setImageUrls(urls)
    }
  }, [room.images])

  // Auto-play slideshow for multiple images
  useEffect(() => {
    if (imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
      }, 4000) // Change image every 4 seconds
      return () => clearInterval(interval)
    }
  }, [imageUrls.length])

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Sb29tIEltYWdlPC90ZXh0Pjwvc3ZnPg=='

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
    }
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length)
    }
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const currentImage = imageUrls.length > 0 ? imageUrls[currentImageIndex] : null

  return (
    <div
      className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border border-gray-100"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`View details for ${room.title}`}
    >
      <div className="relative h-48 w-full bg-gray-100 group overflow-hidden rounded-t-2xl">
        {currentImage && !imageError ? (
          <>
            <Image
              src={currentImage}
              alt={room.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            {imageUrls.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-1.5 sm:p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 active:bg-black/80 text-white rounded-full p-1.5 sm:p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
                  aria-label="Next image"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {/* Image Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        goToImage(index)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`h-1.5 sm:h-2 rounded-full transition-all touch-manipulation ${
                        index === currentImageIndex
                          ? 'w-6 bg-white'
                          : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/75 active:bg-white'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Image Counter */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                  {currentImageIndex + 1} / {imageUrls.length}
                </div>
              </>
            )}
          </>
        ) : (
          <Image
            src={placeholderImage}
            alt="Room placeholder"
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {room.title}
        </h3>
        <div className="flex items-center text-gray-600 mb-3 text-sm">
          <svg
            className="w-4 h-4 mr-1.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{room.location}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900">
            ₹{room.rent_price.toLocaleString()}
            <span className="text-sm font-normal text-gray-500">/month</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
            {room.property_type}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {room.tenant_preference}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Contact</p>
            <a
              href={`tel:${room.contact_number}`}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {room.contact_number}
            </a>
          </div>
          {onChatClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChatClick()
              }}
              className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-xs font-medium"
            >
              💬 Chat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

