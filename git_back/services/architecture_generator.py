"""
Architecture Generator - Uses Gemini AI to generate architecture documentation
"""
import os
import logging
from typing import Dict, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)


class ArchitectureGenerator:
    """Generate comprehensive architecture documentation using Gemini AI"""
    
    def __init__(self):
        """Initialize Gemini AI"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        
        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"),
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,  # Reduced to prevent timeout
            }
        )
        
        logger.info("✓ Gemini AI initialized")
    
    async def generate_architecture(self, repo_data: Dict[str, Any]) -> str:
        """
        Generate comprehensive architecture documentation
        
        Args:
            repo_data: Repository analysis data
            
        Returns:
            Markdown formatted architecture documentation
        """
        logger.info("Generating architecture documentation...")
        
        # Build comprehensive prompt
        prompt = self._build_prompt(repo_data)
        
        # Retry logic for timeout
        max_retries = 2
        readme_content = ""
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Generation attempt {attempt + 1}/{max_retries}...")
                
                # Generate with Gemini (with built-in timeout)
                response = self.model.generate_content(prompt)
                
                if not response or not response.text:
                    raise ValueError("Empty response from Gemini")
                
                readme_content = response.text
                break  # Success, exit retry loop
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying...")
                    continue
                else:
                    # Last attempt failed
                    logger.error(f"Failed to generate documentation: {str(e)}")
                    raise ValueError(f"AI generation failed: {str(e)}")
        
        # Add metadata header
        header = f"""# {repo_data['repo_name']} - Architecture Documentation

**Repository:** {repo_data['repo_url']}  
**Generated:** {self._get_timestamp()}  
**Analysis:** Auto-generated using AI

---

"""
        
        return header + readme_content
    
    def _build_prompt(self, repo_data: Dict[str, Any]) -> str:
        """Build comprehensive prompt for architecture generation"""
        
        # Prepare code samples (LIMITED to prevent timeout)
        code_samples = ""
        if repo_data.get('code_snippets'):
            code_samples = "\n\n**Sample Code Files (Top 5):**\n"
            # Only include 5 most important files with limited content
            for file_path, content in list(repo_data['code_snippets'].items())[:5]:
                code_samples += f"\n`{file_path}`:\n```\n{content[:300]}\n```\n"
        
        # Prepare important files (LIMITED)
        important_content = ""
        if repo_data.get('important_files'):
            important_content = "\n\n**Key Configuration Files:**\n"
            for filename, content in list(repo_data['important_files'].items())[:3]:  # Only top 3
                important_content += f"\n`{filename}`:\n```\n{content[:500]}\n```\n"  # Reduced to 500 chars
        
        prompt = f"""You are a senior software architect. Analyze this GitHub repository and create a comprehensive, professional architecture documentation in Markdown format.

**Repository Information:**
- Name: {repo_data['repo_name']}
- URL: {repo_data['repo_url']}
- Total Files: {repo_data['file_count']}
- Total Lines of Code: {repo_data['total_lines']}
- Programming Languages: {', '.join(repo_data['languages']) if repo_data['languages'] else 'N/A'}
- Frameworks/Libraries: {', '.join(repo_data['frameworks']) if repo_data['frameworks'] else 'N/A'}

{important_content}

{code_samples}

**Please generate a detailed architecture documentation with the following sections:**

## 📋 Table of Contents
(Create a clickable table of contents)

## 🏗️ System Architecture Overview
- High-level system design
- Architecture pattern (e.g., MVC, Microservices, Monolithic, etc.)
- Key architectural decisions
- Component interaction diagram explanation

## 🔧 Technology Stack
- Programming languages and versions
- Frameworks and libraries with versions
- Database systems
- External services/APIs
- Build tools and package managers
- Development dependencies

## 📁 Project Structure
- Complete directory layout with explanations
- Important files and their purposes
- Module organization and hierarchy
- Configuration files analysis

## 🔄 Data Flow Architecture
- Request/response flow with examples
- Data processing pipeline steps
- Communication between components
- State management approach

## 🗄️ Database Design & Data Models
- Database type (SQL/NoSQL)
- Schema design with field details
- Data models and relationships
- Indexing strategy (if visible)
- Migration approach

## 🔌 API Design & Endpoints
- All API endpoints with methods (GET, POST, etc.)
- Request/response formats with examples
- Authentication/authorization mechanisms
- Error handling approach
- Rate limiting (if any)

## 💾 State Management & Storage
- How application state is managed
- Local storage vs database
- Cache implementation
- Session management

## 🚀 Deployment Architecture
- Deployment strategy
- Infrastructure requirements
- Environment configuration
- Build and deployment steps

## 🔐 Security Analysis
- Authentication mechanisms implemented
- Authorization and access control
- Data validation and sanitization
- Security vulnerabilities found (if any)
- HTTPS/SSL implementation
- Environment variable security

## 📊 Key Components Deep Dive
- Main modules/services with code examples
- Component responsibilities in detail
- Dependencies and interactions
- Third-party integrations

## 🔮 Design Patterns & Best Practices
- Architectural patterns used (with evidence from code)
- Code organization patterns
- SOLID principles adherence
- DRY, KISS implementations
- Best practices observed or violated

## 🎯 Features & Functionality Breakdown
- Complete feature list
- User flows with technical details
- Business logic implementation
- Form validation and error handling

## ⚠️ Issues & Code Smells Detected
- **CRITICAL**: List any critical issues found
  - Security vulnerabilities
  - Hardcoded credentials or secrets
  - SQL injection risks
  - XSS vulnerabilities
  - Missing error handling
- **HIGH PRIORITY**: Important issues
  - Performance bottlenecks
  - Memory leaks potential
  - Race conditions
  - Improper error handling
  - Missing input validation
- **MEDIUM PRIORITY**: Code quality issues
  - Code duplication
  - Long methods/functions
  - Complex conditionals
  - Poor naming conventions
  - Missing documentation
- **LOW PRIORITY**: Minor improvements
  - Code style inconsistencies
  - Unused imports/variables
  - Console.log statements left in code
  - TODO/FIXME comments

## 🔧 Recommended Modifications & Improvements
1. **Architecture Improvements**
   - Suggest better architectural patterns
   - Component restructuring recommendations
   - Separation of concerns improvements

2. **Code Quality Enhancements**
   - Refactoring suggestions with examples
   - Performance optimization opportunities
   - Error handling improvements

3. **Security Hardening**
   - Security fixes needed
   - Best practices to implement
   - Vulnerability patches

4. **Testing & Documentation**
   - Missing test coverage areas
   - Documentation gaps
   - Code comments needed

5. **Scalability Enhancements**
   - Caching strategies to add
   - Database optimization suggestions
   - Load balancing recommendations

6. **DevOps Improvements**
   - CI/CD pipeline suggestions
   - Monitoring and logging needs
   - Container/orchestration recommendations

## 📈 Scalability & Performance Analysis
- Current scalability limitations
- Performance bottlenecks identified
- Optimization opportunities
- Caching strategies (implemented or recommended)
- Database query optimization needs

## 🧪 Testing Strategy
- Test coverage analysis
- Testing approach (unit, integration, e2e)
- Missing test scenarios
- Test framework used

## 🛠️ Development Setup
- Prerequisites with versions
- Step-by-step installation
- Configuration requirements
- Common setup issues

## 📝 Code Quality Metrics
- Code complexity assessment
- Maintainability score (estimate)
- Technical debt areas
- Documentation quality

## 🔄 CI/CD & DevOps
- Build process analysis
- Testing automation status
- Deployment pipeline (if identifiable)
- Monitoring and logging setup

## 📚 Summary & Final Recommendations
- Overall architecture rating (1-10)
- Top 3 strengths
- Top 5 areas needing improvement
- Priority action items
- Long-term roadmap suggestions

---

**IMPORTANT INSTRUCTIONS:**
1. **Be a Critical Analyzer**: Don't just describe - actively look for issues, bugs, security problems, and improvement opportunities
2. **Evidence-Based Analysis**: Reference actual code snippets when identifying issues or patterns
3. **Prioritize Issues**: Categorize findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
4. **Actionable Recommendations**: Provide specific, implementable suggestions with code examples where helpful
5. **Line-by-Line Insights**: When you find important code patterns, bugs, or optimizations, reference the specific files and explain the issue
6. **Security First**: Actively search for security vulnerabilities like:
   - Hardcoded secrets/API keys
   - SQL injection risks
   - XSS vulnerabilities
   - Insecure authentication
   - Missing input validation
   - CORS misconfigurations
7. **Performance Analysis**: Identify bottlenecks like:
   - N+1 queries
   - Missing indexes
   - Inefficient loops
   - Memory leaks
   - Blocking operations
8. **Code Quality Focus**: Point out:
   - Code duplication
   - Complex methods
   - Poor naming
   - Missing error handling
   - Tight coupling
9. Use proper Markdown formatting with headers, lists, code blocks, and tables
10. If something is not identifiable from the code, explicitly say so rather than making assumptions
11. **Be thorough and comprehensive** - this is a professional architecture audit

Generate the complete architecture audit and improvement roadmap now:
"""
        
        return prompt
    
    def _get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
