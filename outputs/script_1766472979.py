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


# PRECISION CHAMFERS

try:
    # Get base shape
    if hasattr(base, 'Shape'):
        shape = base.Shape
    else:
        print("[FREECAD] Cannot apply chamfer - no Shape attribute")
        raise Exception("No Shape")

    # Only chamfer edges longer than 4x chamfer size
    edges_to_chamfer = []
    for edge in shape.Edges:
        if edge.Length > 3.0 * 4:
            edges_to_chamfer.append(edge)

    if len(edges_to_chamfer) > 0:
        print(f"[FREECAD] Chamfering {len(edges_to_chamfer)} edges with size=3.0mm")
        chamfered_shape = shape.makeChamfer(3.0, edges_to_chamfer)

        # Create new feature with chamfered shape
        chamfer_0 = doc.addObject("Part::Feature", "Chamfer_0")
        chamfer_0.Shape = chamfered_shape
        base = chamfer_0
        doc.recompute()
        print(f"[FREECAD] Chamfer applied (size=3.0mm on {len(edges_to_chamfer)} edges)")
    else:
        print(f"[FREECAD] No suitable edges for 3.0mm chamfer")

except Exception as e:
    print(f"[FREECAD] Chamfer operation failed: {e}")
    print("[FREECAD] Continuing without chamfer...")
    pass


# Final recompute
doc.recompute()
print("[FREECAD] Generation complete!")

# Get the final object
final_obj = base if 'base' in locals() else doc.Objects[-1]

# EXPORT TO STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\1766472979.stl"

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
