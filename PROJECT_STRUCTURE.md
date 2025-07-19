# 🏗️ Iwanyu Project Structure (Restructured for Hosting)

## 📁 **New Clean Structure**

```
iwanyu/
├── client/                 # 🎨 Frontend React Application
│   ├── src/               # React components, pages, contexts
│   ├── public/            # Static assets
│   ├── index.html         # Entry HTML file
│   ├── vite.config.js     # Vite build configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── package.json       # Frontend dependencies
│   └── ...                # Other frontend config files
│
├── server/                # 🚀 Backend Node.js API
│   ├── src/               # Express routes, controllers, middleware
│   ├── prisma/            # Database schema and migrations
│   ├── .env               # Backend environment variables
│   ├── package.json       # Backend dependencies
│   └── ...                # Other backend files
│
├── package.json           # 🎯 Root monorepo coordinator
├── vercel.json            # Vercel deployment config (frontend)
├── .env.production        # Production environment variables
└── README.md              # Project documentation
```

## 🚀 **Deployment Configuration**

### **Frontend Deployment (Vercel)**
- **Source**: `client/` directory
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `cd client && npm install`

### **Backend Deployment (Render.com)**
- **Source**: `server/` directory  
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`

## 🎯 **Why This Structure is Better for Hosting**

### ✅ **Benefits:**
1. **Clear Separation**: Frontend and backend are clearly separated
2. **Host-Friendly**: Hosting platforms can easily identify which part to deploy
3. **Scalable**: Each part can be deployed independently
4. **Industry Standard**: This is the common monorepo structure
5. **No Confusion**: No ambiguous `src/` directory in root

### 🔧 **Development Commands:**
```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend in development
npm run dev

# Build frontend for production
npm run build

# Run frontend only
npm run client:dev

# Run backend only  
npm run server:dev
```

## 📱 **For Hosting Platforms:**

### **Vercel (Frontend):**
- Point to root directory
- Vercel.json automatically handles client/ directory
- Environment variables: `VITE_API_URL`, `VITE_FLUTTERWAVE_PUBLIC_KEY`

### **Render.com (Backend):**
- Point to root directory
- Use build command: `cd server && npm install`
- Use start command: `cd server && npm start`
- Environment variables: All the backend vars in server/.env

This structure eliminates confusion for hosting platforms like Vercel, Netlify, and Render.com! 🎉
