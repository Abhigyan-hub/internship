'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RoomCard } from './RoomCard'
import { RoomDetailModal } from './RoomDetailModal'
import { useAuth } from './AuthProvider'
import { getOrCreateConversation } from '@/lib/supabase-chat'
import { FilterState } from '@/app/page'
import Image from 'next/image'

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

interface RoomListProps {
  filters: FilterState
}

export function RoomList({ filters }: RoomListProps) {
  const { userRole, user } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [filters])

  const fetchRooms = async () => {
    setLoading(true)
    let query = supabase.from('rooms').select('*').order('created_at', { ascending: false })

    // Apply filters
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.minPrice) {
      query = query.gte('rent_price', parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      query = query.lte('rent_price', parseInt(filters.maxPrice))
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.tenantPreference) {
      query = query.eq('tenant_preference', filters.tenantPreference)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching rooms:', error)
    } else {
      setRooms(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No rooms found matching your criteria.</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    )
  }

  const handleRoomClick = (room: Room) => {
    // Open modal for finders or users without a role (default to finder behavior)
    // Only owners should not see the modal (they manage rooms in My Rooms)
    if (userRole !== 'owner') {
      setSelectedRoom(room)
      setIsModalOpen(true)
    }
  }

  const handleChatClick = async (room: Room) => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (userRole === 'owner') {
      // Owners can't chat with themselves
      return
    }

    // Create or get conversation and navigate to messages
    const conversation = await getOrCreateConversation(
      room.owner_id,
      user.id,
      room.id
    )

    if (conversation) {
      router.push('/messages')
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={() => handleRoomClick(room)}
            onChatClick={userRole === 'finder' || !userRole ? () => handleChatClick(room) : undefined}
          />
        ))}
      </div>
      <RoomDetailModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRoom(null)
        }}
      />
    </>
  )
}

