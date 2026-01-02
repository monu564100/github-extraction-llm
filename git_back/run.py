"""
Run script for GitHub Architecture Analyzer Backend
"""
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("=" * 60)
    print("  GitHub Architecture Analyzer Backend")
    print("=" * 60)
    print()
    print("  Analyze any public GitHub repository and generate")
    print("  comprehensive architecture documentation!")
    print()
    print("  Endpoints:")
    print("  • POST /api/analyze - Analyze GitHub repo")
    print("  • GET  /api/download/{id} - Download README.md")
    print("  • GET  /health - Health check")
    print()
    print("  Running on: http://localhost:8002")
    print("=" * 60)
    print()
    
    port = int(os.getenv("PORT", 8002))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
