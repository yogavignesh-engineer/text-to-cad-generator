import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] OK Document created")

# ===== BASE BOX =====
base = doc.addObject("Part::Box", "Base")
base.Length = 50
base.Width = 50
base.Height = 10
doc.recompute()
print(f"[FREECAD] OK Box: {base.Length}x{base.Width}x{base.Height}mm")


# Final recompute
doc.recompute()
print("[FREECAD] OK OK OK Generation complete!")

# ===== EXPORT TO STL =====
import Mesh
import os
output_path = r"outputs\output_1766382640.stl"

if doc.Objects:
    print("[FREECAD] 📦 Exporting to STL...")
    try:
        # Get the final object
        final_obj = base if 'base' in locals() else doc.Objects[-1]
        
        # Export
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] OK OK OK SUCCESS! STL exported: {output_path}")
        print(f"[FREECAD] File size: {os.path.getsize(output_path) / 1024:.2f} KB")
    except Exception as e:
        print(f"[FREECAD] ✗✗✗ Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] ✗✗✗ No objects to export")
    sys.exit(1)
