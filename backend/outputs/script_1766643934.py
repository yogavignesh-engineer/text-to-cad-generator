import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument:
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# BASE BOX
base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 50.0
doc.recompute()
print(f"[FREECAD] Box {base.Length}x{base.Width}x{base.Height}mm")

# EXPORT TO STL
import Mesh
output_path = r"C:\portfolio\text to cad\backend\outputs\1766643934.stl"

if doc.Objects:
    print("[FREECAD] Exporting to STL...")
    try:
        Mesh.export([base], output_path)
        print(f"[FREECAD] SUCCESS! STL exported: {output_path}")
        print(f"[FREECAD] File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"[FREECAD] Export failed: {e}")
        sys.exit(1)
else:
    print("[FREECAD] No objects to export")
    sys.exit(1)
