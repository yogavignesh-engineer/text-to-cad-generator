import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] OK Document created")

# ===== PRECISION TUBE =====
outer_cyl = doc.addObject("Part::Cylinder", "OuterCylinder")
outer_cyl.Radius = 10.0
outer_cyl.Height = 100.0

inner_cyl = doc.addObject("Part::Cylinder", "InnerCylinder")
inner_cyl.Radius = 8.0
inner_cyl.Height = 102.0
inner_cyl.Placement.Base = FreeCAD.Vector(0, 0, -1)

base = doc.addObject("Part::Cut", "Tube")
base.Base = outer_cyl
base.Tool = inner_cyl
doc.recompute()

print(f"[FREECAD] OK Tube: OR{outer_cyl.Radius} IR{inner_cyl.Radius} H{outer_cyl.Height}mm")


# Final recompute
doc.recompute()
print("[FREECAD] OK OK OK Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
import os
output_path = r"outputs\output_1766382784.stl"

if doc.Objects:
    print("[FREECAD] Exporting to STL...")
    try:
        # Get the final object
        final_obj = base if 'base' in locals() else doc.Objects[-1]
        
        # Export
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] OK OK OK SUCCESS! STL exported: {output_path}")
        print(f"[FREECAD] File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"[FREECAD] ERROR ERROR ERROR Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] ERROR ERROR ERROR No objects to export")
    sys.exit(1)
