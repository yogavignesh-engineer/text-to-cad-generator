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
output_path = r"C:\portfolio\text to cad\backend\outputs\1766632393.stl"

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
