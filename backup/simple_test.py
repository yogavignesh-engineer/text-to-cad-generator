#!/usr/bin/env python3
import sys
sys.path.append('.')

try:
    from server import SmartParser
    parser = SmartParser()

    # Test basic parsing
    prompt = '50x50x10 plate'
    shape = parser.detect_shape(prompt)
    dims = parser.extract_dimensions(prompt)
    print(f"Basic test - Shape: {shape}, Dims: {dims}")

    # Test fillet
    prompt2 = '50x50x10 plate with 3mm fillet'
    shape2 = parser.detect_shape(prompt2)
    dims2 = parser.extract_dimensions(prompt2)
    fillets2 = parser.detect_fillets(prompt2)
    print(f"Fillet test - Shape: {shape2}, Dims: {dims2}, Fillets: {fillets2}")

    # Test gear
    prompt3 = 'gear 20 teeth'
    shape3 = parser.detect_shape(prompt3)
    dims3 = parser.extract_dimensions(prompt3)
    print(f"Gear test - Shape: {shape3}, Dims: {dims3}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()