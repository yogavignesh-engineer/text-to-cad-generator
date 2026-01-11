import FreeCAD, Part
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument("GeneratedPart")

# Base Box
base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 10.0


doc.recompute()

import Mesh
output_path = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output.stl"
if doc.Objects:
    print("Exporting to STL...")
    Mesh.export([doc.Objects[-1]], output_path)
    print(f"Success: {output_path}")
