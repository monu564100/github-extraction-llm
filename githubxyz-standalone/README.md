# GitHubXYZ - Auto GitHub Repository Analyzer

Standalone website for `githubxyz.com` domain that automatically analyzes any GitHub repository.

## 🚀 How It Works

Users simply replace `github.com` with `githubxyz.com` in any repository URL:

```
github.com/monu564100/jobscraper-api
         ↓
githubxyz.com/monu564100/jobscraper-api
```

When they press Enter, the site:
1. ✅ Shows animated black hole loader
2. ✅ Displays progress messages ("Validating...", "Cloning...", "Analyzing...", "Generating...")
3. ✅ Automatically analyzes the repository
4. ✅ Auto-downloads the architecture README.md

## 📁 Files

- `index.html` - Single-page application (no build needed!)
- `README.md` - This file

## 🛠️ Deployment Options

### Option 1: Netlify (Recommended)

1. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Deploy
   cd githubxyz-standalone
   netlify deploy --prod
   ```

2. **Configure Domain:**
   - Go to Netlify Dashboard → Domain Settings
   - Add custom domain: `githubxyz.com`
   - Update DNS records as instructed

3. **Add Redirects (create `_redirects` file):**
   ```
   /*    /index.html   200
   ```

### Option 2: Vercel

1. **Deploy:**
   ```bash
   npm install -g vercel
   cd githubxyz-standalone
   vercel --prod
   ```

2. **Add domain in Vercel dashboard**

### Option 3: Cloudflare Pages

1. Connect GitHub repo
2. Build command: (none needed)
3. Output directory: `.`
4. Add domain in settings

### Option 4: GitHub Pages

1. Create repo: `monu564100/githubxyz`
2. Upload `index.html`
3. Enable GitHub Pages
4. Add CNAME file with `githubxyz.com`

## ⚙️ Backend Configuration

The HTML file connects to `http://localhost:8002` by default. Update these lines for production:

```javascript
// Line 292 - Change to your backend URL
const response = await fetch('https://your-backend-api.com/api/analyze', {

// Line 324 - Change download URL
window.location.href = `https://your-backend-api.com/api/download/${downloadId}`;
```

## 🔧 Backend Deployment

Deploy your `git_back` folder to a server:

### Deploy to Render.com

1. Push `git_back` to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
6. Add environment variables:
   - `GEMINI_API_KEY=your_key`
   - `GEMINI_MODEL=gemini-2.5-flash`
   - `PORT=8002`

### Deploy to Railway

1. Click "Deploy on Railway"
2. Connect GitHub repo (git_back folder)
3. Add environment variables
4. Deploy!

### Deploy to Your VPS (160.250.205.54)

```bash
# On your VPS
cd /root
git clone <your-repo>
cd git_back

# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8002

# Or use PM2 for process management
pm2 start "gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8002" --name git-analyzer
```

## 🌐 DNS Configuration

Point `githubxyz.com` to your hosting:

**For Netlify/Vercel:**
```
A     @    <provided-ip>
CNAME www  <your-site>.netlify.app
```

**For VPS:**
```
A     @    160.250.205.54
CNAME www  githubxyz.com
```

## 📱 Features

- ✅ Beautiful black hole animation
- ✅ Real-time progress updates
- ✅ Automatic repository analysis
- ✅ Auto-download README.md
- ✅ Error handling with retry
- ✅ Responsive design
- ✅ No build step needed!

## 🎯 Example Usage

1. User visits: `githubxyz.com/facebook/react`
2. Site automatically:
   - Validates the repo
   - Clones and analyzes
   - Generates architecture docs
   - Downloads README.md

## 🔒 CORS Configuration

Update your backend's CORS settings to allow `githubxyz.com`:

```python
# In git_back/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "https://githubxyz.com",
        "https://www.githubxyz.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 SEO & Meta Tags

Add these to `<head>` for better SEO:

```html
<meta name="description" content="Automatically analyze any GitHub repository - Get instant architecture documentation, security analysis, and code insights">
<meta property="og:title" content="GitHub Repository Analyzer">
<meta property="og:description" content="Replace github.com with githubxyz.com to instantly analyze any repository">
<meta property="og:type" content="website">
```

## 🚀 Quick Start (Local Testing)

1. Make sure `git_back` backend is running:
   ```bash
   cd git_back
   python run.py
   ```

2. Open `index.html` in browser or use a local server:
   ```bash
   cd githubxyz-standalone
   python -m http.server 8080
   ```

3. Visit: `http://localhost:8080/monu564100/jobscraper-api`

## 💡 Tips

- The site is a single HTML file - super easy to deploy!
- Works with any static hosting (Netlify, Vercel, GitHub Pages, S3, etc.)
- Update API URLs before deploying to production
- Test with various repos to ensure reliability

---

Made with ❤️ for automatic GitHub repository analysis
