# Iwanyu E-commerce Platform - Copilot Instructions

This is a full-stack multi-vendor e-commerce platform built for the Rwandan market.

## Technology Stack

### Frontend
- **React.js** with Vite for fast development
- **Tailwind CSS** for styling (mobile-first approach)
- **React Router** for navigation
- **Framer Motion** for animations
- **React Hook Form** with Zod for form validation
- **React Hot Toast** for notifications
- **Socket.io Client** for real-time chat
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express.js
- **Prisma ORM** with PostgreSQL (NeonDB)
- **JWT** for authentication
- **Socket.io** for real-time features
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Multer** for file uploads
- **Flutterwave** for payment processing

### Database
- **PostgreSQL** hosted on Neon.tech
- **Prisma** as ORM
- File storage via Neon's storage capabilities

## Key Features

### User Roles
1. **Customer** - Browse, purchase, review products
2. **Vendor** - Manage products, orders, inventory
3. **Admin** - Platform management, vendor approval

### Core Functionality
- Multi-vendor marketplace
- Product catalog with variants (size, color, etc.)
- Shopping cart and wishlist
- Order management with tracking
- Payment integration (Flutterwave - RWF)
- Real-time anonymous chat between buyers and sellers
- Vendor KYC with document uploads
- Product reviews and ratings
- Mobile-responsive design

## Design Guidelines

### Colors
- Primary: Yellow (#FBBF24)
- Background: White (#FFFFFF)
- Light Gray: (#F3F4F6)
- Dark Gray: (#6B7280)

### UI/UX
- Mobile-first responsive design
- Glass/liquid UI effects with backdrop blur
- Skeleton loaders for better UX
- Smooth animations and transitions
- Clean, modern interface

## Code Structure

### Frontend (`/src`)
- `components/` - Reusable UI components
- `pages/` - Route components
- `contexts/` - React Context providers
- `hooks/` - Custom React hooks
- `services/` - API calls and utilities
- `utils/` - Helper functions

### Backend (`/server/src`)
- `routes/` - API endpoints
- `controllers/` - Route handlers
- `middleware/` - Authentication, validation
- `services/` - Business logic
- `utils/` - Database connection, helpers

## Development Guidelines

1. **Security First**: Always validate inputs, use parameterized queries
2. **Mobile Responsive**: Use Tailwind's responsive utilities
3. **Error Handling**: Implement proper error boundaries and try-catch blocks
4. **Performance**: Use pagination, lazy loading, and caching
5. **Code Quality**: Follow consistent naming conventions and documentation

## Environment Variables

See `.env.example` files in both frontend and backend directories for required configuration.

## Payment Integration

All transactions use Flutterwave with RWF (Rwandan Franc) as the primary currency.

## Real-time Features

Socket.io enables:
- Live chat between buyers and sellers
- Real-time order updates
- Typing indicators
- Message read receipts
