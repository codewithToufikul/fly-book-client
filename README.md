# 📚 Fly-Book - Complete Social Learning Platform

<div align="center">

![Fly-Book Logo](https://via.placeholder.com/200x200?text=Fly-Book)

**A comprehensive full-stack platform combining Social Networking, E-Learning, E-Commerce, Job Marketplace, and Community Management**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11.1.0-FFCA28.svg)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.16-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](#) | [Documentation](#features) | [Report Bug](#) | [Request Feature](#)

</div>

---

## 🌟 Overview

**Fly-Book** is an all-in-one platform designed for students, educators, professionals, and organizations. It seamlessly integrates multiple services into a unified ecosystem:

- 📱 **Social Networking** - Connect, share, and engage with your community
- 🎓 **E-Learning Platform** - Access courses, videos, and educational content
- 🛒 **E-Commerce Marketplace** - Buy and sell products with integrated payment
- 💼 **Job & Freelance Board** - Find jobs or hire talent
- 🏢 **Organization Management** - Manage student groups, NGOs, and communities
- 📖 **Book Library System** - Share physical books and access digital PDFs
- 🤖 **AI-Powered Features** - Chatbot assistance and smart recommendations
- 💰 **Gamified Coin System** - Earn rewards and redeem at physical locations

---

## ✨ Key Features

### 🔐 Authentication & User Management

- Email/Password authentication with Firebase
- Face verification for enhanced security
- Password recovery and reset
- Multi-role support (User, Admin, Seller, Employer)
- Referral system with tracking
- Profile customization with cover photos

### 📱 Social Media Platform

- News feed with infinite scroll
- Post creation (text, images, videos)
- Like, comment, and share functionality
- Real-time post updates via Socket.io
- Auto-translation based on user location
- Public opinion discussions
- User profiles and friend system
- Advanced search and discovery

### 💬 Real-time Chat & Messaging

- One-on-one messaging
- Image and file sharing
- Online status indicators
- Message notifications
- Real-time updates with Socket.io
- Chat history and search

### 🤖 AI-Powered Features

- **AI Chatbot** powered by Groq API
- Face recognition for profile verification
- Language detection and auto-translation
- AI-generated educational content
- Smart content recommendations

### 🎓 E-Learning System

- Course catalog with categories
- Video lessons with progress tracking
- Course enrollment and management
- Student dashboard
- Audio books library
- Educational channels
- PDF book viewer
- Search and filtering by category, level, price

### 📚 Book Library System

- **Physical Book Sharing** - P2P lending system
- Personal library management
- Book request system
- Transfer history tracking
- **Location-based** nearby book discovery
- Digital PDF library
- Book categories and search
- Donation tracking

### 🛒 E-Commerce Marketplace

- Product catalog with categories
- Advanced search and filtering
- Shopping cart and wishlist
- Secure checkout process
- Order tracking
- **Seller Dashboard**:
  - Product management
  - Order processing
  - Payment tracking
  - Withdrawal system
  - Banner advertising
- **Admin Marketplace Controls**:
  - Seller approvals
  - Product moderation
  - Category management
  - Payment processing

### 💼 Job Board & Freelance Marketplace

- Full-time and part-time job listings
- Job application system
- Employer dashboard
- Freelance project marketplace
- Proposal and bidding system
- Client and freelancer dashboards
- Application tracking

### 🏢 Organizations & Communities

- Create and manage organizations
- Partner and social organization types
- Activity and event management
- Member management
- Organization approval workflow
- Community forums
- Discussion boards
- Community creation with custom branding

### 💰 Wallet & Coin System

- Virtual wallet for each user
- **Earn coins through**:
  - Referrals
  - Post engagement
  - Course completion
  - Daily login rewards
- Coin transfer between users
- **Wallet Shop** - Physical redemption locations
- Location-based services with Google Maps
- QR code generation for transactions

### 🎓 Research & Thesis Repository

- Thesis submission and browsing
- PDF reader with navigation
- Category filtering
- Search functionality
- Admin moderation

### 👨‍💼 Comprehensive Admin Dashboard

- **Analytics** with Chart.js visualizations
- **User Management** - Roles, bans, referrals
- **Content Moderation** - Posts, books, courses
- **E-Commerce Management** - Sellers, products, orders
- **Organization Controls** - Approvals, events
- **Course Management** - Add, edit, moderate
- **Community Moderation**
- **Job Board Management** - Employer approvals
- **Location Management** for wallet shops
- **Financial Tracking** - Transfers, payments

### 🔔 Notifications System

- Real-time notifications via Socket.io
- Multiple notification types:
  - Post interactions
  - Messages
  - Order updates
  - Course enrollments
  - Organization invites
- Notification center with mark as read

### 🔍 Search & Discovery

- Global search across all content
- User, product, course, and job search
- Advanced filtering by categories and tags
- Autocomplete suggestions

---

## 🛠️ Technology Stack

### Frontend

- **React 18.3.1** - UI library
- **Vite 6.0.1** - Build tool
- **React Router 7.2.0** - Routing
- **TailwindCSS 3.4.16** - Styling
- **DaisyUI 4.12.22** - Component library
- **Material-UI** - Additional components

### State Management

- **TanStack React Query 5.62.8** - Server state
- **Axios 1.7.9** - HTTP client

### Real-time & Backend

- **Socket.io Client 4.8.1** - WebSocket
- **Firebase 11.1.0** - Auth & database

### AI & ML

- **Groq API** - AI chatbot
- **HuggingFace Inference** - AI models
- **face-api.js** - Face detection

### Media & Files

- **Cloudinary** - Image/video hosting
- **ImgBB API** - Image uploads
- **pdfjs-dist** - PDF rendering
- **browser-image-compression** - Image optimization

### Maps & Location

- **Google Maps API** - Location services

### Additional Libraries

- **Chart.js** - Data visualization
- **SweetAlert2** - Alerts
- **React Hot Toast** - Notifications
- **EmailJS** - Email integration
- **QRCode.react** - QR generation
- **Swiper** - Carousels

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun**
- **Firebase Account**
- **Cloudinary Account**
- **Google Maps API Key**
- **Groq API Key** (for AI chatbot)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/fly-book-client.git
   cd fly-book-client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   VITE_API_KEY=your_firebase_api_key
   VITE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_DATABASE_URL=your_firebase_database_url
   VITE_PROJECT_ID=your_firebase_project_id
   VITE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_APP_ID=your_firebase_app_id

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

   # Image Hosting
   VITE_IMAGE_HOSTING_KEY=your_imgbb_api_key

   # Google Maps
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # AI Configuration
   VITE_GROQ_API_KEY=your_groq_api_key

   # Socket.io Server
   VITE_SOCKET_URL=https://your-backend-server.com
   VITE_SOCKET_SERVER_URL=https://your-backend-server.com
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 📦 Build for Production

```bash
npm run build
# or
bun run build
```

The optimized production build will be in the `dist/` directory.

---

## 🗂️ Project Structure

```
fly-book-client/
├── public/                 # Static assets
├── src/
│   ├── Components/         # Reusable components
│   │   ├── Navbar/
│   │   ├── DownNav/
│   │   ├── Categories/
│   │   └── ...
│   ├── Page/              # Page components (routes)
│   │   ├── Home/
│   │   ├── Profile/
│   │   ├── Marketplace/
│   │   ├── ELearning/
│   │   ├── Jobs/
│   │   ├── Community/
│   │   ├── Organizations/
│   │   ├── DashboardPages/
│   │   └── ...
│   ├── Hooks/             # Custom React hooks
│   ├── FireBase/          # Firebase configuration
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   ├── assets/            # Images, icons, etc.
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── .env.local             # Environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎯 Key User Journeys

### 👨‍🎓 Student Journey

1. Register → Verify Email → Complete Profile
2. Browse Courses → Enroll → Watch Videos → Track Progress
3. Join Communities → Participate in Discussions
4. Borrow Books from Library
5. Earn Coins → Redeem at Wallet Shop

### 🛍️ Seller Journey

1. Register → Request Seller Access → Get Approved
2. Create Seller Profile → Add Products
3. Manage Orders → Process Payments
4. Request Banner Ads → Track Sales
5. Withdraw Earnings

### 💼 Employer Journey

1. Register → Request Employer Access → Get Approved
2. Post Job Listings → Manage Applications
3. Review Candidates → Hire Talent

### 🏢 Organization Admin Journey

1. Create Organization → Get Approved
2. Add Members → Post Activities/Events
3. Manage Community → Track Engagement

---

## 🔒 Security Features

- ✅ Firebase Authentication
- ✅ JWT token-based API authentication
- ✅ Face verification for enhanced security
- ✅ Role-based access control (RBAC)
- ✅ Private and admin route protection
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ CORS configuration

---

## ⚡ Performance Optimizations

- ✅ Code splitting with lazy loading
- ✅ Image compression before upload
- ✅ Cloudinary optimization for media
- ✅ React Query caching for API responses
- ✅ Memoization with useMemo/useCallback
- ✅ Debouncing for search inputs
- ✅ Infinite scroll for feeds
- ✅ Optimized bundle size

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet-optimized layouts
- ✅ Desktop-enhanced experience
- ✅ Bottom navigation for mobile
- ✅ Touch-friendly interfaces

---

## 🌐 API Integration

### Backend Server

- Base URL: `https://fly-book-server-lzu4.onrender.com`
- RESTful API architecture
- Socket.io for real-time features

### Third-Party Services

- **Firebase** - Authentication, real-time database
- **Cloudinary** - Image/video hosting
- **ImgBB** - Image uploads
- **Google Maps** - Location services
- **Groq API** - AI chatbot
- **HuggingFace** - AI models
- **EmailJS** - Email services

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (if configured)
npm test
```

---

## 📄 Available Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Toufik Islam** - _Initial work_ - [GitHub](https://github.com/codewithToufikul)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for authentication and real-time database
- Cloudinary for media hosting
- All open-source contributors

---

## 📞 Support

For support, email support@flybook.com or join our community channels.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Video calling integration
- [ ] Advanced analytics dashboard
- [ ] Blockchain integration for coins
- [ ] Live streaming for courses
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced recommendation engine
- [ ] Gamification badges/achievements

---

## 📊 Project Stats

- **70+ Routes** across the application
- **17 Major Feature Domains**
- **80+ Components**
- **10+ Third-party Integrations**
- **100+ Sub-features**

---

<div align="center">

**Made with ❤️ by the Fly-Book Team**

⭐ Star us on GitHub — it motivates us a lot!

[Website](#) | [Documentation](#) | [Community](#) | [Blog](#)

</div>
