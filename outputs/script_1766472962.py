import FreeCAD, Part, math
import sys

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
base.Height = 10.0
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
        if edge.Length > 5.0 * 3:
            edges_to_fillet.append(edge)

    if len(edges_to_fillet) > 0:
        print(f"[FREECAD] Filleting {len(edges_to_fillet)} edges with R=5.0mm")
        filleted_shape = shape.makeFillet(5.0, edges_to_fillet)

        # Create new feature with filleted shape
        fillet_0 = doc.addObject("Part::Feature", "Fillet_0")
        fillet_0.Shape = filleted_shape
        base = fillet_0
        doc.recompute()
        print(f"[FREECAD] Fillet applied (R=5.0mm on {len(edges_to_fillet)} edges)")
    else:
        print(f"[FREECAD] No suitable edges for R=5.0mm fillet")

except Exception as e:
    print(f"[FREECAD] Fillet operation failed: {e}")
    print("[FREECAD] Continuing without fillet...")
    pass


# Final recompute
doc.recompute()
print("[FREECAD] Generation complete!")

# Get the final object
final_obj = base if 'base' in locals() else doc.Objects[-1]

# EXPORT TO STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\1766472962.stl"

if doc.Objects:
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
    print("[FREECAD] No objects to export")
    sys.exit(1)
