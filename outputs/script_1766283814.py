import FreeCAD, Part
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# Base Cylinder
base = doc.addObject("Part::Cylinder", "Base")
base.Radius = 70.0
base.Height = 18.0
print(f"[FREECAD] Created cylinder: R{base.Radius} H{base.Height}")


# Holes (1x 10.0mm diameter)
hole = doc.addObject("Part::Cylinder", "Hole")
hole.Radius = 5.0
hole.Height = 38.0
hole.Placement.Base = FreeCAD.Vector(25.0, 25.0, -10)

cut = doc.addObject("Part::Cut", "CutResult")
cut.Base = base
cut.Tool = hole
base = cut
print("[FREECAD] Added center hole")


# Recompute document
doc.recompute()
print("[FREECAD] Document recomputed successfully")

# Export to STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766283814.stl"

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
