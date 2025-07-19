# 🏗️ IWANYU PROJECT STRUCTURE - CLIENT/SERVER SEPARATION

## Project Organization

The Iwanyu e-commerce platform is now organized into two main parts:

### 📁 `/client` - Frontend Application
```
client/
├── src/                    # React source code
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API calls and utilities
│   ├── utils/             # Helper functions
│   ├── assets/            # Images and static files
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json           # Client dependencies
├── vite.config.js         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.cjs     # PostCSS configuration
└── index.html             # HTML entry point
```

### 📁 `/server` - Backend API
```
server/
├── src/                   # Express.js source code
│   ├── routes/            # API endpoints
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Authentication, validation
│   ├── services/          # Business logic
│   ├── utils/             # Database connection, helpers
│   └── server.js          # Express app entry point
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── uploads/               # File upload storage
├── .env                   # Environment variables
├── .env.example           # Environment template
└── package.json           # Server dependencies
```

### 📁 Root Configuration
```
├── package.json           # Monorepo coordinator
├── vercel.json            # Vercel deployment config
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
└── .github/               # GitHub workflows
```

## 🚀 Development Commands

### Install Dependencies
```bash
npm run install:all        # Install all dependencies
```

### Development
```bash
npm run dev                # Start both client and server
npm run client:dev         # Start only frontend
npm run server:dev         # Start only backend
```

### Production Build
```bash
npm run build              # Build client for production
npm run client:build       # Build frontend
npm run server:start       # Start production server
```

## 🌐 Deployment

- **Frontend**: Deployed to Vercel from `/client` directory
- **Backend**: Deployed to Render.com from `/server` directory
- **Database**: PostgreSQL on Neon.tech

## ✅ Clean Architecture

✅ **Separated Concerns**: Frontend and backend completely separated
✅ **No Duplicate Files**: Removed all redundant configurations
✅ **Production Ready**: Both client and server ready for deployment
✅ **Clean Dependencies**: Each part has only necessary dependencies
✅ **Clear Structure**: Easy to understand and maintain

This clean separation makes the project:
- Easier to deploy (separate deployments)
- Easier to maintain (clear responsibilities)
- Easier to scale (independent scaling)
- Easier to develop (separate development workflows)
