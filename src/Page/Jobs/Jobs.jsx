import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import { useNavigate } from 'react-router'
import { Briefcase, Rocket, ArrowRight, Building2, Users, MapPin, Clock, DollarSign } from 'lucide-react'

const Jobs = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            {/* Header Section */}
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                    Start Your Career Journey
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                    Two paths await you - traditional employment or freelance projects. Choose what suits you best.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Job Board Card */}
                <button
                    onClick={() => navigate('/jobs/board')}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-8">
                        {/* Icon Section */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="h-8 w-8 text-white" />
                            </div>
                            <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                    Job Board
                                </h2>
                                <p className="text-sm text-blue-600 font-medium">
                                    Job Portal
                                </p>
                            </div>
                            
                            <p className="text-gray-600 leading-relaxed">
                                Looking for a permanent job? Our job board has thousands of opportunities. 
                                Filter by company, location, and experience level, then apply to your dream job.
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Building2 className="h-4 w-4 text-blue-500" />
                                    <span>Company Jobs</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    <span>Location Based</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span>Direct Apply</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span>Full-time/Part-time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>

                {/* Freelance Marketplace Card */}
                <button
                    onClick={() => navigate('/jobs/freelance')}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-300 transform hover:-translate-y-1"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-8">
                        {/* Icon Section */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Rocket className="h-8 w-8 text-white" />
                            </div>
                            <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all duration-300" />
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                                    Freelance Marketplace
                                </h2>
                                <p className="text-sm text-emerald-600 font-medium">
                                    Project Hub
                                </p>
                            </div>
                            
                            <p className="text-gray-600 leading-relaxed">
                                Want to work as a freelancer? Our marketplace features various projects posted by clients. 
                                Browse projects, submit proposals, and work according to your skills. 
                                Fixed price or hourly rate - your choice.
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Rocket className="h-4 w-4 text-emerald-500" />
                                    <span>Project Based</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                    <span>Fixed/Hourly</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4 text-emerald-500" />
                                    <span>Proposal System</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4 text-emerald-500" />
                                    <span>Flexible Time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Additional Info */}
            <div className="mt-10 text-center">
                <p className="text-sm text-gray-500">
                    Which path will you choose? Make the right choice based on your goals
                </p>
            </div>
        </div>

        <DownNav />
    </div>
  )
}

export default Jobs