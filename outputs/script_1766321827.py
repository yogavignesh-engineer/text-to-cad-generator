import FreeCAD, Part
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] Document created")

# Base Box
base = doc.addObject("Part::Box", "Base")
base.Length = 10.0
base.Width = 10.0
base.Height = 10.0
print(f"[FREECAD] Created box: {base.Length}x{base.Width}x{base.Height}")


# Fillets
# Create fillet approximation using small cylinder cuts
fillet_cyl_0 = doc.addObject("Part::Cylinder", "FilletCyl0")
fillet_cyl_0.Radius = 2.0
fillet_cyl_0.Height = 14.0

# Position at corner for fillet effect
fillet_cyl_0.Placement.Base = FreeCAD.Vector(2.0, 2.0, -2)

fillet_cut_0 = doc.addObject("Part::Cut", "FilletCut0")
fillet_cut_0.Base = base
fillet_cut_0.Tool = fillet_cyl_0
base = fillet_cut_0

print(f"[FREECAD] Added fillet approximation: radius=2.0")


# Chamfers
# Create chamfer approximation using box cut
chamfer_box_0 = doc.addObject("Part::Box", "ChamferBox0")
chamfer_box_0.Length = 1.0
chamfer_box_0.Width = 1.0
chamfer_box_0.Height = 14.0

# Position at corner for chamfer effect
chamfer_box_0.Placement.Base = FreeCAD.Vector(0, 0, -2)

chamfer_cut_0 = doc.addObject("Part::Cut", "ChamferCut0")
chamfer_cut_0.Base = base
chamfer_cut_0.Tool = chamfer_box_0
base = chamfer_cut_0

print(f"[FREECAD] Added chamfer approximation: size=1.0")


# Recompute document
doc.recompute()
print("[FREECAD] Document recomputed successfully")

# Export to STL
import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766321827.stl"

if doc.Objects:
    print("[FREECAD] Exporting to STL...")
    try:
        # Get the last object (final result after cuts)
        final_obj = doc.Objects[-1]
        Mesh.export([final_obj], output_path)
        print(f"[FREECAD] ✓ STL exported: {output_path}")
    except Exception as e:
        print(f"[FREECAD] ✗ Export failed: {e}")
        sys.exit(1)
else:
    print("[FREECAD] ✗ No objects to export")
    sys.exit(1)
