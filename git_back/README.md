# GitHub Architecture Analyzer Backend

Automatically analyze any public GitHub repository and generate comprehensive architecture documentation using AI.

## 🚀 Features

- **Automatic Repository Analysis**: Clone and analyze any public GitHub repo
- **AI-Powered Documentation**: Uses Google Gemini to generate detailed architecture docs
- **Comprehensive Coverage**: Analyzes code structure, tech stack, design patterns, and more
- **Easy Download**: Download generated documentation as Markdown file

## 📋 Prerequisites

- Python 3.8+
- Git installed on your system
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd git_back
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Edit `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the backend:**
   ```bash
   python run.py
   ```

   The server will start on `http://localhost:8002`

## 📡 API Endpoints

### 1. Analyze Repository
**POST** `/api/analyze`

Analyze a GitHub repository and generate architecture documentation.

**Request Body:**
```json
{
  "github_url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "success": true,
  "readme_content": "# Architecture Documentation...",
  "repo_name": "owner/repo",
  "download_id": "owner_repo",
  "message": "Architecture documentation generated successfully"
}
```

### 2. Download Documentation
**GET** `/api/download/{download_id}`

Download the generated architecture documentation as a Markdown file.

**Example:**
```
GET http://localhost:8002/api/download/owner_repo
```

### 3. Health Check
**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "git_back",
  "gemini_configured": true
}
```

## 🎯 Usage Example

### Using cURL:

```bash
# 1. Analyze a repository
curl -X POST http://localhost:8002/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/facebook/react"}'

# 2. Download the documentation
curl -O http://localhost:8002/api/download/facebook_react
```

### Using Python:

```python
import requests

# Analyze repository
response = requests.post(
    "http://localhost:8002/api/analyze",
    json={"github_url": "https://github.com/facebook/react"}
)

data = response.json()
print(f"Success: {data['success']}")
print(f"Download ID: {data['download_id']}")

# Download documentation
download_url = f"http://localhost:8002/api/download/{data['download_id']}"
doc_response = requests.get(download_url)

with open("ARCHITECTURE.md", "wb") as f:
    f.write(doc_response.content)
```

## 📝 What Gets Analyzed

The analyzer examines:

- ✅ **Technology Stack**: Languages, frameworks, libraries
- ✅ **Project Structure**: Directory layout and organization
- ✅ **Code Patterns**: Design patterns and architectural decisions
- ✅ **Configuration Files**: package.json, requirements.txt, etc.
- ✅ **Database Design**: Schema and data models (if identifiable)
- ✅ **API Design**: Endpoints and communication patterns
- ✅ **Security**: Authentication and security practices
- ✅ **Scalability**: Performance and scaling considerations

## 🔒 Security Notes

- Only works with **public** GitHub repositories
- Uses shallow clone (`--depth 1`) for faster processing
- Temporary files are stored in system temp directory
- API key should never be committed to version control

## 🚨 Limitations

- Repository must be public
- Very large repositories (>10,000 files) may take longer to process
- Generated documentation quality depends on code clarity and documentation
- Git must be installed and available in system PATH

## 📦 Dependencies

- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Google Generative AI**: Gemini API client
- **GitPython**: Git operations (optional alternative to subprocess)
- **Pydantic**: Data validation

## 🔧 Configuration

Edit `.env` file to configure:

```env
# Server port
PORT=8002

# CORS origins (for frontend integration)
CORS_ORIGINS=http://localhost:8080,http://localhost:5173

# Gemini API
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Environment
ENVIRONMENT=development
DEBUG=true
```

## 🐛 Troubleshooting

**"Git clone failed"**
- Ensure Git is installed: `git --version`
- Check if repository URL is correct and public
- Verify internet connection

**"Empty response from Gemini"**
- Check if your Gemini API key is valid
- Ensure you have API quota remaining
- Try with a different model (e.g., gemini-1.5-pro)

**"Failed to analyze repository"**
- Repository might be too large
- Check server logs for detailed error messages

## 📄 License

This project is part of the AI Design Buddy system.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- Add appropriate error handling
- Update documentation for new features

---

Made with ❤️ using FastAPI and Google Gemini AI
