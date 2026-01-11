import FreeCAD, Part, math
import sys
import os

# Close existing document
if FreeCAD.ActiveDocument:
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# BASE BOX
base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 25.0
doc.recompute()
print(f"[FREECAD] Box {base.Length}x{base.Width}x{base.Height}mm")


# PRECISION FILLETS

try:
    # Get base shape
    if hasattr(base, 'Shape'):
        shape = base.Shape
    else:
        print("[FREECAD] Cannot apply fillet - no Shape attribute")
        raise Exception("No Shape")

    # Only fillet edges longer than 3x fillet radius
    edges_to_fillet = []
    for edge in shape.Edges:
        if edge.Length > 8.0 * 3:
            edges_to_fillet.append(edge)

    if len(edges_to_fillet) > 0:
        print("[FREECAD] Filleting " + str(len(edges_to_fillet)) + " edges with R=8.0mm")
        filleted_shape = shape.makeFillet(8.0, edges_to_fillet)

        # Create new feature with filleted shape
        fillet_0 = doc.addObject("Part::Feature", "Fillet_0")
        fillet_0.Shape = filleted_shape
        base = fillet_0
        doc.recompute()
        print("[FREECAD] Fillet applied (R=8.0mm on " + str(len(edges_to_fillet)) + " edges)")
    else:
        print("[FREECAD] No suitable edges for R=8.0mm fillet")

except Exception as e:
    print("[FREECAD] Fillet operation failed: " + str(e))
    print("[FREECAD] Continuing without fillet...")
    pass


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
output_path = r"C:\portfolio\text to cad\backend\outputs\1767160257.stl"

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
