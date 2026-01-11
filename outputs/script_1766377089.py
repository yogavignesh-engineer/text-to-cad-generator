import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== PISTON =====
piston_radius = 40.0
piston_height = 80

# Main piston body
body = doc.addObject("Part::Cylinder", "PistonBody")
body.Radius = piston_radius * 0.95
body.Height = piston_height * 0.6
body.Placement.Base = FreeCAD.Vector(0, 0, 0)

# Piston head
head = doc.addObject("Part::Cylinder", "PistonHead")
head.Radius = piston_radius
head.Height = piston_height * 0.15
head.Placement.Base = FreeCAD.Vector(0, 0, piston_height * 0.6)

# Fuse body and head
fuse1 = doc.addObject("Part::MultiFuse", "PistonBase")
fuse1.Shapes = [body, head]

# Piston skirt
skirt = doc.addObject("Part::Cylinder", "PistonSkirt")
skirt.Radius = piston_radius * 0.92
skirt.Height = piston_height * 0.35
skirt.Placement.Base = FreeCAD.Vector(0, 0, -piston_height * 0.35)

# Fuse all
base = doc.addObject("Part::MultiFuse", "Piston")
base.Shapes = [fuse1, skirt]
doc.recompute()

print(f"[FREECAD] ✓ Piston: D{piston_radius*2}mm H{piston_height}mm")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766377089.stl"

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
