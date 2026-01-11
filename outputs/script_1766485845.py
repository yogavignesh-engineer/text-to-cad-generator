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
base.Width = 50.0
base.Height = 20.0
doc.recompute()
print(f"[FREECAD] Box {base.Length}x{base.Width}x{base.Height}mm")


# HOLES WITH PRECISION
hole_objects = []
thread_objects = []

hole_00 = doc.addObject("Part::Cylinder", "Hole_00")
hole_00.Radius = 2.5
hole_00.Height = 20.0 + 20
hole_00.Placement.Base = FreeCAD.Vector(5, 5, -10)
hole_objects.append(hole_00)

hole_01 = doc.addObject("Part::Cylinder", "Hole_01")
hole_01.Radius = 2.5
hole_01.Height = 20.0 + 20
hole_01.Placement.Base = FreeCAD.Vector(95.0, 5, -10)
hole_objects.append(hole_01)

hole_02 = doc.addObject("Part::Cylinder", "Hole_02")
hole_02.Radius = 2.5
hole_02.Height = 20.0 + 20
hole_02.Placement.Base = FreeCAD.Vector(5, 45.0, -10)
hole_objects.append(hole_02)

hole_03 = doc.addObject("Part::Cylinder", "Hole_03")
hole_03.Radius = 2.5
hole_03.Height = 20.0 + 20
hole_03.Placement.Base = FreeCAD.Vector(95.0, 45.0, -10)
hole_objects.append(hole_03)

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
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\1766485845.stl"

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
