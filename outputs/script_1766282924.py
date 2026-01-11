import FreeCAD, Part
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# Base Box
base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 20.0
print(f"[FREECAD] Created box: {base.Length}x{base.Width}x{base.Height}")


# Recompute document
doc.recompute()
print("[FREECAD] Document recomputed successfully")

# Export to STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766282924.stl"

if doc.Objects:
    print("[FREECAD] Exporting to STL...")
    try:
        # Get the last object (final result after cuts)
        final_obj = doc.Objects[-1]
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] ✓ STL exported: {output_path}")
    except Exception as e:
        print(f"[FREECAD] ✗ Export failed: {e}")
        sys.exit(1)
else:
    print("[FREECAD] ✗ No objects to export")
    sys.exit(1)
