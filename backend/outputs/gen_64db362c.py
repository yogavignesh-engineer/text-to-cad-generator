import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

# Create base plate
plate = Part.makeBox(50.0, 50.0, 10.0)
# Create hole cylinder at center
hole = Part.makeCylinder(7.5, 10.0)
hole.translate(FreeCAD.Vector(25.0, 25.0, 0))
# Cut hole from plate
plate_with_hole = plate.cut(hole)
base = doc.addObject("Part::Feature", "PlateWithHole")
base.Shape = plate_with_hole


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_64db362c.stl")
