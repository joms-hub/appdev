# 📚 DevMate Documentation

Welcome to the DevMate documentation! This directory contains comprehensive guides for developing, deploying, and maintaining the DevMate application.

## 📋 Documentation Index

### 🚀 Getting Started
- **[Environment Setup](./ENVIRONMENT_SETUP.md)** - Complete guide for setting up development and production environments
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step production deployment guide

### 🔐 Authentication & Security
- **[Password Management Guide](./PASSWORD_MANAGEMENT_GUIDE.md)** - Comprehensive password system documentation including change password and forgot password flows

## 🏗️ Project Overview

DevMate is a modern web application built with:
- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5 with JWT sessions
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel with serverless functions
- **Email**: Resend for transactional emails

## 🔗 Quick Links

### Development
- [Main README](../README.md) - Project overview and quick start
- [Environment Setup](./ENVIRONMENT_SETUP.md) - Development environment configuration
- [Password Management](./PASSWORD_MANAGEMENT_GUIDE.md) - Authentication system documentation

### Deployment
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [Environment Variables](./ENVIRONMENT_SETUP.md#required-for-production) - Production configuration

## 🎯 Key Features Documented

### ✅ Authentication System
- Credentials-based login with password hashing
- OAuth integration (Google + GitHub)
- JWT session management with middleware protection
- Password change with security logout flow
- Forgot password with email reset tokens

### ✅ User Management
- Profile management with image uploads
- Real-time session updates
- Responsive navigation with session detection
- Toast notifications for user feedback

### ✅ Security Features
- bcrypt password hashing (12 salt rounds)
- Secure token generation for password resets
- Anti-enumeration protection
- OAuth account detection
- Input validation and error handling

## 🛠️ Development Workflow

1. **Setup**: Follow [Environment Setup](./ENVIRONMENT_SETUP.md)
2. **Development**: Use the guides in each documentation file
3. **Testing**: Refer to testing sections in feature guides
4. **Deployment**: Follow [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

## 📞 Support

For questions about the documentation or implementation:
- Check the specific guide for your feature
- Review the testing checklists in each document
- Consult the troubleshooting sections

---

**Last Updated**: January 25, 2025  
**Version**: 1.0.0  
**Maintainer**: DevMate Team
