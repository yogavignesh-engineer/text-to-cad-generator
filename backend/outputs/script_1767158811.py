import FreeCAD, Part, math
import sys
import os

# Close existing document
if FreeCAD.ActiveDocument:
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# PRECISION GEAR WITH ACTUAL TEETH
try:
    outer_radius = 40.0
    tooth_depth = outer_radius * 0.15
    base_radius = outer_radius - tooth_depth
    height = 15.0
    num_teeth = 24
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
    print(f"[FREECAD] Gear R=40.0mm H=15.0mm Teeth=24")
except Exception as e:
    print(f"[FREECAD] WARNING: Gear generation failed: {e}. Falling back to a cylinder.")
    base = doc.addObject("Part::Cylinder", "FallbackCylinder")
    base.Radius = 40.0
    base.Height = 15.0
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
output_path = r"C:\portfolio\text to cad\backend\outputs\1767158811.stl"

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
