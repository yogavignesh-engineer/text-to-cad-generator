import FreeCAD, Part, math, Mesh, MeshPart
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument('GeneratedPart')

outer_radius = 30.0
height = 10.0
num_teeth = 24
tooth_depth = outer_radius * 0.15
base_radius = outer_radius - tooth_depth
points = []
tooth_angle = (2 * math.pi) / num_teeth
for i in range(num_teeth * 2 + 1):
    angle = (i * tooth_angle) / 2
    r_curr = outer_radius if i % 2 == 0 else base_radius
    x = r_curr * math.cos(angle)
    y = r_curr * math.sin(angle)
    points.append(FreeCAD.Vector(x, y, 0))

gear_wire = Part.makePolygon(points)
gear_face = Part.Face(gear_wire)
gear_solid = gear_face.extrude(FreeCAD.Vector(0, 0, height))
base = doc.addObject("Part::Feature", "Gear")
base.Shape = gear_solid


doc.recompute()
MeshObj = doc.addObject("Mesh::Feature", "Mesh")
MeshObj.Mesh = MeshPart.meshFromShape(Shape=base.Shape, LinearDeflection=0.1)

MeshObj.Mesh.write(r"C:\portfolio\text to cad\backend\outputs\gen_ee632d65.stl")
