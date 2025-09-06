import React from 'react'
import { BookOpen, Target, Users, Brain, Globe, Star, Lightbulb, Heart } from 'lucide-react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'

const AboutUs = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Inspiring Articles & Books",
      description: "Content focused on confidence, leadership, and personal growth to unlock your potential"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Bilingual Content",
      description: "Resources in both Bangla & English to connect with diverse youth across Bangladesh"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Self-Development Resources",
      description: "Tools and materials for critical thinking, motivation, and continuous learning"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Building",
      description: "Connect with like-minded learners and change-makers in our growing community"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar/>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlyBook</span> Bangladesh
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                A purpose-driven digital platform created to empower today's youth through 
                <span className="font-semibold text-blue-600"> education</span>, 
                <span className="font-semibold text-purple-600"> inspiration</span>, and 
                <span className="font-semibold text-indigo-600"> self-discovery</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Our <span className="text-yellow-500">Vision</span>
            </h2>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 md:p-12 shadow-xl border border-yellow-200">
              <div className="flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-500 mr-3" />
                <Star className="w-10 h-10 text-yellow-500 mx-1" />
                <Star className="w-8 h-8 text-yellow-500 ml-3" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 italic">
                "If you cannot find the light, be the light yourself."
              </blockquote>
              <p className="text-lg text-gray-700 leading-relaxed">
                In an age where young people often struggle with self-doubt, distraction, and a lack of direction, 
                FlyBook offers a new path — a movement to help them become their own source of light.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlyBook</span> Offers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive resources and tools designed to unlock your potential and guide your journey to success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-400/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mb-8 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Our <span className="text-pink-400">Mission</span>
          </h2>
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <p className="text-xl md:text-2xl leading-relaxed mb-8">
              To ignite the inner potential of the next generation and nurture confident, conscious leaders 
              who will guide <span className="font-bold text-green-400">Bangladesh</span> — and the 
              <span className="font-bold text-blue-400"> world</span> — toward a better future.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <span className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-semibold shadow-lg">
                🇧🇩 Bangladesh
              </span>
              <span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold shadow-lg">
                🌍 Global Impact
              </span>
              <span className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg">
                🚀 Future Leaders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of young changemakers who are already transforming their lives with FlyBook
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Explore Content
            </button>
            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Join Community
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DownNav/>
      </div>
    </div>
  )
}

export default AboutUs