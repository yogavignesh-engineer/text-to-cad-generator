import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

# Bolt head (hexagonal cylinder approximation)
head = Part.makeCylinder(7.2, 5.6)
# Bolt shaft
shaft = Part.makeCylinder(4.0, 40.0)
shaft.translate(FreeCAD.Vector(0, 0, 5.6))
# Combine head and shaft
bolt_shape = head.fuse(shaft)
base = doc.addObject("Part::Feature", "Bolt")
base.Shape = bolt_shape


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_24277bee.stl")
