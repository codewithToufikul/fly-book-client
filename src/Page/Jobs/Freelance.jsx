import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'

const Freelance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Flybook Freelance Marketplace</h1>
            <p className="text-sm md:text-base text-gray-600 mb-6">PeoplePerHour style — post projects and get bids.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <aside className="md:col-span-1 space-y-3 bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Filters</p>
                    <div className="space-y-2 text-sm">
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                            <option>Category / Skill</option>
                        </select>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                            <option>Budget</option>
                        </select>
                        <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                            <option>Fixed / Hourly</option>
                        </select>
                    </div>
                </aside>
                <main className="md:col-span-2">
                    <div className="bg-white border border-gray-100 rounded-lg p-6 text-gray-500 text-sm">
                        Project listings will appear here.
                    </div>
                </main>
            </div>
        </div>
        <DownNav />
    </div>
  )
}

export default Freelance


