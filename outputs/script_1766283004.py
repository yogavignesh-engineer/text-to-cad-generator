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
base.Length = 100.0
base.Width = 80.0
base.Height = 6.0
print(f"[FREECAD] Created box: {base.Length}x{base.Width}x{base.Height}")


# Holes (4x 5.0mm diameter)
holes = []
hole0 = doc.addObject("Part::Cylinder", "Hole0")
hole0.Radius = 2.5
hole0.Height = 26.0
hole0.Placement.Base = FreeCAD.Vector(5, 5, -10)
holes.append(hole0)
hole1 = doc.addObject("Part::Cylinder", "Hole1")
hole1.Radius = 2.5
hole1.Height = 26.0
hole1.Placement.Base = FreeCAD.Vector(95.0, 5, -10)
holes.append(hole1)
hole2 = doc.addObject("Part::Cylinder", "Hole2")
hole2.Radius = 2.5
hole2.Height = 26.0
hole2.Placement.Base = FreeCAD.Vector(5, 75.0, -10)
holes.append(hole2)
hole3 = doc.addObject("Part::Cylinder", "Hole3")
hole3.Radius = 2.5
hole3.Height = 26.0
hole3.Placement.Base = FreeCAD.Vector(95.0, 75.0, -10)
holes.append(hole3)

fused_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
fused_holes.Shapes = holes

cut = doc.addObject("Part::Cut", "FinalPart")
cut.Base = base
cut.Tool = fused_holes
base = cut
print("[FREECAD] Added corner holes")


# Recompute document
doc.recompute()
print("[FREECAD] Document recomputed successfully")

# Export to STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766283004.stl"

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
