# GitHubXYZ.com - GitHub Repository Analyzer

Transform any GitHub URL into detailed architecture documentation by replacing `github.com` with `githubxyz.com`!

## 🚀 How It Works

When users visit: `https://githubxyz.com/owner/repo`

The React app will:
1. Auto-detect the GitHub repository from the URL
2. Show an animated black hole loader
3. Clone and analyze the repository
4. Generate comprehensive architecture documentation
5. Auto-download the README.md file

## 📦 Project Structure

```
ai-design-buddy-main/         # Main React Frontend (deploy to githubxyz.com)
├── src/
│   ├── components/
│   │   ├── GitHubAnalyzer.tsx        # GitHub analyzer with black hole animation
│   │   ├── BlackHoleAnimation.tsx    # Black hole loader component
│   │   └── ...
│   ├── pages/
│   │   └── Index.tsx                 # Main page with URL detection
│   └── App.tsx                        # Routes: / and /:owner/:repo

backend/                      # Main Backend (port 8000) - Gemini API
data_backend/                 # Data Backend (port 8001) - Excel caching
git_back/                     # Git Backend (port 8002) - GitHub analyzer
```

## 🏗️ Deployment Steps

### 1. Deploy Git Backend (Port 8002) - Required for GitHub Analysis

**Option A: Render.com**
```bash
# In Render dashboard:
# 1. New Web Service → Connect git_back folder
# 2. Build Command: pip install -r requirements.txt
# 3. Start Command: python run.py
# 4. Environment Variables:
#    GEMINI_API_KEY=your_key
#    PORT=8002
```

**Option B: Railway/Fly.io**
```bash
cd git_back
# Add Dockerfile or use Python buildpack
# Set env: GEMINI_API_KEY=your_key
```

### 2. Deploy Other Backends (Optional for full features)

```bash
# Main Backend (port 8000) - For regular chat
cd backend
# Deploy to Render/Railway with requirements.txt

# Data Backend (port 8001) - For Excel caching  
cd data_backend
# Deploy to Render/Railway with requirements.txt
```

### 3. Deploy Frontend to Netlify/Vercel

```bash
cd ai-design-buddy-main

# Update API URLs for production
# In src/components/GitHubAnalyzer.tsx line 53 & 90:
# Change: http://localhost:8002/api/analyze
# To: https://your-git-backend.onrender.com/api/analyze

# Build for production
npm install
npm run build

# Deploy to Netlify
netlify deploy --prod

# Or deploy to Vercel
vercel --prod
```

### 4. Configure DNS

Point `githubxyz.com` to your Netlify/Vercel deployment:

**Netlify:**
```
A Record: @ → 75.2.60.5
CNAME: www → your-app.netlify.app
```

**Vercel:**
```
A Record: @ → 76.76.21.21
CNAME: www → cname.vercel-dns.com
```

### 5. Update CORS in Git Backend

```python
# In git_back/main.py line 15-16:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "https://githubxyz.com",        # Add your domain
        "https://www.githubxyz.com"     # Add www subdomain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Test Locally

```bash
# Terminal 1 - Git Backend
cd git_back
python run.py

# Terminal 2 - Frontend
cd ai-design-buddy-main
npm run dev

# Test URLs:
# http://localhost:5173/                     # Home page
# http://localhost:5173/monu564100/jobscraper-api  # Auto-analyze
```

## 🎯 User Experience

1. User visits GitHub: `https://github.com/facebook/react`
2. User changes to: `https://githubxyz.com/facebook/react`
3. Website shows black hole animation with progress (0-100%)
4. Analysis completes → Auto-downloads `ARCHITECTURE.md`
5. Success screen with "Download Again" button

## 🔧 Production Environment Variables

```bash
# Git Backend (git_back)
GEMINI_API_KEY=your_gemini_api_key
PORT=8002

# Main Backend (backend)
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=your_redis_url
PORT=8000

# Data Backend (data_backend)
STORAGE_TYPE=database  # or excel
DATABASE_URL=postgresql://...  # if using database
PORT=8001
```

## 📱 Features

- ✅ Auto-detect GitHub repo from URL
- ✅ Animated black hole loader
- ✅ Real-time progress tracking (0-100%)
- ✅ Comprehensive architecture analysis
- ✅ Auto-download README.md
- ✅ Security vulnerability scanning
- ✅ Code smell detection
- ✅ Performance optimization tips
- ✅ Excel caching for repeated queries
- ✅ Multiple categories (architecture, ui, database, api, prompts, github, recents)

## 🚨 Important Notes

- Only public GitHub repositories are supported
- Private repos require authentication (not implemented)
- Analysis takes 30-60 seconds depending on repo size
- Gemini API has rate limits (check your quota)
- Excel caching only works on single-instance deployments (use database for multi-instance)

## 📞 Support

For issues or questions, check the git_back backend logs:
```bash
cd git_back
python run.py
# Check terminal output for errors
```

## 🎉 Ready to Deploy!

Your GitHubXYZ.com website is ready. Deploy and share your domain!
