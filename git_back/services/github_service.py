import os
import shutil
import tempfile
import stat
from pathlib import Path
from typing import Dict, List, Any
import subprocess
import logging
import re

logger = logging.getLogger(__name__)


class GitHubService:
    """Service for cloning and analyzing GitHub repositories"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "git_analyzer"
        self.temp_dir.mkdir(exist_ok=True)
        
        # File extensions to analyze
        self.code_extensions = {
            '.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.h', '.hpp',
            '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.r',
            '.sql', '.sh', '.bash', '.yaml', '.yml', '.json', '.xml', '.html', '.css',
            '.scss', '.sass', '.vue', '.svelte', '.dart', '.lua', '.perl', '.groovy'
        }
        
        # Important files to read completely
        self.important_files = {
            'README.md', 'package.json', 'requirements.txt', 'Cargo.toml', 
            'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'go.mod',
            'Dockerfile', 'docker-compose.yml', '.gitignore'
        }
    
    def _validate_github_url(self, url: str) -> Dict[str, str]:
        """
        Validate and parse GitHub URL
        
        Returns:
            Dict with owner and repo name
        """
        # Support multiple GitHub URL formats
        patterns = [
            r'github\.com[:/]([^/]+)/([^/\.]+)',  # https://github.com/owner/repo or git@github.com:owner/repo
            r'github\.com/([^/]+)/([^/]+)\.git',  # https://github.com/owner/repo.git
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                owner, repo = match.groups()
                repo = repo.replace('.git', '')
                return {
                    "owner": owner,
                    "repo": repo,
                    "full_name": f"{owner}/{repo}"
                }
        
        raise ValueError(f"Invalid GitHub URL format: {url}")
    
    async def clone_and_analyze(self, github_url: str) -> Dict[str, Any]:
        """
        Clone a GitHub repository and analyze its structure
        
        Args:
            github_url: Public GitHub repository URL
            
        Returns:
            Dictionary with repository analysis
        """
        # Validate URL
        repo_info = self._validate_github_url(github_url)
        logger.info(f"Validated repository: {repo_info['full_name']}")
        
        # Create unique directory for this repo
        repo_dir = self.temp_dir / repo_info['repo']
        
        # Remove if exists (Windows-safe deletion)
        if repo_dir.exists():
            try:
                shutil.rmtree(repo_dir, ignore_errors=False, onerror=self._handle_remove_readonly)
            except Exception as e:
                logger.warning(f"Could not fully clean old directory: {e}")
                # Try alternative: rename and delete later
                import uuid
                backup_dir = self.temp_dir / f"{repo_info['repo']}_old_{uuid.uuid4().hex[:8]}"
                try:
                    repo_dir.rename(backup_dir)
                except:
                    pass
        
        try:
            # Clone repository
            logger.info(f"Cloning {github_url}...")
            subprocess.run(
                ['git', 'clone', '--depth', '1', github_url, str(repo_dir)],
                check=True,
                capture_output=True,
                text=True
            )
            logger.info("✓ Repository cloned successfully")
            
            # Analyze repository
            analysis = self._analyze_repository(repo_dir, repo_info)
            
            return analysis
            
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr if e.stderr else str(e)
            logger.error(f"Git clone failed: {error_msg}")
            raise ValueError(f"Failed to clone repository. Make sure the URL is correct and the repository is public. Error: {error_msg}")
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
    
    def _analyze_repository(self, repo_dir: Path, repo_info: Dict) -> Dict[str, Any]:
        """
        Analyze repository structure and content
        
        Returns:
            Comprehensive repository analysis
        """
        logger.info("Analyzing repository structure...")
        
        analysis = {
            "repo_name": repo_info['full_name'],
            "repo_url": f"https://github.com/{repo_info['full_name']}",
            "directory_structure": {},
            "languages": set(),
            "frameworks": set(),
            "important_files": {},
            "file_count": 0,
            "total_lines": 0,
            "code_snippets": {}
        }
        
        # Walk through repository
        for root, dirs, files in os.walk(repo_dir):
            # Skip .git and node_modules
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', '.venv', 'dist', 'build']]
            
            rel_path = Path(root).relative_to(repo_dir)
            
            for file in files:
                file_path = Path(root) / file
                rel_file_path = file_path.relative_to(repo_dir)
                
                # Count files
                analysis['file_count'] += 1
                
                # Check file extension
                extension = file_path.suffix.lower()
                if extension in self.code_extensions:
                    # Detect language
                    language = self._detect_language(extension)
                    if language:
                        analysis['languages'].add(language)
                
                # Read important files
                if file in self.important_files:
                    try:
                        content = file_path.read_text(encoding='utf-8', errors='ignore')
                        analysis['important_files'][file] = content
                        
                        # Detect frameworks
                        frameworks = self._detect_frameworks(file, content)
                        analysis['frameworks'].update(frameworks)
                    except Exception as e:
                        logger.warning(f"Could not read {file}: {e}")
                
                # Sample code files (limit to 20 files with 50 lines each to prevent timeout)
                if extension in self.code_extensions and len(analysis['code_snippets']) < 20:
                    try:
                        content = file_path.read_text(encoding='utf-8', errors='ignore')
                        lines = content.split('\n')
                        analysis['total_lines'] += len(lines)
                        
                        # Store LIMITED samples to prevent timeout (first 50 lines only)
                        if str(rel_file_path) not in analysis['code_snippets']:
                            analysis['code_snippets'][str(rel_file_path)] = '\n'.join(lines[:50])
                    except Exception:
                        pass
        
        # Convert sets to lists for JSON serialization
        analysis['languages'] = list(analysis['languages'])
        analysis['frameworks'] = list(analysis['frameworks'])
        
        logger.info(f"✓ Analysis complete:")
        logger.info(f"  - Files: {analysis['file_count']}")
        logger.info(f"  - Lines: {analysis['total_lines']}")
        logger.info(f"  - Languages: {', '.join(analysis['languages'])}")
        logger.info(f"  - Frameworks: {', '.join(analysis['frameworks'])}")
        
        return analysis
    
    def _detect_language(self, extension: str) -> str:
        """Detect programming language from file extension"""
        language_map = {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript',
            '.jsx': 'JavaScript',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.go': 'Go',
            '.rs': 'Rust',
            '.rb': 'Ruby',
            '.php': 'PHP',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.scala': 'Scala',
            '.r': 'R',
            '.dart': 'Dart',
            '.lua': 'Lua'
        }
        return language_map.get(extension, '')
    
    def _handle_remove_readonly(self, func, path, exc):
        """
        Error handler for Windows readonly file deletion issues
        """
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except Exception as e:
            logger.warning(f"Could not remove {path}: {e}")
    
    def _detect_frameworks(self, filename: str, content: str) -> set:
        """Detect frameworks and libraries from file content"""
        frameworks = set()
        
        if filename == 'package.json':
            # JavaScript/TypeScript frameworks
            if 'react' in content.lower():
                frameworks.add('React')
            if 'vue' in content.lower():
                frameworks.add('Vue.js')
            if 'angular' in content.lower():
                frameworks.add('Angular')
            if 'next' in content.lower():
                frameworks.add('Next.js')
            if 'express' in content.lower():
                frameworks.add('Express.js')
            if 'nestjs' in content.lower():
                frameworks.add('NestJS')
        
        elif filename == 'requirements.txt':
            # Python frameworks
            content_lower = content.lower()
            if 'django' in content_lower:
                frameworks.add('Django')
            if 'flask' in content_lower:
                frameworks.add('Flask')
            if 'fastapi' in content_lower:
                frameworks.add('FastAPI')
            if 'tensorflow' in content_lower:
                frameworks.add('TensorFlow')
            if 'pytorch' in content_lower:
                frameworks.add('PyTorch')
            if 'numpy' in content_lower:
                frameworks.add('NumPy')
            if 'pandas' in content_lower:
                frameworks.add('Pandas')
        
        elif filename == 'pom.xml':
            # Java frameworks
            if 'spring' in content.lower():
                frameworks.add('Spring Boot')
        
        elif filename == 'Gemfile':
            # Ruby frameworks
            if 'rails' in content.lower():
                frameworks.add('Ruby on Rails')
        
        elif filename == 'Cargo.toml':
            # Rust frameworks
            if 'actix' in content.lower():
                frameworks.add('Actix')
            if 'rocket' in content.lower():
                frameworks.add('Rocket')
        
        return frameworks
