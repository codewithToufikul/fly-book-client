import React, { useState } from 'react'
import { FileText, Users, Shield, Lock, Eye, AlertTriangle, CheckCircle, XCircle, Mail, Scale, UserCheck, Globe, Book } from 'lucide-react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const sections = [
    {
      id: 'who-can-use',
      title: 'Who Can Use FlyBook',
      icon: <UserCheck className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h4 className="text-xl font-semibold text-blue-800">Age Requirements</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white rounded-lg border border-blue-300">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-blue-800">You must be at least <strong>13 years old</strong> (or older if required in your country) to create an account</span>
              </div>
              <div className="flex items-center p-3 bg-white rounded-lg border border-blue-300">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-blue-800">If you are under <strong>18</strong>, you must have permission from a parent or guardian</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'account-responsibility',
      title: 'Your FlyBook Account',
      icon: <Lock className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold text-green-800 mb-2">Account Responsibility</h4>
              <p className="text-green-700 text-sm">You are responsible for your account and anything done using it</p>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
              <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h4 className="font-semibold text-red-800 mb-2">Password Security</h4>
              <p className="text-red-700 text-sm">Keep your password safe and don't share it with others</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 text-center">
              <XCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-purple-800 mb-2">Account Deletion</h4>
              <p className="text-purple-700 text-sm">You can delete your account at any time by contacting us</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'platform-rules',
      title: 'What You Can and Cannot Do',
      icon: <Scale className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What You May Do */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <h4 className="text-xl font-bold text-green-800">You May:</h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Share your thoughts, stories, creative content, and learning experiences",
                  "Join groups, comment, and engage respectfully with others", 
                  "Report harmful or inappropriate behavior"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-green-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You May Not Do */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center mb-4">
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                <h4 className="text-xl font-bold text-red-800">You May Not:</h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Use FlyBook to harass, bully, threaten, or harm others",
                  "Post or share illegal, violent, or sexually explicit content",
                  "Pretend to be someone else or give false information",
                  "Interfere with the platform's normal functioning"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'content-sharing',
      title: 'Content You Share',
      icon: <Book className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 text-center">
              <Eye className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-blue-800 mb-2">You Own Your Content</h4>
              <p className="text-blue-700 text-sm">But you give FlyBook permission to show it publicly on our platform</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 text-center">
              <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-purple-800 mb-2">Content Promotion</h4>
              <p className="text-purple-700 text-sm">FlyBook may feature or promote your content (with credit to you)</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 text-center">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold text-orange-800 mb-2">Respect Rights</h4>
              <p className="text-orange-700 text-sm">Don't post anything that infringes copyright or violates someone else's rights</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
                <p className="text-yellow-700">
                  By sharing content on FlyBook, you grant us a non-exclusive license to display, distribute, and promote your content 
                  within our platform to help build our educational community. You retain full ownership of your intellectual property.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'platform-changes',
      title: 'Platform Changes and Termination',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
            <div className="flex items-start">
              <AlertTriangle className="w-8 h-8 text-orange-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-bold text-orange-800 mb-4">Platform Modifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-orange-300">
                    <h5 className="font-semibold text-orange-900 mb-2">Feature Changes</h5>
                    <p className="text-orange-700 text-sm">We may change features or remove access to parts of the platform without notice</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-300">
                    <h5 className="font-semibold text-orange-900 mb-2">Account Actions</h5>
                    <p className="text-orange-700 text-sm">We reserve the right to suspend or delete your account if you violate these Terms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'legal-disclaimers',
      title: 'Legal Disclaimers',
      icon: <Scale className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Service "As Is"</h4>
              <p className="text-gray-600 text-sm">
                FlyBook is provided "as is." We do our best to keep it safe and helpful but cannot guarantee it will always work perfectly.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">User Content</h4>
              <p className="text-blue-700 text-sm">
                We are not responsible for user-generated content, but we will take action against violations.
              </p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-3">Governing Law</h4>
              <p className="text-indigo-700 text-sm">
                Disputes will be handled under the laws of Bangladesh.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const quickLinks = [
    { id: 'who-can-use', title: 'Who Can Use' },
    { id: 'account-responsibility', title: 'Your Account' },
    { id: 'platform-rules', title: 'Platform Rules' },
    { id: 'content-sharing', title: 'Content Rights' },
    { id: 'platform-changes', title: 'Changes & Termination' },
    { id: 'legal-disclaimers', title: 'Legal Disclaimers' }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar/>
      
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-8 shadow-xl">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Welcome to FlyBook! These Terms govern your access to and use of our platform, 
            including our website, mobile services, and community features.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-lg rounded-full px-6 py-3">
              <CheckCircle className="w-5 h-5 text-green-300 mr-2" />
              <span className="text-blue-100">Effective Date: January 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
            <p className="text-yellow-800 font-medium">
              By using FlyBook, you agree to these Terms. If you do not agree, please do not use our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-6">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {link.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Quick Navigation
              </h3>
              <nav className="space-y-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      activeSection === link.id
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {link.title}
                  </button>
                ))}
              </nav>

              {/* Terms Agreement Checkbox */}
              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-green-800">
                    I have read and agree to these Terms of Service
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section.id} id={section.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
                    <div className="text-white">
                      {section.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{index + 1}. {section.title}</h2>
                </div>
                {section.content}
              </div>
            ))}

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
              <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Questions About These Terms?</h2>
              <p className="text-indigo-100 mb-6 text-lg">
                If you have any questions about these Terms of Service, we're here to help!
              </p>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 inline-block">
                <p className="text-white font-semibold">
                  📧 Email: <span className="text-indigo-200">support@flybook.com.bd</span>
                </p>
              </div>
            </div>

            {/* Final Agreement */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 ${
              acceptedTerms ? 'border-green-300 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  acceptedTerms ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {acceptedTerms ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {acceptedTerms ? 'Terms Accepted!' : 'Ready to Join FlyBook?'}
                </h3>
                <p className="text-gray-700 mb-6">
                  {acceptedTerms 
                    ? 'Thank you for reading and accepting our Terms of Service. Welcome to the FlyBook community!'
                    : 'Please review and accept our Terms of Service to continue using FlyBook.'
                  }
                </p>
                {acceptedTerms && (
                  <div className="flex justify-center space-x-4">
                    <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Start Exploring FlyBook
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DownNav/>
      </div>
    </div>
  )
}

export default TermsConditions