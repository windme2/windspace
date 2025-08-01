# 🌌 WindSpace 

A personal blog platform sharing insights on **web development, technology, travel, food, and lifestyle**.  
It reflects my journey as a developer and serves as a space to share stories, ideas, and lessons learned along the way.  

> **🚀 [Live Demo](https://windspace-demo.vercel.app)** - *Coming Soon*

---

## ⚙️ Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Shadcn UI  
- **Backend:** Node.js (Express), TypeScript  
- **Database:** Supabase (PostgreSQL)  
- **State Management:** React Hooks  
- **Deployment:** Vercel (Frontend), Railway (Backend)  
- **Other Tools:** Git, Postman, ESLint, Prettier

---

## ✨ Features

### 📖 Blogging System  
- 📝 Create and manage blog posts with rich text editor  
- 🗂️ Categories for Food, Travel, Lifestyle, and Technology  
- 🔍 Search and filter articles by title, content, and tags  
- 💬 Comment system for reader engagement  
- 📊 Article view tracking and analytics  

### 🎨 UI/UX  
- 🖥️ Modern, clean design with TailwindCSS + Shadcn UI  
- 📱 Fully responsive layout for all devices  
- ⚡ Smooth animations and interactive elements  
- 🎯 Category-specific color coding and themes  
- 🌙 Optimized reading experience with typography focus  

### 🔧 Content Management  
- 🗃️ Supabase PostgreSQL for reliable data persistence  
- 🔄 RESTful API with Express.js backend  
- 👨‍💻 Admin panel for CRUD operations  
- 📝 Draft system with preview functionality  
- 🖼️ Image upload and media management  

---

## 🚀 Getting Started  

### Prerequisites
- Node.js 18+ and npm  
- Supabase account  

### Clone the repository  
```bash
git clone https://github.com/windme2/windspace.git
cd windspace
```

### Install dependencies
```bash
# Install all dependencies for both client and server
npm run setup

# Or install manually
cd client && npm install
cd ../server && npm install
```

### Environment Configuration
Create `.env` files in both client and server directories:

**Client (.env.local):**
```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your-supabase-url (optional)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key (optional)
```

**Server (.env):**
```env
PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=your-supabase-url (optional)
SUPABASE_SERVICE_KEY=your-supabase-service-key (optional)
```

### Start development server
```bash
# Start both client and server concurrently
npm run dev

# Or start individually
npm run client:dev  # Frontend at http://localhost:5173
npm run server:dev  # Backend at http://localhost:8080
```

### Build for production
```bash
npm run build        # Build both client and server
npm run client:build # Build frontend only
npm run server:build # Build backend only
```

---

## 🔧 Configuration

| File | Description |
|------|-------------|
| `vite.config.ts` | ⚡ Vite bundler configuration |
| `tailwind.config.ts` | 🎨 TailwindCSS customization |
| `tsconfig.json` | 📘 TypeScript compiler options |
| `eslint.config.js` | 🔍 ESLint code quality rules |
| `components.json` | 🧩 Shadcn UI component configuration |

---

## 🌐 API Endpoints

```bash
# Articles
GET /api/articles              # Get all published articles
GET /api/articles?category=X   # Get articles by category
GET /api/articles/:slug        # Get single article by slug
POST /api/articles             # Create new article (admin)
PUT /api/articles/:id          # Update article (admin)
DELETE /api/articles/:id       # Delete article (admin)

# Categories  
GET /api/categories            # Get all categories
GET /api/categories/:slug      # Get category by slug

# Health Check
GET /health                    # Server health status
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.