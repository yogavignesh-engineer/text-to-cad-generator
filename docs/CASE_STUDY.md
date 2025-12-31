# Building NeuralCAD: How I Built an AI-Powered Text-to-CAD System

> A deep dive into the architecture, design decisions, and challenges of creating a natural language CAD generator

**Author:** S. Yoga Vignesh  
**Date:** December 2024  
**Read time:** 10 minutes

---

## 🎯 The Problem

As a Mechanical Engineering student, I spend countless hours in CAD software creating models. The workflow is always the same:

1. Open CAD software (slow startup)
2. Navigate through menus
3. Click, drag, dimension, repeat
4. Export to STL for 3D printing

I thought: **"What if I could just *describe* what I want?"**

```
"Create a 50x50x10mm steel plate with 4 corner holes"
```

And have it appear instantly. That's the vision behind **NeuralCAD**.

---

## 🏗️ Architecture Overview

### The Tech Stack

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | React + Vite | Fast development, component-based UI |
| **Styling** | Custom CSS + Glassmorphism | Premium feel, no CSS framework bloat |
| **3D Viewer** | Three.js (STL Loader) | Industry standard for web 3D |
| **Backend** | FastAPI (Python) | Async, fast, great for AI integration |
| **AI Parser** | Google Gemini 1.5 Flash | Best cost/performance for NLP |
| **CAD Engine** | FreeCAD | Open-source, Python scriptable |

### Data Flow

```
User Input → SmartParser/AI → Structured JSON → CodeGenerator → FreeCAD → STL/STEP
```

---

## 🧠 Design Decision #1: Dual Parser Architecture

The biggest challenge was parsing natural language into CAD parameters. I implemented a **two-tier parsing system**:

### Tier 1: SmartParser (Regex-Based)

For common patterns, regex is faster and more predictable:

```python
# Example: Extracting "50x50x10"
xyz_match = re.search(r'(\d+)x(\d+)x(\d+)', prompt)

# Example: Detecting holes
hole_match = re.search(r'with\s*(\d+)mm\s*hole', prompt)
```

**Pros:**
- Instant execution (no API call)
- Predictable behavior
- Works offline

**Cons:**
- Brittle with unusual phrasing
- Lots of edge cases

### Tier 2: AIPoweredParser (Gemini)

For complex prompts, I fall back to AI:

```python
prompt_template = """
Parse this into structured JSON:
Input: {prompt}

Output JSON with base_feature, sub_features, finishing...
"""

response = model.generate_content(prompt_template)
```

**Pros:**
- Handles any natural language
- Understands context
- Self-correcting

**Cons:**
- Latency (500ms-2s)
- Costs money per request
- Occasional JSON errors

### Why Both?

The toggle switch in the UI lets users choose:
- **AI OFF**: Fast, deterministic, for structured prompts
- **AI ON**: Flexible, for conversational descriptions

---

## 🔧 Design Decision #2: FreeCAD Over Browser CAD

I considered three approaches:

| Approach | Pros | Cons |
|----------|------|------|
| **Three.js CSG** | Pure browser, no backend | Limited operations, poor accuracy |
| **OpenSCAD** | Text-based, popular | Slow, limited export formats |
| **FreeCAD** | Professional kernel, Python API | Requires installation |

I chose **FreeCAD** because:
1. **Professional accuracy** - Used in industry
2. **Python scriptable** - Easy integration
3. **Multiple exports** - STL, STEP, IGES natively
4. **Boolean operations** - Perfect for holes, cuts

### The Code Generation Pattern

Instead of using FreeCAD's GUI, I generate Python scripts:

```python
def create_box(length, width, height):
    return f"""
base = doc.addObject("Part::Box", "Base")
base.Length = {length}
base.Width = {width}
base.Height = {height}
"""
```

This script is then executed by FreeCAD headlessly:

```bash
FreeCADCmd.exe script.py
```

---

## 🎨 Design Decision #3: Glassmorphism UI

I wanted the UI to feel **premium** and **futuristic**. Glassmorphism was perfect:

```css
.panel {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}
```

Key principles:
1. **Dark mode by default** - Easier on eyes for CAD work
2. **Translucent panels** - Depth without clutter
3. **Gradient accents** - Premium feel
4. **Micro-animations** - Responsive feedback

---

## 🔄 Design Decision #4: Real-Time Preview

The 3D viewer updates as soon as the STL is generated. I used Three.js with the STL loader:

```javascript
const loader = new STLLoader();
loader.load(url, (geometry) => {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
});
```

### Challenges:
- **Center model on load** - Compute bounding box, offset camera
- **Proper lighting** - Hemisphere light + directional for depth
- **Grid reference** - Helps visualize scale

---

## 🚧 Challenges Faced

### Challenge 1: Dimension Parsing Ambiguity

How do you parse this?

```
"Create a gear with 24 teeth, 80mm diameter, 15mm thick"
```

- Is `24` the teeth count or a dimension?
- Is `15mm` thickness or height?

**Solution:** Pattern priority + word boundaries:

```python
# Teeth: only match if followed by "teeth" or "tooth"
teeth_pattern = r'(\d+)\s*teeth'

# Thickness: negative lookahead to avoid matching before "teeth"
thickness_pattern = r'(\d+)mm\s*thick(?!\s*teeth)'
```

### Challenge 2: Hole Diameter Extraction

The prompt "plate with 30mm center hole" was parsed incorrectly:
- `30mm` was being confused with other dimensions

**Solution:** Multiple regex patterns with priority:

```python
# Pattern 1: "with 30mm hole" (most specific)
# Pattern 2: "30mm center hole"
# Pattern 3: "hole of 30mm"
# Pattern 4: Default fallback
```

### Challenge 3: FreeCAD Path Detection

FreeCAD installs in different locations on different systems.

**Solution:** Auto-detection:

```python
FREECAD_PATHS = [
    os.path.join(home, "AppData", "Local", "Programs", "FreeCAD 1.0"),
    "/usr/bin/freecadcmd",
    "/Applications/FreeCAD.app/Contents/MacOS/FreeCAD"
]

for path in FREECAD_PATHS:
    if os.path.exists(path):
        return path
```

---

## 📊 Performance Metrics

| Metric | SmartParser | AI Parser |
|--------|-------------|-----------|
| Parse time | <10ms | 500-2000ms |
| Accuracy (simple) | 95% | 99% |
| Accuracy (complex) | 60% | 90% |
| Cost per request | $0 | ~$0.001 |

---

## 🚀 Future Improvements

1. **Assembly Support** - Multiple parts with constraints
2. **Parametric Editing** - "Make it 20% larger"
3. **Voice Input** - Speak to create
4. **AR Preview** - See model in real space
5. **Cloud FreeCAD** - No local installation needed

---

## 💡 Key Takeaways

1. **Hybrid AI/Rule systems work best** - AI for flexibility, rules for speed
2. **FreeCAD is underrated** - Professional CAD engine, totally free
3. **UI matters for demos** - Glassmorphism makes projects memorable
4. **Edge cases are endless** - Always test weird inputs

---

## 🎓 What I Learned

This project taught me:
- **Full-stack development** - React ↔ FastAPI ↔ FreeCAD
- **AI integration** - Prompt engineering for structured output
- **CAD automation** - Scripting 3D geometry
- **Product thinking** - What do users actually need?

---

## 📚 Resources

- [FreeCAD Python Scripting](https://wiki.freecadweb.org/Python_scripting_tutorial)
- [Google Gemini API](https://ai.google.dev/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

---

**Questions? Reach out!**  
[Portfolio](https://yogavignesh.me) | [GitHub](https://github.com/yogavignesh)
