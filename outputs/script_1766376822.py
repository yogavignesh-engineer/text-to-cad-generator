import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== FLANGE COUPLING =====
flange_radius = 20.0
shaft_radius = flange_radius / 2
length = 40

# Shaft
shaft = doc.addObject("Part::Cylinder", "Shaft")
shaft.Radius = shaft_radius
shaft.Height = length

# Flanges at both ends
flange1 = doc.addObject("Part::Cylinder", "Flange1")
flange1.Radius = flange_radius
flange1.Height = length / 5
flange1.Placement.Base = FreeCAD.Vector(0, 0, 0)

flange2 = doc.addObject("Part::Cylinder", "Flange2")
flange2.Radius = flange_radius
flange2.Height = length / 5
flange2.Placement.Base = FreeCAD.Vector(0, 0, length * 0.8)

# Fuse all
base = doc.addObject("Part::MultiFuse", "FlangeCoupling")
base.Shapes = [shaft, flange1, flange2]
doc.recompute()

print(f"[FREECAD] ✓ Flange: D{flange_radius*2}mm L{length}mm")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766376822.stl"

if doc.Objects:
    print("[FREECAD] 📦 Exporting to STL...")
    try:
        # Get the final object
        final_obj = base if 'base' in locals() else doc.Objects[-1]
        
        # Export
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] ✓✓✓ SUCCESS! STL exported: {output_path}")
        print(f"[FREECAD] File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"[FREECAD] ✗✗✗ Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] ✗✗✗ No objects to export")
    sys.exit(1)
