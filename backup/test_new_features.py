#!/usr/bin/env python3
"""
Test script for the expanded text-to-CAD features
"""

import sys
import os
sys.path.append('.')

from server import SmartParser, CodeGenerator

def test_new_features():
    """Test the new mechanical features"""

    parser = SmartParser()

    # Test cases for new features
    test_cases = [
        # Tubes
        "20mm outer diameter tube with 2mm wall thickness, 100mm long",

        # L-brackets
        "L-bracket 50mm tall, 50mm wide, 10mm thick",

        # Fillets
        "50x50x10 plate with 3mm fillet on all edges",

        # Chamfers
        "50x50x10 block with 2mm chamfer",

        # Coordinate-based holes
        "50x50x10 plate with 5mm hole at coordinate (10, 10)",

        # Complex L-bracket with holes
        "Make an L-bracket that is 50mm tall, 50mm wide, 10mm thick, with two 5mm mounting holes on the bottom flange."
    ]

    for i, prompt in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"TEST {i}: {prompt}")
        print('='*60)

        # Parse
        shape = parser.detect_shape(prompt)
        dims = parser.extract_dimensions(prompt)
        holes = parser.detect_holes(prompt)
        fillets = parser.detect_fillets(prompt)
        chamfers = parser.detect_chamfers(prompt)

        print(f"Shape: {shape}")
        print(f"Dimensions: {dims}")
        print(f"Holes: {len(holes)}")
        print(f"Fillets: {len(fillets)}")
        print(f"Chamfers: {len(chamfers)}")

        # Generate code
        try:
            code = CodeGenerator.generate(shape, dims, holes, fillets, chamfers)
            print(f"✓ Code generated ({len(code)} chars)")
        except Exception as e:
            print(f"✗ Code generation failed: {e}")

if __name__ == "__main__":
    test_new_features()