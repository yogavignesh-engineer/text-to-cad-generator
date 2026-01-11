import FreeCAD, Part
if FreeCAD.ActiveDocument: FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)
doc = FreeCAD.newDocument("AI_Part")
plate = doc.addObject("Part::Box", "Plate")
plate.Length = 100; plate.Width = 100; plate.Height = 10
coords = [(5,5,0), (95,5,0), (5,95,0), (95,95,0)]
holes = []
for i, c in enumerate(coords):
    cyl = doc.addObject("Part::Cylinder", f"Hole{i}")
    cyl.Radius = 5; cyl.Height = 20; cyl.Placement.Base = FreeCAD.Vector(c)
    holes.append(cyl)
cut = doc.addObject("Part::Cut", "FinalPlate")
cut.Base = plate
fuse_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
fuse_holes.Shapes = holes
cut.Tool = fuse_holes
tower = doc.addObject("Part::Cylinder", "Tower")
tower.Radius = 30; tower.Height = 40; tower.Placement.Base = FreeCAD.Vector(50,50,10)
final = doc.addObject("Part::MultiFuse", "FinalPart")
final.Shapes = [cut, tower]
doc.recompute()

import Mesh, os
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, 'outputs')
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
output_path = os.path.join(output_dir, "output_standalone.stl")

if doc.Objects:
    print("   [CAD] Exporting last object...")
    Mesh.export([doc.Objects[-1]], output_path)
