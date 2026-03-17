# AVATAR CREATION CENTER

## Overview

The Avatar Creation Center is where users create and customize their bobblehead avatars for the platform. It supports AI-assisted generation and manual editing.

---

## Creation Flow

### Step 1: Face Scan
- Camera capture
- AI face detection
- Quality assessment
- Error handling for poor images

### Step 2: Quality Check
- Resolution check (min 512x512)
- Lighting assessment
- Face centering validation
- Glasses/accessory detection

### Step 3: AI Processing
- Style transfer to bobblehead
- Proportions adjustment
- Color palette extraction
- Expression neutralization

### Step 4: Preview
- 360° preview
- Animation preview
- Expression test
- Color variant options

### Step 5: Manual Adjustments
- Body type
- Outfit selection
- Accessories
- Color tweaks
- Name/handle

### Step 6: Save
- Asset generation
- Expression pack creation
- Animation rig setup
- Inventory creation

---

## Quality Requirements

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Resolution | 512x512 | 1024x1024 |
| Face % | 30% | 50-70% |
| Lighting | evenly lit | soft front |
| Expression | neutral | smiling |

---

## Fallback Modes

- **Low Quality**: Use template avatar
- **No Camera**: Manual builder mode
- **Processing Error**: Retry with different photo

---

## Files Reference

- `data/avatar/widget-layouts.json` - UI layouts
- `data/avatar/processing-rules.json` - Quality rules
