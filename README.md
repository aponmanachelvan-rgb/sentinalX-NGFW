# 🛡️ SentinelX NGFW

> **Enterprise-Grade Firewall Management Dashboard** — A full-stack web application demonstrating real-world network security concepts with real-time analytics and intelligent threat detection.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

## 🎯 Project Overview

SentinelX is a production-ready network security dashboard that demonstrates enterprise-level full-stack development. It combines **real application logic** for firewall rule management, threat detection, and analytics with a modern React-based UI, showcasing skills in:

- **Full-Stack Development**: Next.js 14 with App Router, TypeScript, and server/client components
- **Real-Time Systems**: Supabase Realtime for live traffic updates and notifications
- **Database Design**: PostgreSQL with Row-Level Security (RLS) policies
- **Security**: Authentication, authorization, and secure data handling
- **DevOps**: Edge Functions, deployment strategies, and scalability patterns

## ✨ Key Features

### 🔐 Authentication & Authorization
- Supabase email/password authentication with JWT tokens
- Protected dashboard routes with role-based access control (RLS policies)
- Secure session management

### 🚨 Firewall Rule Management
- Full CRUD operations for firewall rules (source IP, port, protocol, action)
- Real-time rule evaluation engine
- Enable/disable rules with immediate effect
- Intuitive UI for complex rule configuration

### 📊 Real-Time Dashboard
- Live metrics: allowed/blocked traffic counts and trends
- Interactive Recharts visualizations with historical data
- Real-time traffic log updates via Supabase subscriptions
- Recent traffic table with filtering and sorting

### 🔴 Intelligent Threat Detection
- Port-scan detection algorithm (identifies and auto-blocks aggressive traffic)
- Blocked IP management with unblock capabilities
- Automatic rule generation for repeated threats
- Traffic pattern analysis

### 📥 Data Export
- CSV export API for compliance and reporting
- Downloadable traffic logs and rule configurations
- Ready for integration with SIEM systems

### ⚡ Automated Traffic Generation
- Supabase Edge Function for simulated packet generation
- Configurable traffic patterns and attack simulations
- Perfect for testing and demonstrations

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router and Server Components
- **Language**: TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with custom theme support (light/dark mode)
- **Charts**: Recharts for beautiful, responsive data visualization
- **Auth**: Supabase Auth client with protected routes and middleware

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT-based with Row-Level Security (RLS)
- **Real-Time**: Supabase Realtime subscriptions for live updates
- **Edge Functions**: TypeScript Edge Functions for serverless packet generation
- **Security**: HTTPS, CORS, input validation, SQL injection prevention

### Infrastructure
- **Hosting**: Vercel (Next.js optimal deployment)
- **Database Hosting**: Supabase (PostgreSQL)
- **Environment**: Production-ready with monitoring and error tracking

## 📋 Implementation Highlights

### Real-World Logic
✅ Firewall rule evaluation with protocol and port matching  
✅ Port-scan detection algorithm (SYN flood detection)  
✅ Rate-limiting and threat scoring  
✅ CSV export for compliance reporting  
✅ Real-time dashboard updates with WebSocket subscriptions  

### Database Design
- **Rules Table**: User-created firewall rules with RLS policies
- **Traffic Logs**: High-volume event logging with timestamps
- **Blocked IPs**: IP reputation tracking with automatic blocking
- **RLS Policies**: Ensures users see only their own data

### Security Best Practices
- Protected API routes with authentication
- Server-side data validation
- SQL injection prevention via parameterized queries
- CORS configuration for cross-origin requests
- Secure environment variable management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account (free tier works great)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sentinelx-ngfw.git
   cd sentinelx-ngfw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Initialize the database**
   - Copy the SQL from `supabase/schema.sql`
   - Paste it into the Supabase SQL editor and run

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

6. **Sign up and explore**
   - Create an account with any email/password
   - Create firewall rules and watch real-time traffic updates

## 📊 Live Demo & Testing

### Test Credentials
```
Email: test@example.com
Password: password123
```

### Test Scenarios
1. **Create a rule** blocking port 22 (SSH)
2. **Generate traffic** using the Edge Function to simulate packets
3. **Watch the dashboard** update in real-time
4. **Export data** as CSV for analysis
5. **Test port-scan detection** with rapid connection attempts

## 🔧 Development Guide

### Project Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes (export, traffic endpoints)
│   ├── (protected)/       # Protected routes with middleware
│   │   ├── dashboard/     # Main metrics and charts
│   │   ├── rules/         # Rule management interface
│   │   └── blocked-ips/   # IP reputation management
│   ├── login/             # Authentication page
│   └── signup/            # Registration page
├── components/            # Reusable React components
├── lib/                   # Utilities and helpers
│   ├── attack-engine.ts  # Threat detection logic
│   ├── network.ts        # Network utilities
│   ├── types.ts          # TypeScript type definitions
│   └── supabase/         # Supabase client configurations
└── middleware.ts         # Next.js middleware for auth
```

### Key Files
- **attack-engine.ts** - Port-scan detection and threat scoring
- **network.ts** - Rule matching and packet evaluation
- **schema.sql** - Database schema with RLS policies
- **Edge Function** - Traffic simulation

### Running Tests & Linting
```bash
# Type check
npm run build

# Lint code
npm run lint
```

## 📚 Documentation

- [Deployment Guide](docs/deployment.md) - Deploy to production
- [Wireshark Setup](docs/wireshark-setup.md) - Network traffic analysis

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows TypeScript best practices
- Components are properly typed
- Database changes include RLS policies
- Tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/sentinelx-ngfw/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/sentinelx-ngfw/discussions)
- **Email**: your.email@example.com

---

**⭐ If you found this project helpful, please consider giving it a star!**
