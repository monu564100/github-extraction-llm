"""
GitHub Repository Architecture Analyzer Backend
Analyzes GitHub repositories and generates detailed architecture documentation
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, HttpUrl
import logging
import os
from pathlib import Path

from services.github_service import GitHubService
from services.architecture_generator import ArchitectureGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="GitHub Architecture Analyzer",
    description="Analyze GitHub repositories and generate architecture documentation",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
github_service = GitHubService()
architecture_generator = ArchitectureGenerator()

# Store generated documentation temporarily
generated_docs = {}


class AnalyzeRequest(BaseModel):
    """Request model for repository analysis"""
    github_url: str
    

class AnalyzeResponse(BaseModel):
    """Response model for repository analysis"""
    success: bool
    readme_content: str
    repo_name: str
    download_id: str
    message: str = ""


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("=" * 60)
    logger.info("Starting GitHub Architecture Analyzer Backend")
    logger.info("=" * 60)
    logger.info("✓ FastAPI initialized")
    logger.info("✓ GitHub service ready")
    logger.info("✓ Architecture generator ready")
    logger.info("=" * 60)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "GitHub Architecture Analyzer",
        "status": "running",
        "endpoints": {
            "analyze": "POST /api/analyze",
            "download": "GET /api/download/{download_id}",
            "health": "GET /health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "git_back",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_repository(request: AnalyzeRequest):
    """
    Analyze a GitHub repository and generate architecture documentation
    
    Args:
        request: Contains GitHub repository URL
        
    Returns:
        Generated README content and download ID
    """
    try:
        logger.info(f"🔍 Analyzing repository: {request.github_url}")
        
        # Step 1: Clone and analyze repository
        logger.info("📥 Cloning repository...")
        repo_data = await github_service.clone_and_analyze(request.github_url)
        
        logger.info(f"✓ Repository cloned: {repo_data['repo_name']}")
        logger.info(f"  - Files: {repo_data['file_count']}")
        logger.info(f"  - Languages: {', '.join(repo_data['languages'])}")
        
        # Step 2: Generate architecture documentation
        logger.info("🤖 Generating architecture documentation with Gemini...")
        readme_content = await architecture_generator.generate_architecture(repo_data)
        
        logger.info("✓ Architecture documentation generated")
        
        # Step 3: Store for download
        download_id = repo_data['repo_name'].replace('/', '_')
        generated_docs[download_id] = {
            "content": readme_content,
            "repo_name": repo_data['repo_name'],
            "filename": f"{download_id}_ARCHITECTURE.md"
        }
        
        return AnalyzeResponse(
            success=True,
            readme_content=readme_content,
            repo_name=repo_data['repo_name'],
            download_id=download_id,
            message="Architecture documentation generated successfully"
        )
        
    except ValueError as e:
        logger.error(f"❌ Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Error analyzing repository: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze repository: {str(e)}")


@app.get("/api/download/{download_id}")
async def download_readme(download_id: str):
    """
    Download the generated architecture README
    
    Args:
        download_id: Unique identifier for the generated documentation
        
    Returns:
        Markdown file download
    """
    try:
        if download_id not in generated_docs:
            raise HTTPException(status_code=404, detail="Documentation not found. Please analyze the repository first.")
        
        doc_data = generated_docs[download_id]
        
        # Create temporary file
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / doc_data["filename"]
        
        # Write content to file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(doc_data["content"])
        
        logger.info(f"📥 Downloading: {doc_data['filename']}")
        
        return FileResponse(
            path=str(file_path),
            filename=doc_data["filename"],
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{doc_data["filename"]}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
