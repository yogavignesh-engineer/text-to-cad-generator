import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

base = doc.addObject("Part::Sphere", "Base")
base.Radius = 25.0


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_efaee997.stl")
