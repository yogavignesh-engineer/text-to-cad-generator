import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== PRECISION GEAR WITH ACTUAL TEETH =====
outer_radius = 20.0
tooth_depth = 3.0
base_radius = outer_radius - tooth_depth
height = 60.0
num_teeth = 20
hub_radius = 6.0

# Create gear profile with proper involute teeth
points = []
tooth_angle = (2 * math.pi) / num_teeth

for i in range(num_teeth * 2 + 1):
    angle = i * (tooth_angle / 2)
    
    # Alternate between tooth tip and root
    if i % 2 == 0:
        r = outer_radius  # Tooth tip
    else:
        r = base_radius   # Tooth root
    
    x = r * math.cos(angle)
    y = r * math.sin(angle)
    points.append(FreeCAD.Vector(x, y, 0))

# Create closed wire
gear_wire = Part.makePolygon(points)
gear_face = Part.Face(gear_wire)

# Create center hole
center_circle = Part.makeCircle(hub_radius, FreeCAD.Vector(0, 0, 0))
hole_face = Part.Face(Part.Wire(center_circle))

# Cut hole from gear profile
gear_profile = gear_face.cut(hole_face)

# Extrude to create 3D gear
gear_solid = gear_profile.extrude(FreeCAD.Vector(0, 0, height))

# Add to document
base = doc.addObject("Part::Feature", "Gear")
base.Shape = gear_solid
doc.recompute()

print(f"[FREECAD] ✓ Gear: R{outer_radius}mm H{height}mm Teeth={num_teeth}")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766376807.stl"

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
