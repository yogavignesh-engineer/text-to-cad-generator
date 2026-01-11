import FreeCAD, Part, math
import sys

# Close existing document
if FreeCAD.ActiveDocument: 
    FreeCAD.closeDocument(FreeCAD.ActiveDocument.Name)

# Create new document
doc = FreeCAD.newDocument("GeneratedPart")
print("[FREECAD] ✓ Document created")

# ===== BASE BOX =====
base = doc.addObject("Part::Box", "Base")
base.Length = 50.0
base.Width = 50.0
base.Height = 5.0
doc.recompute()
print(f"[FREECAD] ✓ Box: {base.Length}x{base.Width}x{base.Height}mm")


# ===== HOLES WITH PRECISION =====
hole_0 = doc.addObject("Part::Cylinder", "Hole_0")
hole_0.Radius = 2.5
hole_0.Height = 25.0
hole_0.Placement.Base = FreeCAD.Vector(25.0, 25.0, -10)

doc.recompute()

# Fuse all holes
fused_holes = doc.addObject("Part::MultiFuse", "HoleCluster")
fused_holes.Shapes = [hole_0]
doc.recompute()

# Cut holes from base
cut = doc.addObject("Part::Cut", "PartWithHoles")
cut.Base = base
cut.Tool = fused_holes
base = cut
doc.recompute()

print(f"[FREECAD] ✓ Added {len([hole_0])} holes")


# ===== PRECISION FILLETS =====
try:
    # Get base shape
    if hasattr(base, 'Shape'):
        shape = base.Shape
    else:
        print("[FREECAD] ⚠ Cannot apply fillet - no Shape attribute")
        raise Exception("No Shape")
    
    # Select edges for filleting
    edges_to_fillet = []
    for edge in shape.Edges:
        # Only fillet edges longer than 3x fillet radius
        if edge.Length > 15.0:
            edges_to_fillet.append(edge)
    
    if len(edges_to_fillet) > 0:
        print(f"[FREECAD] Filleting {len(edges_to_fillet)} edges with R=5.0mm")
        
        # Create filleted shape
        filleted_shape = shape.makeFillet(5.0, edges_to_fillet)
        
        # Create new feature with filleted shape
        fillet_0 = doc.addObject("Part::Feature", "Fillet0")
        fillet_0.Shape = filleted_shape
        base = fillet_0
        doc.recompute()
        
        print(f"[FREECAD] ✓ Fillet applied: R=5.0mm on {len(edges_to_fillet)} edges")
    else:
        print(f"[FREECAD] ⚠ No suitable edges for R=5.0mm fillet")
    
except Exception as e:
    print(f'[FREECAD] ✗ Fillet operation failed: {e}')
    print("[FREECAD] Continuing without fillet...")
    pass


# Final recompute
doc.recompute()
print("[FREECAD] ✓✓✓ Generation complete!")

# ===== EXPORT TO STL AND STEP =====
import Mesh
import Part
output_path_stl = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379706.stl"
output_path_step = r"C:\Users\_YOGA_VIGNESH_\Videos\text to cad\outputs\output_1766379706.step"

if doc.Objects:
    print("[FREECAD] 📦 Exporting to STL and STEP...")
    try:
        # Get the final object
        final_obj = base if 'base' in locals() else doc.Objects[-1]
        
        # Export to STL
        Mesh.export([final_obj], output_path_stl)
        print(f"[FREECAD] ✓✓✓ SUCCESS! STL exported: {output_path_stl}")
        print(f"[FREECAD] STL file size: {os.path.getsize(output_path_stl) / 1024:.2f} KB")
        
        # Export to STEP
        Part.export([final_obj], output_path_step)
        print(f"[FREECAD] ✓✓✓ SUCCESS! STEP exported: {output_path_step}")
        print(f"[FREECAD] STEP file size: {os.path.getsize(output_path_step) / 1024:.2f} KB")
        
    except Exception as e:
        print(f"[FREECAD] ✗✗✗ Export failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
else:
    print("[FREECAD] ✗✗✗ No objects to export")
    sys.exit(1)
