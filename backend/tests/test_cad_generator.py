
import unittest
import os
import shutil
from unittest.mock import patch

# Adjust the import path for testing within the package structure
from ..cad_generator import generate_plate, generate_shaft, generate_bracket, generate_flange
from ..cad_templates import PlateTemplate, ShaftTemplate, BracketTemplate, FlangeTemplate

# Mock cadquery.exporters.export to prevent actual file creation during tests
# Or, create a temporary directory for test outputs

class TestCADGenerator(unittest.TestCase):

    def setUp(self):
        self.output_dir = "test_outputs"
        os.makedirs(self.output_dir, exist_ok=True)
        # Patch the cq.exporters.export method if we want to avoid actual file generation for some tests
        # For these tests, we want to ensure files are *attempted* to be created,
        # so we'll let it run and clean up afterwards.
        # Ensure cadquery is imported before patching if using patch.
        # Alternatively, manage temporary files directly.

    def tearDown(self):
        if os.path.exists(self.output_dir):
            shutil.rmtree(self.output_dir)

    def test_generate_plate(self):
        plate_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 100, "width": 60, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}
        }
        file_path = generate_plate(plate_data, output_dir=self.output_dir)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(file_path.endswith(".step"))
        # Add more assertions if possible, e.g., check file size > 0

        # Test with invalid data, expect ValueError from template validation
        invalid_plate_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 10, "width": 5, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}
        }
        with self.assertRaises(ValueError):
            generate_plate(invalid_plate_data, output_dir=self.output_dir)

    def test_generate_shaft(self):
        shaft_data = {
            "template": "shaft", "units": "mm", "material": "steel",
            "params": {"length": 120, "diameter": 25, "step_diameter": 18, "step_length": 40}
        }
        file_path = generate_shaft(shaft_data, output_dir=self.output_dir)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(file_path.endswith(".step"))

        invalid_shaft_data = {
            "template": "shaft", "units": "mm", "material": "steel",
            "params": {"length": 120, "diameter": 25, "step_diameter": 25, "step_length": 40}
        }
        with self.assertRaises(ValueError):
            generate_shaft(invalid_shaft_data, output_dir=self.output_dir)

    def test_generate_bracket(self):
        bracket_data = {
            "template": "bracket", "units": "mm", "material": "aluminum",
            "params": {"leg1_length": 80, "leg2_length": 60, "thickness": 10, "hole_diameter": 8}
        }
        file_path = generate_bracket(bracket_data, output_dir=self.output_dir)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(file_path.endswith(".step"))

        invalid_bracket_data = {
            "template": "bracket", "units": "mm", "material": "aluminum",
            "params": {"leg1_length": 10, "leg2_length": 60, "thickness": 10, "hole_diameter": 8}
        }
        with self.assertRaises(ValueError):
            generate_bracket(invalid_bracket_data, output_dir=self.output_dir)

    def test_generate_flange(self):
        flange_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        file_path = generate_flange(flange_data, output_dir=self.output_dir)
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(file_path.endswith(".step"))

        invalid_flange_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 120, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        with self.assertRaises(ValueError):
            generate_flange(invalid_flange_data, output_dir=self.output_dir)

if __name__ == '__main__':
    unittest.main()
