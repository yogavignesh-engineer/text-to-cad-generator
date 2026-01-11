#!/usr/bin/env python3
"""
Comprehensive Test Suite for NeuralCAD v4.0
Tests all 20+ features to ensure 95%+ accuracy
"""

import requests
import time
from pathlib import Path

API_URL = "http://127.0.0.1:8000"

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def test_prompt(prompt, description):
    """Test a single prompt"""
    print(f"\n{BLUE}{'='*60}{END}")
    print(f"{YELLOW}TEST: {description}{END}")
    print(f"Prompt: '{prompt}'")
    print(f"{BLUE}{'='*60}{END}")
    
    try:
        # Validate first
        response = requests.post(
            f"{API_URL}/validate",
            json={"text": prompt}
        )
        
        if response.ok:
            data = response.json()
            print(f"{GREEN}✓ Validation passed{END}")
            print(f"  Shape: {data['shape']}")
            print(f"  Dimensions: {data['dimensions']}")
            print(f"  Features: {data['features']}")
        
        # Generate
        start_time = time.time()
        response = requests.post(
            f"{API_URL}/generate",
            json={"text": prompt, "use_ai": False}
        )
        elapsed = time.time() - start_time
        
        if response.ok:
            # Save STL
            output_path = Path(f"outputs/test_{int(time.time())}.stl")
            output_path.write_bytes(response.content)
            
            file_size = output_path.stat().st_size / 1024
            
            print(f"{GREEN}✓✓✓ SUCCESS!{END}")
            print(f"  Time: {elapsed:.2f}s")
            print(f"  File: {output_path}")
            print(f"  Size: {file_size:.2f} KB")
            return True
        else:
            print(f"{RED}✗ Generation failed{END}")
            print(f"  Status: {response.status_code}")
            print(f"  Error: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"{RED}✗✗✗ ERROR: {e}{END}")
        return False


def run_all_tests():
    """Run comprehensive test suite"""
    
    print(f"\n{GREEN}{'='*80}")
    print("🚀 NeuralCAD v4.0 - Comprehensive Test Suite")
    print(f"{'='*80}{END}\n")
    
    tests = [
        # BASIC SHAPES
        ("50x50x10 plate", "Basic Box"),
        ("cylinder 20mm diameter 100mm height", "Basic Cylinder"),
        ("sphere 50mm diameter", "Basic Sphere"),
        
        # GEARS (CRITICAL TEST)
        ("gear 20 teeth 60mm diameter 10mm height", "Precision Gear with Teeth"),
        ("gear 30 teeth", "Gear with default dimensions"),
        
        # FILLETS (CRITICAL TEST)
        ("50x50x10 plate with 5mm fillet", "Box with Fillet"),
        ("100x100x20 block with 3mm fillet on all edges", "Large fillet"),
        
        # CHAMFERS (CRITICAL TEST)
        ("50x50x10 plate with 3mm chamfer", "Box with Chamfer"),
        ("80x80x15 block with 2mm chamfer", "Chamfered block"),
        
        # HOLES
        ("50x50x10 plate with 5mm hole at center", "Center hole"),
        ("100x100x10 plate with 4 corner holes 5mm", "Corner holes"),
        
        # THREADED HOLES (CRITICAL TEST)
        ("50x50x10 plate with M6 threaded hole at center", "M6 thread"),
        ("M8 threaded hole", "M8 thread standalone"),
        
        # TUBES
        ("tube 20mm outer diameter 2mm wall thickness 100mm long", "Precision tube"),
        
        # COMPLEX ASSEMBLIES
        ("piston 60mm diameter 80mm height", "Piston"),
        ("flange coupling 60mm diameter 40mm long", "Flange coupling"),
        ("crankshaft 120mm long", "Crankshaft"),
        ("camshaft 100mm long with 4 lobes", "Camshaft"),
        
        # COMBINED FEATURES
        ("50x50x10 plate with 5mm fillet and 5mm hole at center", "Fillet + Hole"),
        ("gear 25 teeth 70mm diameter with M8 center hole", "Gear + Thread"),
    ]
    
    results = []
    for prompt, description in tests:
        success = test_prompt(prompt, description)
        results.append((description, success))
        time.sleep(1)  # Rate limiting
    
    # Summary
    print(f"\n{BLUE}{'='*80}")
    print("📊 TEST SUMMARY")
    print(f"{'='*80}{END}\n")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    accuracy = (passed / total) * 100
    
    for desc, success in results:
        status = f"{GREEN}✓ PASS{END}" if success else f"{RED}✗ FAIL{END}"
        print(f"{status}  {desc}")
    
    print(f"\n{BLUE}{'='*80}{END}")
    print(f"Total: {total} tests")
    print(f"Passed: {GREEN}{passed}{END}")
    print(f"Failed: {RED}{total - passed}{END}")
    print(f"Accuracy: {GREEN if accuracy >= 95 else RED}{accuracy:.1f}%{END}")
    print(f"{BLUE}{'='*80}{END}\n")
    
    if accuracy >= 95:
        print(f"{GREEN}🎉 EXCELLENT! System ready for production{END}\n")
    elif accuracy >= 80:
        print(f"{YELLOW}⚠️  Good, but needs improvement{END}\n")
    else:
        print(f"{RED}❌ Critical issues found{END}\n")


if __name__ == "__main__":
    run_all_tests()