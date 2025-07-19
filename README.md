# 🛒 Iwanyu E-commerce Platform

A modern, full-stack multi-vendor e-commerce platform built for the Rwandan market.

## 🏗️ Project Structure

```
iwanyu/
├── client/          # React Frontend (Vite + Tailwind CSS)
├── server/          # Node.js Backend (Express + Prisma)
├── package.json     # Monorepo coordinator
└── vercel.json      # Deployment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Development Commands
```bash
npm run dev              # Start both client and server
npm run client:dev       # Frontend only (React + Vite)
npm run server:dev       # Backend only (Express + Prisma)
npm run build           # Build for production
```

### Database & Storage
- **PostgreSQL** on Neon.tech
- **Neon Storage** for images and documents

## 🎨 Design System

### Colors
- Primary: `#FBBF24` (Yellow)
- Background: `#FFFFFF` (White)
- Light Gray: `#F3F4F6`
- Dark Gray: `#6B7280`

### UI Features
- Glass/liquid effects with backdrop blur
- Skeleton loaders
- Smooth animations
- Mobile-first responsive design

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon.tech recommended)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iwanyu
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Configuration**
   
   **Frontend** (create `.env` in root):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
   ```

   **Backend** (copy `server/.env.example` to `server/.env`):
   ```env
   DATABASE_URL="your_neon_database_url"
   JWT_SECRET="your_jwt_secret"
   FLUTTERWAVE_SECRET_KEY="your_flutterwave_secret_key"
   FLUTTERWAVE_PUBLIC_KEY="your_flutterwave_public_key"
   CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
   CLOUDINARY_API_KEY="your_cloudinary_api_key"
   CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
   ```

5. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

6. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:slug` - Get product details
- `POST /api/products` - Create product (vendor)
- `PUT /api/products/:id` - Update product (vendor)

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

## 💳 Payment Integration

Iwanyu uses Flutterwave for secure payment processing:

1. **Supported Currency**: RWF (Rwandan Franc)
2. **Payment Methods**: Mobile Money, Bank Cards
3. **Security**: PCI DSS compliant
4. **Webhooks**: Real-time payment status updates

## 💬 Real-time Chat

Features include:
- Anonymous buyer-seller communication
- Message history
- Typing indicators
- Read receipts
- File sharing support

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 📱 Mobile Responsiveness

Built with mobile-first approach:
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Touch-friendly interface
- Optimized for mobile networks
- Progressive Web App features

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Railway/Heroku)
```bash
cd server
npm start
```

### Database
- Use Neon.tech for PostgreSQL hosting
- Configure connection pooling
- Set up automatic backups

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test
```

## 📊 Performance Optimization

- Image optimization and lazy loading
- Code splitting with React.lazy
- Database query optimization
- Caching strategies
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@iwanyu.rw or create an issue on GitHub.

## 🔄 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Kinyarwanda, French, English)
- [ ] Advanced search with filters
- [ ] Product recommendations
- [ ] Bulk vendor operations
- [ ] Mobile app development
- [ ] Integration with local delivery services

---

**Built with ❤️ for Rwanda's digital commerce future**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
