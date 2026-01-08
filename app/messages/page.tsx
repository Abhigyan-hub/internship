'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  subscribeToMessages,
  markConversationAsRead,
  ConversationWithUnread,
  Message,
} from '@/lib/supabase-chat'
import Image from 'next/image'

export default function MessagesPage() {
  const { user, userRole } = useAuth()
  const [conversations, setConversations] = useState<ConversationWithUnread[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUnread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation.id)
      // Mark conversation as read when opened
      markConversationAsRead(selectedConversation.id, user.id).then(() => {
        // Update unread count in conversations list after marking as read
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        )
      })
      // Switch to chat view on mobile
      setMobileView('chat')
      
      const unsubscribe = subscribeToMessages(selectedConversation.id, (newMessage) => {
        setMessages((prev) => [...prev, newMessage])
        scrollToBottom()
        // If message is from other user, mark as read if conversation is open
        if (newMessage.sender_id !== user.id && selectedConversation?.id === newMessage.conversation_id) {
          markConversationAsRead(selectedConversation.id, user.id)
        }
      })
      return unsubscribe
    }
  }, [selectedConversation, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    if (!user) return
    setLoading(true)
    const convos = await getUserConversations(user.id)
    setConversations(convos)
    setLoading(false)
  }

  // Refresh conversations periodically to update unread counts
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      loadConversations()
    }, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [user])

  const loadMessages = async (conversationId: string) => {
    const msgs = await getConversationMessages(conversationId)
    setMessages(msgs)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation || !user) return

    await sendMessage(selectedConversation.id, user.id, messageText.trim())
    setMessageText('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getOtherUser = (conversation: ConversationWithUnread) => {
    if (!user) return { id: '', email: '' }
    const otherUserId = user.id === conversation.owner_id 
      ? conversation.finder_id 
      : conversation.owner_id
    return { id: otherUserId, email: '' }
  }

  const handleBackToList = () => {
    setMobileView('list')
    setSelectedConversation(null)
  }

  const getRoomImage = (conversation: Conversation) => {
    if (conversation.room?.images && conversation.room.images.length > 0) {
      const { data } = supabase.storage
        .from('room-images')
        .getPublicUrl(conversation.room.images[0])
      return data?.publicUrl
    }
    return null
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Please sign in to view messages</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with room owners and finders</p>
        </div>

        {/* Mobile Header */}
        <div className="mb-4 md:hidden">
          {mobileView === 'chat' && selectedConversation ? (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleBackToList}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to conversations"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getRoomImage(selectedConversation) && (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={getRoomImage(selectedConversation)!}
                      alt={selectedConversation.room?.title || 'Room'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 text-sm truncate">
                    {selectedConversation.room?.title}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {getOtherUser(selectedConversation)?.email || 'User'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
              <p className="text-gray-600 text-sm">Chat with room owners and finders</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)] flex flex-col md:flex-row">
          {/* Conversations List */}
          <div
            className={`${
              mobileView === 'list' ? 'flex' : 'hidden'
            } md:flex w-full md:w-80 border-r border-gray-200 flex-col`}
          >
            <div className="p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherUser = getOtherUser(conv)
                  const imageUrl = getRoomImage(conv)
                  const isSelected = selectedConversation?.id === conv.id
                  const unreadCount = conv.unread_count || 0

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv)
                        setMobileView('chat')
                      }}
                      className={`w-full p-3 md:p-4 text-left border-b border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation ${
                        isSelected ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {imageUrl ? (
                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={conv.room?.title || 'Room'}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-lg">
                              🏠
                            </div>
                          )}
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className={`font-medium text-gray-900 text-sm md:text-base truncate ${
                              unreadCount > 0 ? 'font-semibold' : ''
                            }`}>
                              {conv.room?.title || 'Room'}
                            </p>
                            {conv.last_message && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">
                            {otherUser?.email || 'User'}
                          </p>
                          {conv.last_message && (
                            <p className={`text-xs truncate ${
                              unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'
                            }`}>
                              {conv.last_message.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {conv.room?.location}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`${
            mobileView === 'chat' ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col`}>
            {selectedConversation ? (
              <>
                {/* Desktop Chat Header */}
                <div className="hidden md:flex p-4 border-b border-gray-200 bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {getRoomImage(selectedConversation) && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                        <Image
                          src={getRoomImage(selectedConversation)!}
                          alt={selectedConversation.room?.title || 'Room'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.room?.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getOtherUser(selectedConversation)?.email || 'User'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 space-y-3 md:space-y-4">
                  {messages.map((msg) => {
                    const isSender = msg.sender_id === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 md:py-2.5 ${
                            isSender
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm md:text-base break-words">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSender ? 'text-primary-100' : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 md:px-4 py-2.5 md:py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm md:text-base"
                    />
                    <button
                      type="submit"
                      className="px-5 md:px-6 py-2.5 md:py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors font-medium text-sm md:text-base touch-manipulation"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center p-4">
                  <p className="text-lg mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

