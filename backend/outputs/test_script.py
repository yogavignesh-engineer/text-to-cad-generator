import FreeCAD, Part, Mesh, MeshPart
import sys
import os

# Create new document
doc = FreeCAD.newDocument("Test")

# Create a simple box as mesh directly
print("Creating mesh box...")

# Create mesh box
vertices = [
    FreeCAD.Vector(0, 0, 0),
    FreeCAD.Vector(10, 0, 0),
    FreeCAD.Vector(10, 10, 0),
    FreeCAD.Vector(0, 10, 0),
    FreeCAD.Vector(0, 0, 10),
    FreeCAD.Vector(10, 0, 10),
    FreeCAD.Vector(10, 10, 10),
    FreeCAD.Vector(0, 10, 10)
]

faces = [
    [0, 1, 2, 3],  # bottom
    [4, 5, 6, 7],  # top
    [0, 1, 5, 4],  # front
    [1, 2, 6, 5],  # right
    [2, 3, 7, 6],  # back
    [3, 0, 4, 7]   # left
]

mesh = Mesh.Mesh()
for face in faces:
    mesh.addFacet(vertices[face[0]], vertices[face[1]], vertices[face[2]])
    if len(face) > 3:
        mesh.addFacet(vertices[face[0]], vertices[face[2]], vertices[face[3]])

print(f"Mesh created with {len(mesh.Facets)} facets")

# Try to export
try:
    output_path = os.path.join(os.getcwd(), "test6.stl")
    print(f"Exporting to: {output_path}")
    
    # Export mesh directly
    mesh.write(output_path)
    print(f"STL exported to {output_path}")
    
    # Check file size
    size = os.path.getsize(output_path)
    print(f"File size: {size} bytes")
    
except Exception as e:
    print(f"Export failed: {e}")
    import traceback
    traceback.print_exc()

print("Script completed")