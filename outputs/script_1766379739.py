import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== BASE BOX =====
base = doc.addObject("Part::Box", "Base")
base.Length = 100.0
base.Width = 100.0
base.Height = 4.0
doc.recompute()
print(f"[FREECAD] ✓ Box: {base.Length}x{base.Width}x{base.Height}mm")


# ===== HOLES WITH PRECISION =====
hole_0_0 = doc.addObject("Part::Cylinder", "Hole_0_0")
hole_0_0.Radius = 2.5
hole_0_0.Height = 24.0
hole_0_0.Placement.Base = FreeCAD.Vector(5, 5, -10)
hole_0_1 = doc.addObject("Part::Cylinder", "Hole_0_1")
hole_0_1.Radius = 2.5
hole_0_1.Height = 24.0
hole_0_1.Placement.Base = FreeCAD.Vector(95.0, 5, -10)
hole_0_2 = doc.addObject("Part::Cylinder", "Hole_0_2")
hole_0_2.Radius = 2.5
hole_0_2.Height = 24.0
hole_0_2.Placement.Base = FreeCAD.Vector(5, 95.0, -10)
hole_0_3 = doc.addObject("Part::Cylinder", "Hole_0_3")
hole_0_3.Radius = 2.5
hole_0_3.Height = 24.0
hole_0_3.Placement.Base = FreeCAD.Vector(95.0, 95.0, -10)

doc.recompute()

# Fuse all holes
fused_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
fused_holes.Shapes = [hole_0_0, hole_0_1, hole_0_2, hole_0_3]
doc.recompute()

# Cut holes from base
cut = doc.addObject("Part::Cut", "PartWithHoles")
cut.Base = base
cut.Tool = fused_holes
base = cut
doc.recompute()

print(f"[FREECAD] ✓ Added {len([hole_0_0, hole_0_1, hole_0_2, hole_0_3])} holes")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL AND STEP =====
import Mesh
import Part
output_path_stl = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379739.stl"
output_path_step = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379739.step"

if doc.Objects:
    print("[FREECAD] 📦 Exporting to STL and STEP...")
    try:
        # Get the final object
        final_obj = base if 'base' in locals() else doc.Objects[-1]
        
        # Export to STL
        Mesh.export([final_obj], output_path_stl)
        print(f"[FREECAD] ✓✓✓ SUCCESS! STL exported: {output_path_stl}")
        print(f"[FREECAD] STL file size: {os.path.getsize(output_path_stl) / 1024:.2f} KB")
        
        # Export to STEP
        Part.export([final_obj], output_path_step)
        print(f"[FREECAD] ✓✓✓ SUCCESS! STEP exported: {output_path_step}")
        print(f"[FREECAD] STEP file size: {os.path.getsize(output_path_step) / 1024:.2f} KB")
        
    except Exception as e:
        print(f"[FREECAD] ✗✗✗ Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] ✗✗✗ No objects to export")
    sys.exit(1)
