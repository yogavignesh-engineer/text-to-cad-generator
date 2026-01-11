import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

# Outer cylinder
outer = Part.makeCylinder(15.0, 100.0)
# Inner cylinder (to subtract)
inner = Part.makeCylinder(10.5, 100.0)
# Cut inner from outer to make hollow tube
tube_shape = outer.cut(inner)
base = doc.addObject("Part::Feature", "Tube")
base.Shape = tube_shape


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_935d58df.stl")
