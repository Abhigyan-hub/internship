'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  getAllUsers,
  deleteUser,
  getAllRooms,
  deleteRoom,
  getAllMessages,
  deleteMessage,
  deleteConversationMessages,
  getAdmins,
  addAdmin,
  removeAdmin,
  AdminUser,
} from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Tab = 'users' | 'rooms' | 'messages' | 'admins'

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  owner_id: string
  images: string[]
  created_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
}

export default function AdminPage() {
  const { user, isAdminUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [loading, setLoading] = useState(true)
  
  // Users state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  
  // Rooms state
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  
  // Admins state
  const [admins, setAdmins] = useState<string[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminsLoading, setAdminsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth')
      } else if (!isAdminUser) {
        router.push('/')
      }
    }
  }, [user, isAdminUser, authLoading, router])

  useEffect(() => {
    if (isAdminUser && !authLoading) {
      loadData()
    }
  }, [isAdminUser, authLoading, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'users':
          await loadUsers()
          break
        case 'rooms':
          await loadRooms()
          break
        case 'messages':
          await loadMessages()
          break
        case 'admins':
          await loadAdmins()
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Error loading users: ' + (error as Error).message)
    } finally {
      setUsersLoading(false)
    }
  }

  const loadRooms = async () => {
    setRoomsLoading(true)
    try {
      const data = await getAllRooms()
      setRooms(data as Room[])
    } catch (error) {
      console.error('Error loading rooms:', error)
      alert('Error loading rooms: ' + (error as Error).message)
    } finally {
      setRoomsLoading(false)
    }
  }

  const loadMessages = async () => {
    setMessagesLoading(true)
    try {
      const data = await getAllMessages()
      setMessages(data as Message[])
    } catch (error) {
      console.error('Error loading messages:', error)
      alert('Error loading messages: ' + (error as Error).message)
    } finally {
      setMessagesLoading(false)
    }
  }

  const loadAdmins = async () => {
    setAdminsLoading(true)
    try {
      const data = await getAdmins()
      setAdmins(data)
    } catch (error) {
      console.error('Error loading admins:', error)
      alert('Error loading admins: ' + (error as Error).message)
    } finally {
      setAdminsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will delete all their rooms, conversations, and messages.')) {
      return
    }
    
    try {
      await deleteUser(userId)
      alert('User deleted successfully')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user: ' + (error as Error).message)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? This will delete all related conversations and messages.')) {
      return
    }
    
    try {
      await deleteRoom(roomId)
      alert('Room deleted successfully')
      loadRooms()
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Error deleting room: ' + (error as Error).message)
    }
  }

  const handleDeleteMessage = async (messageId: string, conversationId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }
    
    try {
      await deleteMessage(messageId)
      alert('Message deleted successfully')
      loadMessages()
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message: ' + (error as Error).message)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this entire conversation? This will delete all messages in it.')) {
      return
    }
    
    try {
      await deleteConversationMessages(conversationId)
      alert('Conversation deleted successfully')
      loadMessages()
    } catch (error) {
      console.error('Error deleting conversation:', error)
      alert('Error deleting conversation: ' + (error as Error).message)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminEmail.trim()) {
      alert('Please enter an email address')
      return
    }
    
    setAdminsLoading(true)
    try {
      await addAdmin(newAdminEmail.trim())
      alert('Admin added successfully')
      setNewAdminEmail('')
      loadAdmins()
    } catch (error) {
      console.error('Error adding admin:', error)
      alert('Error adding admin: ' + (error as Error).message)
    } finally {
      setAdminsLoading(false)
    }
  }

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) {
      return
    }
    
    try {
      await removeAdmin(email)
      alert('Admin removed successfully')
      loadAdmins()
    } catch (error) {
      console.error('Error removing admin:', error)
      alert('Error removing admin: ' + (error as Error).message)
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAdminUser) {
    return null
  }

  const tabs = [
    { id: 'users' as Tab, label: 'Users', icon: '👥' },
    { id: 'rooms' as Tab, label: 'Rooms', icon: '🏠' },
    { id: 'messages' as Tab, label: 'Messages', icon: '💬' },
    { id: 'admins' as Tab, label: 'Admins', icon: '⚙️' },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, rooms, messages, and admins</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Users ({users.length})</h2>
                <button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {usersLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.role || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Rooms ({rooms.length})</h2>
                <button
                  onClick={loadRooms}
                  disabled={roomsLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {roomsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {roomsLoading ? (
                <div className="text-center py-8">Loading rooms...</div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No rooms found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => {
                    const imageUrl = room.images && room.images.length > 0
                      ? supabase.storage.from('room-images').getPublicUrl(room.images[0]).data.publicUrl
                      : null
                    
                    return (
                      <div key={room.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                        {imageUrl && (
                          <div className="relative h-48 w-full">
                            <Image
                              src={imageUrl}
                              alt={room.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">{room.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{room.location}</p>
                          <p className="text-lg font-bold mb-2">₹{room.rent_price.toLocaleString()}/month</p>
                          <div className="flex gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                              {room.property_type}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                              {room.tenant_preference}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                          >
                            Delete Room
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Messages ({messages.length})</h2>
                <button
                  onClick={loadMessages}
                  disabled={messagesLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {messagesLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {messagesLoading ? (
                <div className="text-center py-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No messages found</div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Message ID: {msg.id.substring(0, 8)}...</p>
                          <p className="text-gray-900 mb-2">{msg.message}</p>
                          <p className="text-xs text-gray-500">
                            Conversation: {msg.conversation_id.substring(0, 8)}... | 
                            Sent: {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleDeleteMessage(msg.id, msg.conversation_id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(msg.conversation_id)}
                            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-xs"
                          >
                            Delete Conv
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Admins ({admins.length})</h2>
                <button
                  onClick={loadAdmins}
                  disabled={adminsLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {adminsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {/* Add Admin Form */}
              <form onSubmit={handleAddAdmin} className="mb-6 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={adminsLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                    Add Admin
                  </button>
                </div>
              </form>
              
              {adminsLoading ? (
                <div className="text-center py-8">Loading admins...</div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No admins found</div>
              ) : (
                <div className="space-y-2">
                  {admins.map((email) => {
                    const isInitialAdmin = email.toLowerCase() === 'fakysinghyo@gmail.com'
                    return (
                      <div
                        key={email}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">👤</span>
                          <div>
                            <p className="font-medium text-gray-900">{email}</p>
                            {isInitialAdmin && (
                              <p className="text-xs text-gray-500">Initial Admin (cannot be removed)</p>
                            )}
                          </div>
                        </div>
                        {!isInitialAdmin && (
                          <button
                            onClick={() => handleRemoveAdmin(email)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
