import FreeCAD, Part, math
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

base = doc.addObject("Part::Box", "Base")
base.Length = 100.0
base.Width = 100.0
base.Height = 10.0


doc.recompute()
Mesh = doc.addObject("Mesh::Feature", "Mesh")
Mesh.Mesh = base.Shape.tessellate(0.1)

Mesh.Mesh.write(r"outputs\gen_c5a77318.stl")
