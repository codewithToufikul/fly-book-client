import React, { useState } from 'react'
import { Shield, Eye, Lock, Users, FileText, Mail, Globe, AlertCircle, CheckCircle, Cookie, UserCheck, Database, Scale } from 'lucide-react'
import Navbar from '../../Components/Navbar/Navbar'
import DownNav from '../../Components/DownNav/DownNav'

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(null)

  const sections = [
    {
      id: 'information-collect',
      title: 'Information We Collect',
      icon: <Database className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We may collect the following types of information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Personal Information
              </h4>
              <p className="text-blue-700 text-sm">
                Name, email address, date of birth, location, profile picture, and any other details you voluntarily provide.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Account Activity
              </h4>
              <p className="text-green-700 text-sm">
                Comments, posts, messages, likes, bookmarks, and any other content you submit.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Usage Data
              </h4>
              <p className="text-purple-700 text-sm">
                IP address, browser type, device info, time spent, features used, error logs.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <Cookie className="w-5 h-5 mr-2" />
                Cookies & Similar Technologies
              </h4>
              <p className="text-orange-700 text-sm">
                Used to remember preferences, improve user experience, and analyze traffic.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cookie-policy',
      title: 'Cookie Policy',
      icon: <Cookie className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-4">FlyBook uses cookies to:</h4>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-600" />Remember login sessions</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-600" />Personalize content based on your activity</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-600" />Monitor usage analytics (via tools like Google Analytics)</li>
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-amber-600" />Enable basic site functionality</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Managing Cookies:</h4>
            <p className="text-gray-700">
              You can choose to accept or refuse cookies through your browser settings. Please note that disabling cookies may limit some features of FlyBook.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed mb-6">We use your data to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Provide and personalize your FlyBook experience",
              "Offer educational and creative tools tailored to youth",
              "Facilitate community interaction (comments, likes, messages)",
              "Communicate updates, offers, and service notifications",
              "Detect and prevent fraud, abuse, or policy violations",
              "Comply with legal and regulatory obligations"
            ].map((item, index) => (
              <div key={index} className="flex items-start p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <CheckCircle className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-800 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'gdpr-compliance',
      title: 'GDPR Compliance',
      icon: <Scale className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <p className="text-blue-800 mb-4">
              If you're in the European Union or European Economic Area, you have specific rights under the General Data Protection Regulation (GDPR):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Right to Access", desc: "Request access to the data we hold about you" },
                { title: "Right to Rectification", desc: "Request corrections to inaccurate or incomplete data" },
                { title: "Right to Erasure", desc: "Request deletion of your personal data" },
                { title: "Right to Data Portability", desc: "Request a copy of your data in a usable format" },
                { title: "Right to Object", desc: "Object to data processing for direct marketing" }
              ].map((right, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-blue-300">
                  <h5 className="font-semibold text-blue-900 mb-2">{right.title}</h5>
                  <p className="text-blue-700 text-sm">{right.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800">
              To exercise these rights, email: <strong>privacy@flybook.com.bd</strong>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sharing-info',
      title: 'Sharing Your Information',
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-red-800 mb-2">We never sell your personal information</h4>
          </div>
          <p className="text-gray-700">We may share your data with:</p>
          <div className="space-y-3">
            {[
              "Third-party service providers who help run our platform (e.g., hosting, analytics)",
              "Legal authorities, if required by law",
              "Business partners, in case of merger or acquisition (with proper notice)"
            ].map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'community-safety',
      title: 'Community Content and Safety',
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <p className="text-green-800 mb-4">
              FlyBook encourages creative expression, respectful dialogue, and a safe space for youth. By posting content (text, images, audio, etc.), you agree that:
            </p>
            <ul className="space-y-2">
              {[
                "You own the content or have the right to share it",  
                "You grant FlyBook a non-exclusive, royalty-free license to display and share your content within the platform",
                "You will not post anything harmful, hateful, illegal, misleading, or sexually explicit"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Moderation:</h4>
            <p className="text-yellow-700">
              FlyBook reserves the right to remove or restrict content that violates our Community Guidelines or this Privacy Policy.
            </p>
          </div>
        </div>
      )
    }
  ]

  const quickLinks = [
    { id: 'information-collect', title: 'Information We Collect' },
    { id: 'cookie-policy', title: 'Cookie Policy' },
    { id: 'how-we-use', title: 'How We Use Data' },
    { id: 'gdpr-compliance', title: 'GDPR Rights' },
    { id: 'sharing-info', title: 'Data Sharing' },
    { id: 'community-safety', title: 'Community Safety' }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar/>
      
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-8 shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Your privacy and security are our top priorities at FlyBook Bangladesh
          </p>
          <div className="mt-8 text-sm text-blue-200">
            Last updated: January 2025
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
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
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
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {link.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to FlyBook's Privacy Policy</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                FlyBook is a digital platform that empowers young people through learning, creativity, and community. 
                This Privacy Policy outlines how we collect, use, and protect your information when you visit or interact with FlyBook 
                via our website or related services.
              </p>
            </div>

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={section.id} id={section.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
                    <div className="text-white">
                      {section.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{index + 1}. {section.title}</h2>
                </div>
                {section.content}
              </div>
            ))}

            {/* Additional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Database className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Data Retention</h3>
                </div>
                <p className="text-gray-700">
                  We retain your personal data as long as your account is active or as needed for legal, operational, or security purposes. 
                  You may request deletion of your account and associated data at any time.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Children's Privacy</h3>
                </div>
                <p className="text-gray-700">
                  FlyBook is not intended for children under 13 years of age. We do not knowingly collect data from children without parental consent.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Lock className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Data Security</h3>
                </div>
                <p className="text-gray-700">
                  We use industry-standard security practices to protect your data. This includes encryption, firewalls, access controls, and secure data storage.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <FileText className="w-8 h-8 text-orange-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Policy Updates</h3>
                </div>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. Any changes will be posted here with an updated revision date.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white text-center">
              <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
              <p className="text-blue-100 mb-6 text-lg">
                If you have any questions, concerns, or data requests, please don't hesitate to contact us.
              </p>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 inline-block">
                <p className="text-white font-semibold">
                  Email: <span className="text-blue-200">privacy@flybook.com.bd</span>
                </p>
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

export default PrivacyPolicy