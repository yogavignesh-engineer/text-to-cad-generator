"""
Export Manager - Handles STEP, IGES, STL format conversion
Multi-format CAD export with dimensional validation
"""

import subprocess
import asyncio
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import zipfile
import json

class ExportManager:
    """
    Manages multi-format CAD file exports with validation
    """
    
    SUPPORTED_FORMATS = {
        'stl': {'extension': '.stl', 'type': 'mesh', 'description': '3D Printing'},
        'step': {'extension': '.step', 'type': 'solid', 'description': 'CAD Software (SolidWorks, Fusion)'},
        'stp': {'extension': '.stp', 'type': 'solid', 'description': 'CAD Software (Alternative)'},
        'iges': {'extension': '.iges', 'type': 'solid', 'description': 'Legacy CAD (AutoCAD)'},
        'igs': {'extension': '.igs', 'type': 'solid', 'description': 'Legacy CAD (Alternative)'}
    }
    
    @staticmethod
    def generate_export_script(doc_obj: str, base_path: Path, formats: List[str]) -> Tuple[str, Dict[str, Path]]:
        """
        Generate FreeCAD Python script to export multiple formats
        
        Args:
            doc_obj: Name of the FreeCAD document object to export
            base_path: Base file path (will add extensions)
            formats: List of format names ('stl', 'step', 'iges')
            
        Returns:
            (export_script_code, {format: output_path})
        """
        export_script = f"""
import FreeCAD, Part, Mesh, MeshPart

doc = FreeCAD.ActiveDocument
obj = doc.getObject("{doc_obj}")

if not obj:
    print("ERROR: Object '{doc_obj}' not found")
    import sys
    sys.exit(1)

"""
        
        output_files = {}
        
        for fmt in formats:
            fmt_lower = fmt.lower()
            if fmt_lower not in ExportManager.SUPPORTED_FORMATS:
                continue
            
            ext = ExportManager.SUPPORTED_FORMATS[fmt_lower]['extension']
            output_path = base_path.with_suffix(ext)
            output_files[fmt_lower] = output_path
            
            if fmt_lower == 'stl':
                # Mesh export for STL (3D printing)
                export_script += f"""
# Export STL for 3D Printing
try:
    mesh_obj = doc.addObject("Mesh::Feature", "MeshExport")
    mesh_obj.Mesh = MeshPart.meshFromShape(
        Shape=obj.Shape, 
        LinearDeflection=0.1,  # Lower = higher quality (more triangles)
        AngularDeflection=0.5,  # In degrees
        Relative=False
    )
    mesh_obj.Mesh.write(r"{output_path}")
    print("✓ STL exported: {output_path.name}")
except Exception as e:
    print(f"✗ STL export failed: {{e}}")

"""
            
            elif fmt_lower in ['step', 'stp']:
                # Solid export for STEP (ISO 10303-21)
                export_script += f"""
# Export STEP for CAD Software
try:
    Part.export([obj], r"{output_path}")
    print("✓ STEP exported: {output_path.name}")
except Exception as e:
    print(f"✗ STEP export failed: {{e}}")

"""
            
            elif fmt_lower in ['iges', 'igs']:
                # Solid export for IGES
                export_script += f"""
# Export IGES for Legacy CAD
try:
    Part.export([obj], r"{output_path}")
    print("✓ IGES exported: {output_path.name}")
except Exception as e:
    print(f"✗ IGES export failed: {{e}}")

"""
        
        return export_script, output_files
    
    @staticmethod
    async def validate_export(file_path: Path, expected_dims: Dict, freecad_cmd: str) -> Dict:
        """
        Validate exported file maintains dimensional accuracy
        
        This is Checkpoint #3 in the validation pipeline
        
        Args:
            file_path: Path to exported file
            expected_dims: Expected dimensions from prompt
            freecad_cmd: Path to FreeCAD executable
            
        Returns:
            Validation results with actual vs expected dimensions
        """
        # Create validation script
        validation_script = f"""
import FreeCAD, Part, Mesh
import sys

try:
    file_path = r"{file_path}"
    
    if file_path.endswith('.stl'):
        mesh = Mesh.Mesh(file_path)
        bbox = mesh.BoundingBox
    else:
        # STEP/IGES
        Part.insert(file_path, "ValidationDoc")
        doc = FreeCAD.ActiveDocument
        if not doc.Objects:
            print("ERROR: No objects in file")
            sys.exit(1)
        obj = doc.Objects[0]
        bbox = obj.Shape.BoundingBox
    
    # Print dimensions in parseable format
    print(f"DIMENSION:LENGTH:{{bbox.XLength:.6f}}")
    print(f"DIMENSION:WIDTH:{{bbox.YLength:.6f}}")
    print(f"DIMENSION:HEIGHT:{{bbox.ZLength:.6f}}")
    
except Exception as e:
    print(f"ERROR: {{e}}")
    sys.exit(1)
"""
        
        # Write validation script
        validation_script_path = file_path.parent / f"validate_{file_path.stem}.py"
        validation_script_path.write_text(validation_script)
        
        try:
            # Execute FreeCAD validation
            process = await asyncio.create_subprocess_exec(
                freecad_cmd,
                str(validation_script_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            output = stdout.decode()
            
            # Parse dimensions from output
            actual_dims = {}
            for line in output.split('\n'):
                if line.startswith('DIMENSION:'):
                    parts = line.split(':')
                    if len(parts) == 3:
                        dim_name = parts[1].lower()
                        dim_value = float(parts[2])
                        actual_dims[dim_name] = dim_value
            
            # Compare with expected
            validation_results = {}
            dim_mapping = {'length': 'length', 'width': 'width', 'height': 'height'}
            
            for expected_key, actual_key in dim_mapping.items():
                if expected_key in expected_dims and actual_key in actual_dims:
                    expected_value = float(expected_dims[expected_key])
                    actual_value = actual_dims[actual_key]
                    error = abs(expected_value - actual_value)
                    
                    validation_results[expected_key] = {
                        "expected_mm": expected_value,
                        "actual_mm": actual_value,
                        "error_mm": error,
                        "tolerance_met": error < 0.01,  # ±0.01mm engineering tolerance
                        "error_percentage": (error / expected_value * 100) if expected_value > 0 else 0
                    }
            
            # Overall validation status
            all_valid = all(v['tolerance_met'] for v in validation_results.values())
            
            return {
                "file": file_path.name,
                "valid": all_valid,
                "dimensions": validation_results,
                "message": "✓ All dimensions within tolerance" if all_valid else "⚠ Some dimensions exceed tolerance"
            }
            
        except Exception as e:
            return {
                "file": file_path.name,
                "valid": False,
                "error": str(e),
                "message": f"✗ Validation failed: {str(e)}"
            }
        finally:
            # Cleanup validation script
            if validation_script_path.exists():
                validation_script_path.unlink()
    
    @staticmethod
    def create_zip_package(files: Dict[str, Path], output_path: Path) -> Path:
        """
        Create ZIP file containing multiple export formats
        
        Args:
            files: {format: file_path}
            output_path: Output ZIP file path
            
        Returns:
            Path to created ZIP file
        """
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for fmt, file_path in files.items():
                if file_path.exists():
                    zipf.write(file_path, file_path.name)
        
        return output_path
    
    @staticmethod
    def get_format_recommendations() -> Dict[str, str]:
        """
        Return format recommendations for different use cases
        """
        return {
            "3d_printing": ["stl"],
            "cad_software": ["step", "stl"],
            "all_formats": ["step", "iges", "stl"],
            "solidworks": ["step"],
            "fusion360": ["step"],
            "autocad": ["iges", "step"],
            "freecad": ["step", "stl"]
        }
