# 🧠 NeuralCAD - Text-to-CAD Generator

> **Transform natural language into professional 3D CAD models instantly**

[![Made with React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![FreeCAD](https://img.shields.io/badge/FreeCAD-1.0-red?logo=freecad)](https://www.freecadweb.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5--flash-4285F4?logo=google)](https://ai.google.dev)

![NeuralCAD Demo](./demo.gif)

---

## ✨ Features

- 🗣️ **Natural Language Input** - Describe parts in plain English
- 🤖 **AI-Powered Parsing** - Google Gemini understands complex prompts
- 🔧 **FreeCAD Integration** - Professional CAD kernel for accuracy
- 📦 **Multi-Format Export** - STL, STEP, IGES
- 🎨 **Stunning UI** - Glassmorphism design with 3D viewer
- ⚡ **Real-time Preview** - See your model instantly

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Command Bar  │  │  3D Viewer   │  │   Results Panel      │  │
│  │  (Textarea)  │  │ (Three.js)   │  │ (JSON + Downloads)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP POST /generate
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI + Python)                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      API Layer                             │  │
│  │   /generate  /validate  /health  /formats                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │SmartParser  │    │AIPoweredParser│   │CodeGenerator │       │
│  │(Regex-based)│    │(Gemini AI)    │   │(FreeCAD Code)│       │
│  └─────────────┘    └──────────────┘    └──────────────┘       │
│         │                    │                    │             │
│         └────────────────────┼────────────────────┘             │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FreeCAD Engine                          │  │
│  │   Python Script → Part Generation → Export (STL/STEP)     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **FreeCAD** 1.0 (for CAD generation)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/neuralcad.git
cd neuralcad
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set environment variable for Gemini AI (optional)
set GEMINI_API_KEY=your_api_key_here  # Windows
# export GEMINI_API_KEY=your_api_key_here  # Linux/Mac

# Start server
python main.py
```

Server runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📝 Example Prompts

| Prompt | Output |
|--------|--------|
| `50x50x10mm steel plate` | Rectangular box |
| `cylinder 30mm diameter 80mm height` | Cylinder |
| `gear with 24 teeth, 80mm diameter, 15mm thick` | Gear with teeth profile |
| `100x100x10 plate with 30mm center hole` | Plate with through-hole |
| `piston 75mm diameter 100mm height` | Piston with ring grooves |
| `tube 50mm outer diameter 40mm inner diameter 100mm height` | Hollow cylinder |

---

## 🛠️ Supported Shapes

| Shape | Keywords | Features |
|-------|----------|----------|
| **Box** | box, cube, block, plate | Length, Width, Height |
| **Cylinder** | cylinder, rod, shaft | Diameter, Height |
| **Tube** | tube, hollow cylinder, pipe | Outer/Inner diameter, Height |
| **Gear** | gear, teeth, cog | Teeth count, Diameter |
| **Piston** | piston | Diameter, Height |
| **Flange** | flange, coupling | Diameter, Length |
| **Crankshaft** | crankshaft, crank | Length |
| **Sphere** | sphere, ball | Radius |
| **Cone** | cone, taper | Radius, Height |

---

## 📁 Project Structure

```
neuralcad/
├── backend/
│   ├── main.py          # FastAPI server + parsers
│   ├── outputs/         # Generated STL/STEP files
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   └── index.css    # Styling
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI parsing | Optional |

### FreeCAD Paths

The backend auto-detects FreeCAD in standard locations:
- `C:\Program Files\FreeCAD 1.0\bin\FreeCADCmd.exe`
- `/usr/bin/freecadcmd`
- `/Applications/FreeCAD.app/Contents/MacOS/FreeCAD`

---

## 📊 API Reference

### `POST /generate`

Generate a 3D model from text prompt.

**Request:**
```json
{
  "text": "50x50x10mm steel plate",
  "useai": false,
  "export_formats": ["stl"]
}
```

**Response:** Binary STL file

### `POST /validate`

Validate and parse a prompt without generating.

**Request:**
```json
{
  "text": "cylinder 30mm diameter"
}
```

**Response:**
```json
{
  "valid": true,
  "shape": "cylinder",
  "dimensions": {"diameter": 30.0, "radius": 15.0},
  "features": {"holes": 0, "fillets": 0}
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-shape`
3. Commit changes: `git commit -m 'Add new shape'`
4. Push: `git push origin feature/new-shape`
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this for your portfolio!

---

## 👨‍💻 Author

**S. Yoga Vignesh**  
Mechanical Engineering Student | Full-Stack Developer  
[Portfolio](https://yogavignesh.me) | [GitHub](https://github.com/yogavignesh)

---

<p align="center">
  Built with ❤️ for the intersection of AI and Engineering
</p>
