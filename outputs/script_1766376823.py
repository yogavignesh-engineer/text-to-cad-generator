import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== CRANKSHAFT =====
length = 120.0
main_radius = length / 20
crank_radius = length / 15
throw_distance = length / 8

# Main bearings
bearing1 = doc.addObject("Part::Cylinder", "Bearing1")
bearing1.Radius = main_radius
bearing1.Height = length * 0.2
bearing1.Placement.Base = FreeCAD.Vector(-length * 0.3, 0, 0)
bearing1.Placement.Rotation = FreeCAD.Rotation(FreeCAD.Vector(0, 1, 0), 90)

bearing2 = doc.addObject("Part::Cylinder", "Bearing2")
bearing2.Radius = main_radius
bearing2.Height = length * 0.2
bearing2.Placement.Base = FreeCAD.Vector(length * 0.3, 0, 0)
bearing2.Placement.Rotation = FreeCAD.Rotation(FreeCAD.Vector(0, 1, 0), 90)

# Crank pin
crank_pin = doc.addObject("Part::Cylinder", "CrankPin")
crank_pin.Radius = crank_radius
crank_pin.Height = length * 0.15
crank_pin.Placement.Base = FreeCAD.Vector(0, throw_distance, 0)
crank_pin.Placement.Rotation = FreeCAD.Rotation(FreeCAD.Vector(0, 1, 0), 90)

# Webs
web1 = doc.addObject("Part::Box", "Web1")
web1.Length = length * 0.15
web1.Width = throw_distance
web1.Height = main_radius * 3
web1.Placement.Base = FreeCAD.Vector(-length * 0.225, 0, -main_radius * 1.5)

web2 = doc.addObject("Part::Box", "Web2")
web2.Length = length * 0.15
web2.Width = throw_distance
web2.Height = main_radius * 3
web2.Placement.Base = FreeCAD.Vector(length * 0.075, 0, -main_radius * 1.5)

# Fuse all
base = doc.addObject("Part::MultiFuse", "Crankshaft")
base.Shapes = [bearing1, bearing2, crank_pin, web1, web2]
doc.recompute()

print(f"[FREECAD] ✓ Crankshaft: L{length}mm Throw={throw_distance}mm")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766376823.stl"

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
