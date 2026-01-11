import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== CAMSHAFT =====
length = 4.0
num_lobes = 4
shaft_radius = length / 25
lobe_height = shaft_radius * 2

# Shaft
shaft = doc.addObject("Part::Cylinder", "CamShaft")
shaft.Radius = shaft_radius
shaft.Height = length
shaft.Placement.Base = FreeCAD.Vector(0, 0, 0)
shaft.Placement.Rotation = FreeCAD.Rotation(FreeCAD.Vector(0, 1, 0), 90)

# Create lobes
lobes = []
for i in range(num_lobes):
    pos = -length / 2 + (length / (num_lobes + 1)) * (i + 1)
    
    lobe = doc.addObject("Part::Cylinder", f"Lobe{i}")
    lobe.Radius = lobe_height
    lobe.Height = shaft_radius * 1.5
    lobe.Placement.Base = FreeCAD.Vector(pos, lobe_height * 0.7, -shaft_radius * 0.75)
    lobe.Placement.Rotation = FreeCAD.Rotation(FreeCAD.Vector(0, 1, 0), 90)
    lobes.append(lobe)

# Fuse all
base = doc.addObject("Part::MultiFuse", "Camshaft")
base.Shapes = [shaft] + lobes
doc.recompute()

print(f"[FREECAD] ✓ Camshaft: L{length}mm Lobes={num_lobes}")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL AND STEP =====
import Mesh
import Part
output_path_stl = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379748.stl"
output_path_step = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379748.step"

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
