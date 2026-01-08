'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/DashboardLayout'
import { RoomList } from '@/components/RoomList'
import { SearchFilters } from '@/components/SearchFilters'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { useState } from 'react'

export interface FilterState {
  location: string
  minPrice: string
  maxPrice: string
  propertyType: string
  tenantPreference: string
}

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    tenantPreference: '',
  })

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Rooms</h1>
          <p className="text-gray-600"></p>
        </div>

        <div id="search-filters" className="scroll-mt-20 space-y-6">
          <RoleSwitcher />
          <SearchFilters filters={filters} setFilters={setFilters} />
          <RoomList filters={filters} />
        </div>
      </div>
    </DashboardLayout>
  )
}

