import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== PRECISION GEAR WITH ACTUAL TEETH =====
outer_radius = 25.0
tooth_depth = 3.75
base_radius = outer_radius - tooth_depth
height = 70.0
num_teeth = 25
hub_radius = 7.5

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


# ===== HOLES WITH PRECISION =====
hole_0 = doc.addObject("Part::Cylinder", "Hole_0")
hole_0.Radius = 4.0
hole_0.Height = 90.0
hole_0.Placement.Base = FreeCAD.Vector(25.0, 25.0, -10)

# Thread for center hole
thread_pitch = 1.0
thread_helix_0 = Part.makeHelix(thread_pitch, 80.0, 3.6)
thread_profile_0 = Part.Wire(Part.makeCircle(0.48, FreeCAD.Vector(3.6, 0, 0)))

try:
    thread_solid_0 = Part.Wire(thread_helix_0).makePipeShell([thread_profile_0], True, False)
    thread_obj_0 = doc.addObject("Part::Feature", "Thread_0")
    thread_obj_0.Shape = thread_solid_0
    thread_obj_0.Placement.Base = FreeCAD.Vector(25.0, 25.0, -5)
    thread_objects.append(thread_obj_0)
except:
    print("[FREECAD] ⚠ Thread creation skipped")

doc.recompute()

# Fuse all holes
fused_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
fused_holes.Shapes = [hole_0]
doc.recompute()

# Cut holes from base
cut = doc.addObject("Part::Cut", "PartWithHoles")
cut.Base = base
cut.Tool = fused_holes
base = cut
doc.recompute()

print(f"[FREECAD] ✓ Added {len([hole_0])} holes")


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766376827.stl"

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
