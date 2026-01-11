import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== PRECISION TUBE =====
outer_cyl = doc.addObject("Part::Cylinder", "OuterCylinder")
outer_cyl.Radius = 1.0
outer_cyl.Height = 100.0

inner_cyl = doc.addObject("Part::Cylinder", "InnerCylinder")
inner_cyl.Radius = -99.0
inner_cyl.Height = 102.0
inner_cyl.Placement.Base = FreeCAD.Vector(0, 0, -1)

base = doc.addObject("Part::Cut", "Tube")
base.Base = outer_cyl
base.Tool = inner_cyl
doc.recompute()

print(f"[FREECAD] ✓ Tube: OR{outer_cyl.Radius} IR{inner_cyl.Radius} H{outer_cyl.Height}mm")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL AND STEP =====
import Mesh
import Part
output_path_stl = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379743.stl"
output_path_step = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379743.step"

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
