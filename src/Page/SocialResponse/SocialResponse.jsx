import React, { useState } from 'react'
import { Phone, MessageCircle, AlertCircle, Clock, User, FileText, Mail, MapPin, Star, CheckCircle } from 'lucide-react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'
import usePublicAxios from '../../Hooks/usePublicAxios'
import toast from 'react-hot-toast'

function SocialResponse() {
  const [selectedService, setSelectedService] = useState(null)
  const [complaintForm, setComplaintForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    location: '',
    message: '',
    priority: 'medium'
  })
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: '',
    serviceType: ''
  })
  const [loading, setLoading] = useState(false)
  const axiosPublic = usePublicAxios()

  // Mock data for doctors
  const doctors = [
    { 
      id: 1, 
      name: 'Dr. Rahman Ahmed', 
      specialty: 'General Medicine', 
      available: true, 
      rating: 4.8,
      experience: '15 Years',
      phone: '+880-1234-567890',
      location: 'Dhaka Medical College'
    },
    { 
      id: 2, 
      name: 'Dr. Fatema Khatun', 
      specialty: 'Pediatrics', 
      available: true, 
      rating: 4.9,
      experience: '12 Years',
      phone: '+880-1234-567891',
      location: 'Bangabandhu Sheikh Mujib Medical University'
    },
    { 
      id: 3, 
      name: 'Dr. Karim Uddin', 
      specialty: 'Emergency Care', 
      available: false, 
      rating: 4.7,
      experience: '10 Years',
      phone: '+880-1234-567892',
      location: 'Sir Salimullah Medical College'
    },
    { 
      id: 4, 
      name: 'Dr. Nasir Uddin', 
      specialty: 'Cardiology', 
      available: true, 
      rating: 4.6,
      experience: '20 Years',
      phone: '+880-1234-567893',
      location: 'National Heart Foundation'
    }
  ]

  // Mock data for lawyers
  const lawyers = [
    { 
      id: 1, 
      name: 'Advocate Md. Ali Hossain', 
      specialty: 'Criminal Law', 
      available: true, 
      rating: 4.9,
      experience: '18 Years',
      phone: '+880-1234-567894',
      location: 'Supreme Court, Dhaka'
    },
    { 
      id: 2, 
      name: 'Advocate Roksana Begum', 
      specialty: 'Family Law', 
      available: true, 
      rating: 4.8,
      experience: '14 Years',
      phone: '+880-1234-567895',
      location: 'Judge Court, Dhaka'
    },
    { 
      id: 3, 
      name: 'Advocate Abul Kalam', 
      specialty: 'Civil Rights', 
      available: false, 
      rating: 4.7,
      experience: '16 Years',
      phone: '+880-1234-567896',
      location: 'Barrister Court, Dhaka'
    },
    { 
      id: 4, 
      name: 'Advocate Selina Khatun', 
      specialty: 'Consumer Protection', 
      available: true, 
      rating: 4.6,
      experience: '12 Years',
      phone: '+880-1234-567897',
      location: 'District Judge Court, Dhaka'
    }
  ]

  // Handle complaint form submission
  const handleComplaintSubmit = async () => {
    if (!complaintForm.name || !complaintForm.phone || !complaintForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically send data to your backend
      // await axiosPublic.post('/social-response/complaint', complaintForm)
      
      toast.success('Your complaint has been submitted successfully!')
      setComplaintForm({ 
        name: '', 
        phone: '', 
        email: '',
        location: '',
        message: '',
        priority: 'medium'
      })
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle contact form submission
  const handleContactSubmit = async (serviceType, professionalName) => {
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const contactData = {
        ...contactForm,
        serviceType,
        professionalName,
        timestamp: new Date().toISOString()
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically send data to your backend
      // await axiosPublic.post('/social-response/contact', contactData)
      
      toast.success(`Contact request sent to ${professionalName} successfully!`)
      setContactForm({
        name: '',
        phone: '',
        message: '',
        serviceType: ''
      })
    } catch (error) {
      toast.error('Failed to send contact request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle direct call
  const handleCall = (name, phone) => {
    toast.success(`Connecting you with ${name}...`)
    // In a real app, you might integrate with telephony services
    console.log(`Calling ${name} at ${phone}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* Hero Section */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Social Response Services
          </h1>
          <p className="text-xl text-gray-600">
            24/7 Emergency Support • We're Here When You Need Us
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Doctor Card */}
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-t-4 border-green-500"
            onClick={() => setSelectedService('doctor')}
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Phone className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Doctor 24/7</h2>
            <p className="text-gray-600 text-center mb-4">
              Connect with licensed medical professionals anytime
            </p>
            <div className="flex items-center justify-center text-green-600">
              <Clock size={16} className="mr-2" />
              <span className="text-sm font-semibold">Available Now</span>
            </div>
          </div>

          {/* Lawyer Card */}
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-t-4 border-blue-500"
            onClick={() => setSelectedService('lawyer')}
          >
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Lawyer 24/7</h2>
            <p className="text-gray-600 text-center mb-4">
              Get legal advice and support round the clock
            </p>
            <div className="flex items-center justify-center text-blue-600">
              <Clock size={16} className="mr-2" />
              <span className="text-sm font-semibold">Available Now</span>
            </div>
          </div>

          {/* Complaint Card */}
          <div 
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-t-4 border-red-500"
            onClick={() => setSelectedService('complaint')}
          >
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">File Complaint</h2>
            <p className="text-gray-600 text-center mb-4">
              Report issues and get them resolved quickly
            </p>
            <div className="flex items-center justify-center text-red-600">
              <MessageCircle size={16} className="mr-2" />
              <span className="text-sm font-semibold">Report Now</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {selectedService === 'doctor' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Phone className="text-green-600 mr-3" size={32} />
              Available Doctors
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="border border-gray-200 rounded-xl p-6 hover:border-green-500 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                        <User className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{doctor.name}</h4>
                        <p className="text-gray-600 text-sm">{doctor.specialty}</p>
                        <p className="text-gray-500 text-xs">{doctor.experience} Experience</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doctor.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {doctor.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <MapPin size={14} className="mr-2" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone size={14} className="mr-2" />
                      <span>{doctor.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-yellow-500 font-semibold flex items-center">
                      <Star size={16} className="mr-1" />
                      {doctor.rating}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCall(doctor.name, doctor.phone)}
                        disabled={!doctor.available}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${doctor.available ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Call Now
                      </button>
                      <button 
                        onClick={() => {
                          setContactForm({...contactForm, serviceType: 'doctor', message: `I would like to contact Dr. ${doctor.name}`})
                          setSelectedService('contact')
                        }}
                        disabled={!doctor.available}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${doctor.available ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedService === 'lawyer' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <FileText className="text-blue-600 mr-3" size={32} />
              Available Lawyers
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {lawyers.map(lawyer => (
                <div key={lawyer.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                        <User className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{lawyer.name}</h4>
                        <p className="text-gray-600 text-sm">{lawyer.specialty}</p>
                        <p className="text-gray-500 text-xs">{lawyer.experience} Experience</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lawyer.available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {lawyer.available ? 'Available' : 'In Session'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <MapPin size={14} className="mr-2" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone size={14} className="mr-2" />
                      <span>{lawyer.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-yellow-500 font-semibold flex items-center">
                      <Star size={16} className="mr-1" />
                      {lawyer.rating}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCall(lawyer.name, lawyer.phone)}
                        disabled={!lawyer.available}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${lawyer.available ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Call Now
                      </button>
                      <button 
                        onClick={() => {
                          setContactForm({...contactForm, serviceType: 'lawyer', message: `I would like to consult with ${lawyer.name}`})
                          setSelectedService('contact')
                        }}
                        disabled={!lawyer.available}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${lawyer.available ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedService === 'complaint' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={32} />
              File a Complaint
            </h3>
            <div className="max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                  <input 
                    type="text"
                    value={complaintForm.name}
                    onChange={(e) => setComplaintForm({...complaintForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                  <input 
                    type="tel"
                    value={complaintForm.phone}
                    onChange={(e) => setComplaintForm({...complaintForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="+880-XXXXXXXXX"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input 
                  type="email"
                  value={complaintForm.email}
                  onChange={(e) => setComplaintForm({...complaintForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="example@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Location</label>
                <input 
                  type="text"
                  value={complaintForm.location}
                  onChange={(e) => setComplaintForm({...complaintForm, location: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="District, Upazila"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Complaint Details *</label>
                <textarea 
                  value={complaintForm.message}
                  onChange={(e) => setComplaintForm({...complaintForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                  placeholder="Describe your complaint in detail..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Priority</label>
                <select 
                  value={complaintForm.priority}
                  onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button 
                onClick={handleComplaintSubmit}
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
            
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Note:</strong> All complaints are reviewed within 24 hours. For emergencies, please call our hotline directly.
              </p>
            </div>
          </div>
        )}

        {selectedService === 'contact' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <MessageCircle className="text-indigo-600 mr-3" size={32} />
              Contact Request
            </h3>
            <div className="max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Your Name *</label>
                  <input 
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                  <input 
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+880-XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Message *</label>
                <textarea 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                  placeholder="Enter your message..."
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleContactSubmit(contactForm.serviceType, 'Professional')}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="px-6 py-4 bg-gray-500 text-white rounded-lg font-bold text-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedService && (
          <div className="text-center text-gray-500 py-12">
            <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl">Select a service above to get started</p>
          </div>
        )}
      </div>

      <DownNav />
    </div>
  )
}

export default SocialResponse