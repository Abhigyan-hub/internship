'use client'

import { FilterState } from '@/app/page'

interface SearchFiltersProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
}

export function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location - Highest Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Location *
          </label>
          <input
            type="text"
            placeholder="Enter location"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Min Price (₹)
          </label>
          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Max Price (₹)
          </label>
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => updateFilter('propertyType', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
          >
            <option value="">All Types</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="1 Bed">1 Bed</option>
            <option value="2 Bed">2 Bed</option>
            <option value="3 Bed">3 Bed</option>
          </select>
        </div>

        {/* Tenant Preference */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Tenant Preference
          </label>
          <select
            value={filters.tenantPreference}
            onChange={(e) => updateFilter('tenantPreference', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 hover:bg-white"
          >
            <option value="">All</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Family">Family</option>
            <option value="Girls">Girls</option>
            <option value="Working">Working</option>
          </select>
        </div>
      </div>
    </div>
  )
}

