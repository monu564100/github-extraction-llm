from typing import Optional, List
import json
from app.services.llm import llm_service
from app.models.schemas import UIResearchResponse, ColorPalette, FontRecommendation, UIInspiration
from app.knowledge.ui_knowledge import UI_INSPIRATIONS, INDUSTRY_PALETTES, FONT_PAIRINGS

UI_RESEARCH_SYSTEM_PROMPT = """You are a world-class UI/UX designer with 15+ years of experience at companies like Apple, Airbnb, and Stripe.

## YOUR MISSION
Provide CLEAR, ACTIONABLE UI/UX recommendations. Focus on what designers actually need.

## RESPONSE FORMAT (JSON)
Return a valid JSON object with detailed "analysis" in markdown format.

{
  "analysis": "YOUR MARKDOWN ANALYSIS HERE",
  "color_palettes": [...],
  "fonts": {...},
  "inspirations": [...],
  "design_principles": [...],
  "image_suggestions": [...]
}

## ANALYSIS SECTION FORMAT (Use this structure in markdown)

# 🎯 Design Strategy
Brief overview of the recommended approach.

---

# 🎨 Color System

## Primary Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #xxx | Buttons, links |
| Secondary | #xxx | Backgrounds |
| Accent | #xxx | Highlights |

## Color Psychology
- Why these colors work for this use case
- Emotional associations

---

# 🔤 Typography

## Font Pairing
- **Headings:** [Font Name] - why
- **Body:** [Font Name] - why

## Type Scale
| Element | Size | Weight |
|---------|------|--------|
| H1 | 48px | Bold |
| H2 | 32px | Semibold |
| Body | 16px | Regular |

---

# 🧩 Key Components

## Buttons
- Primary: Filled, rounded corners
- Secondary: Outlined
- Size: 44px minimum touch target

## Cards
- Shadow: subtle (0 2px 8px rgba)
- Border radius: 8-12px
- Padding: 16-24px

## Forms
- Input height: 44px
- Label position: above
- Error states: red border + message

---

# 📱 Layout Guidelines

## Grid System
- Container: max-width 1200px
- Columns: 12
- Gutter: 24px

## Spacing Scale
4px → 8px → 16px → 24px → 32px → 48px → 64px

## Breakpoints
| Device | Width |
|--------|-------|
| Mobile | <640px |
| Tablet | 640-1024px |
| Desktop | >1024px |

---

# ✨ Interactions

## Hover States
- Buttons: darken 10%
- Cards: subtle shadow lift

## Transitions
- Duration: 150-200ms
- Easing: ease-out

---

# 🌟 Top 3 Inspirations
1. **[Platform]** - Why it's relevant
2. **[Platform]** - Key feature to learn from
3. **[Platform]** - Design pattern to use

---

# ✅ Quick Implementation Checklist
- [ ] Set up color variables
- [ ] Install fonts
- [ ] Create base components
- [ ] Build page layouts
- [ ] Add interactions

## JSON REQUIREMENTS

### color_palettes (2 palettes)
```json
{
  "primary": "#hex",
  "secondary": "#hex",
  "accent": "#hex",
  "background": "#hex",
  "text": "#hex",
  "additional": ["#hex", "#hex"]
}
```

### fonts
```json
{
  "heading": "Font Name",
  "body": "Font Name",
  "fallbacks": ["system-ui", "sans-serif"]
}
```

### inspirations (3-5)
```json
{
  "platform_name": "Name",
  "description": "2-3 sentences",
  "key_features": ["feature1", "feature2"],
  "url": "https://..."
}
```

### design_principles (5-7 actionable items)
### image_suggestions (5-7 specific recommendations)

## QUALITY RULES
- Be SPECIFIC - no generic advice
- Include real hex codes
- Real font names (Google Fonts)
- Practical, implementable recommendations
- Maximum 800 words in analysis"""


class UIResearchAgent:
    def __init__(self):
        pass
    
    async def research(self, prompt: str, industry: Optional[str] = None) -> UIResearchResponse:
        context = self._build_context(prompt, industry)
        
        full_prompt = f"""
User Request: {prompt}

Industry: {industry or "Not specified"}

Reference Information:
{context}

Research and recommend UI design elements for this project. Consider:
1. Similar successful platforms in this space
2. Color psychology relevant to the industry/use case
3. Typography that enhances the user experience
4. Image styles that would resonate with the target audience
5. Key design principles to follow

Provide your response in the specified JSON format.
"""
        
        response = await llm_service.generate(
            prompt=full_prompt,
            system_prompt=UI_RESEARCH_SYSTEM_PROMPT,
        )
        
        return self._parse_response(response)
    
    def _build_context(self, prompt: str, industry: Optional[str]) -> str:
        context_parts = []
        
        prompt_lower = prompt.lower()
        for key, inspiration in UI_INSPIRATIONS.items():
            if any(keyword in prompt_lower for keyword in inspiration.get("keywords", [])):
                context_parts.append(f"Reference Platform - {inspiration['name']}:\n{inspiration['description']}")
        
        if industry and industry.lower() in INDUSTRY_PALETTES:
            palette_info = INDUSTRY_PALETTES[industry.lower()]
            context_parts.append(f"Industry Color Psychology ({industry}):\n{json.dumps(palette_info, indent=2)}")
        
        for key, fonts in FONT_PAIRINGS.items():
            if key in prompt_lower:
                context_parts.append(f"Recommended Font Pairing for {key}:\n{json.dumps(fonts, indent=2)}")
        
        return "\n\n".join(context_parts) if context_parts else "No specific references found."
    
    def _parse_response(self, response: str) -> UIResearchResponse:
        try:
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                data = json.loads(json_str)
                
                color_palettes = [
                    ColorPalette(**palette) for palette in data.get("color_palettes", [])
                ]
                
                fonts_data = data.get("fonts", {})
                fonts = FontRecommendation(
                    heading=fonts_data.get("heading", "Inter"),
                    body=fonts_data.get("body", "Inter"),
                    accent=fonts_data.get("accent"),
                    fallbacks=fonts_data.get("fallbacks", ["system-ui", "sans-serif"]),
                )
                
                inspirations = [
                    UIInspiration(**insp) for insp in data.get("inspirations", [])
                ]
                
                return UIResearchResponse(
                    content=data.get("analysis", response),
                    color_palettes=color_palettes or [self._default_palette()],
                    fonts=fonts,
                    inspirations=inspirations,
                    design_principles=data.get("design_principles", []),
                    image_suggestions=data.get("image_suggestions", []),
                )
        except (json.JSONDecodeError, KeyError, TypeError):
            pass
        
        return UIResearchResponse(
            content=response,
            color_palettes=[self._default_palette()],
            fonts=FontRecommendation(
                heading="Inter",
                body="Inter",
                fallbacks=["system-ui", "sans-serif"],
            ),
            inspirations=[],
            design_principles=[],
            image_suggestions=[],
        )
    
    def _default_palette(self) -> ColorPalette:
        return ColorPalette(
            primary="#6366f1",
            secondary="#8b5cf6",
            accent="#06b6d4",
            background="#0a0a0b",
            text="#f5f5f5",
            additional=["#10b981", "#f59e0b"],
        )
