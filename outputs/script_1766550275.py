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
base.Length = 100.0
base.Width = 60.0
base.Height = 10.0
doc.recompute()
print(f"[FREECAD] Box {base.Length}x{base.Width}x{base.Height}mm")


# HOLES WITH PRECISION
hole_objects = []
thread_objects = []

hole_0 = doc.addObject("Part::Cylinder", "Hole_0")
hole_0.Radius = 5.0
hole_0.Height = 10.0 + 20
hole_0.Placement.Base = FreeCAD.Vector(100.0/2, 60.0/2, -10)
hole_objects.append(hole_0)

if hole_objects:
    fused_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
    fused_holes.Shapes = [*hole_objects]
    doc.recompute()

    cut = doc.addObject("Part::Cut", "PartWithHoles")
    cut.Base = base
    cut.Tool = fused_holes
    base = cut
    doc.recompute()
    print(f"[FREECAD] Added {len(hole_objects)} holes")


# Final recompute
doc.recompute()
print("[FREECAD] Generation complete!")

# Get the final object
final_obj = base if 'base' in locals() else doc.Objects[-1]

# EXPORT TO STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\1766550275.stl"

if doc.Objects:
    print("[FREECAD] Exporting to STL...")
    try:
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] SUCCESS! STL exported: {output_path}")
        print(f"[FREECAD] File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"[FREECAD] Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] No objects to export")
    sys.exit(1)
