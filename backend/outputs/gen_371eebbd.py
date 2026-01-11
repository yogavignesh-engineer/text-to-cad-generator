import FreeCAD, Part, math
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 10.0


doc.recompute()
Mesh = doc.addObject("Mesh::Feature", "Mesh")
Mesh.Mesh = Mesh.Part.Shape.tessellate(0.1)

Mesh.Mesh.write(r"outputs\gen_371eebbd.stl")
