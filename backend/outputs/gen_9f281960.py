import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

# Standard Nominal Geometry
base = doc.addObject("Part::Cylinder", "Base")
base.Radius = 20.0
base.Height = 100.0


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_9f281960.stl")
