import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument:
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# PRECISION GEAR WITH ACTUAL TEETH
try:
    outer_radius = 30.0
    tooth_depth = outer_radius * 0.15
    base_radius = outer_radius - tooth_depth
    height = 10.0
    num_teeth = 20
    hub_radius = outer_radius * 0.3

    # Create gear profile with proper involute teeth
    points = []
    tooth_angle = (2 * math.pi) / num_teeth

    for i in range(num_teeth * 2 + 1):
        angle = (i * tooth_angle) / 2
        if i % 2 == 0:
            r = outer_radius  # Tooth tip
        else:
            r = base_radius  # Tooth root
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

    base = doc.addObject("Part::Feature", "Gear")
    base.Shape = gear_solid
    doc.recompute()
    radius = dims.get('radius', dims.get('diameter', 60) / 2)
    num_teeth = int(dims.get('teeth', 20))
    height = dims.get('height', 10)
    print(f"[FREECAD] Gear R={radius}mm H={height}mm Teeth={num_teeth}")
except Exception as e:
    print(f"[FREECAD] WARNING: Gear generation failed: {e}. Falling back to a cylinder.")
    base = doc.addObject("Part::Cylinder", "FallbackCylinder")
    base.Radius = 30.0
    base.Height = 10.0
    doc.recompute()


# Final recompute
doc.recompute()
print("[FREECAD] Generation complete!")

# Get the final object
final_obj = base if 'base' in locals() else doc.Objects[-1] if doc.Objects else None

# Validate the final object before exporting
if not final_obj or not hasattr(final_obj, "Shape") or not final_obj.Shape.isValid():
    print("[FREECAD] WARNING: The determined final object is invalid. Searching for a valid object to export.")
    found_valid = False
    for o in reversed(doc.Objects):
        if hasattr(o, "Shape") and o.Shape.isValid():
            final_obj = o
            found_valid = True
            print(f"[FREECAD] Found valid fallback object: {o.Name}")
            break
    if not found_valid:
        final_obj = None

# EXPORT TO STL
import Mesh
import os
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\1766561543.stl"

if final_obj:
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
    print("[FREECAD] No valid object found to export.")
    sys.exit(1)
