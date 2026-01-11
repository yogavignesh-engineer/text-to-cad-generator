
import unittest
import os
from ..cad_templates import (
    CADTemplate,
    PlateTemplate,
    ShaftTemplate,
    BracketTemplate,
    FlangeTemplate,
    create_template_object
)

class TestCADTemplates(unittest.TestCase):

    def test_cad_template_base_validation(self):
        # Test valid base template
        valid_data = {
            "template": "plate",
            "units": "mm",
            "material": "steel",
            "params": {}
        }
        template = CADTemplate(valid_data)
        template.validate() # Should not raise error

        # Test invalid template type
        invalid_type_data = {
            "template": "invalid_type",
            "units": "mm",
            "material": "steel",
            "params": {}
        }
        with self.assertRaisesRegex(ValueError, "Invalid template type"):
            template = CADTemplate(invalid_type_data)
            template.validate()

        # Test invalid units
        invalid_units_data = {
            "template": "plate",
            "units": "cm",
            "material": "steel",
            "params": {}
        }
        with self.assertRaisesRegex(ValueError, "Unsupported units"):
            template = CADTemplate(invalid_units_data)
            template.validate()

        # Test invalid material
        invalid_material_data = {
            "template": "plate",
            "units": "mm",
            "material": "wood",
            "params": {}
        }
        with self.assertRaisesRegex(ValueError, "Unsupported material"):
            template = CADTemplate(invalid_material_data)
            template.validate()

    def test_plate_template_validation(self):
        # Valid plate
        valid_plate_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 100, "width": 60, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}
        }
        plate = PlateTemplate(valid_plate_data)
        plate.validate() # Should not raise error

        # Invalid hole_diameter (too large)
        invalid_hole_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 10, "width": 5, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}
        }
        with self.assertRaisesRegex(ValueError, "Hole diameter must be less than min"):
            plate = PlateTemplate(invalid_hole_data)
            plate.validate()
        
        # Invalid dimensions (zero or negative)
        invalid_dim_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 0, "width": 60, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}
        }
        with self.assertRaisesRegex(ValueError, "Length, width, and thickness must be positive numbers."):
            plate = PlateTemplate(invalid_dim_data)
            plate.validate()

        # Invalid hole_position
        invalid_pos_data = {
            "template": "plate", "units": "mm", "material": "steel",
            "params": {"length": 100, "width": 60, "thickness": 10, "hole_diameter": 10, "hole_position": "corner"}
        }
        with self.assertRaisesRegex(ValueError, "Unsupported hole_position"):
            plate = PlateTemplate(invalid_pos_data)
            plate.validate()


    def test_shaft_template_validation(self):
        # Valid shaft
        valid_shaft_data = {
            "template": "shaft", "units": "mm", "material": "steel",
            "params": {"length": 120, "diameter": 25, "step_diameter": 18, "step_length": 40}
        }
        shaft = ShaftTemplate(valid_shaft_data)
        shaft.validate()

        # Invalid step_diameter (too large)
        invalid_step_dia_data = {
            "template": "shaft", "units": "mm", "material": "steel",
            "params": {"length": 120, "diameter": 25, "step_diameter": 25, "step_length": 40}
        }
        with self.assertRaisesRegex(ValueError, "Step diameter must be less than main diameter."):
            shaft = ShaftTemplate(invalid_step_dia_data)
            shaft.validate()

        # Invalid step_length (too large)
        invalid_step_len_data = {
            "template": "shaft", "units": "mm", "material": "steel",
            "params": {"length": 120, "diameter": 25, "step_diameter": 18, "step_length": 120}
        }
        with self.assertRaisesRegex(ValueError, "Step length must be less than total length."):
            shaft = ShaftTemplate(invalid_step_len_data)
            shaft.validate()

    def test_bracket_template_validation(self):
        # Valid bracket
        valid_bracket_data = {
            "template": "bracket", "units": "mm", "material": "aluminum",
            "params": {"leg1_length": 80, "leg2_length": 60, "thickness": 10, "hole_diameter": 8}
        }
        bracket = BracketTemplate(valid_bracket_data)
        bracket.validate()

        # Invalid thickness (too large)
        invalid_thickness_data = {
            "template": "bracket", "units": "mm", "material": "aluminum",
            "params": {"leg1_length": 10, "leg2_length": 60, "thickness": 10, "hole_diameter": 8}
        }
        with self.assertRaisesRegex(ValueError, "Thickness must be less than both leg lengths."):
            bracket = BracketTemplate(invalid_thickness_data)
            bracket.validate()

        # Invalid hole_diameter (too large)
        invalid_hole_dia_data = {
            "template": "bracket", "units": "mm", "material": "aluminum",
            "params": {"leg1_length": 80, "leg2_length": 60, "thickness": 10, "hole_diameter": 20}
        }
        with self.assertRaisesRegex(ValueError, "Hole diameter must be less than 1.5 times the thickness."):
            bracket = BracketTemplate(invalid_hole_dia_data)
            bracket.validate()

    def test_flange_template_validation(self):
        # Valid flange
        valid_flange_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        flange = FlangeTemplate(valid_flange_data)
        flange.validate()

        # Invalid inner_diameter (too large)
        invalid_inner_dia_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 120, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        with self.assertRaisesRegex(ValueError, "Inner diameter must be less than outer diameter."):
            flange = FlangeTemplate(invalid_inner_dia_data)
            flange.validate()

        # Invalid bolt_circle_diameter (outside range)
        invalid_bcd_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 40, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        with self.assertRaisesRegex(ValueError, "Bolt circle diameter must be between inner and outer diameters."):
            flange = FlangeTemplate(invalid_bcd_data)
            flange.validate()

        invalid_bcd_data_2 = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 130, "bolt_count": 4, "bolt_hole_diameter": 10}
        }
        with self.assertRaisesRegex(ValueError, "Bolt circle diameter must be between inner and outer diameters."):
            flange = FlangeTemplate(invalid_bcd_data_2)
            flange.validate()
        
        # Invalid bolt_count (zero or negative)
        invalid_bolt_count_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 0, "bolt_hole_diameter": 10}
        }
        with self.assertRaisesRegex(ValueError, "Bolt count must be a positive integer."):
            flange = FlangeTemplate(invalid_bolt_count_data)
            flange.validate()
        
        # Invalid bolt_hole_diameter (too large)
        invalid_bhd_data = {
            "template": "flange", "units": "mm", "material": "steel",
            "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 10, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 20}
        }
        with self.assertRaisesRegex(ValueError, "Bolt hole diameter must be less than 1.5 times the thickness."):
            flange = FlangeTemplate(invalid_bhd_data)
            flange.validate()

    def test_create_template_object(self):
        # Test creation of different template types
        plate_data = {"template": "plate", "units": "mm", "material": "steel", "params": {"length": 100, "width": 60, "thickness": 10, "hole_diameter": 10, "hole_position": "center"}}
        self.assertIsInstance(create_template_object(plate_data), PlateTemplate)

        shaft_data = {"template": "shaft", "units": "mm", "material": "steel", "params": {"length": 120, "diameter": 25, "step_diameter": 18, "step_length": 40}}
        self.assertIsInstance(create_template_object(shaft_data), ShaftTemplate)
        
        bracket_data = {"template": "bracket", "units": "mm", "material": "aluminum", "params": {"leg1_length": 80, "leg2_length": 60, "thickness": 10, "hole_diameter": 8}}
        self.assertIsInstance(create_template_object(bracket_data), BracketTemplate)

        flange_data = {"template": "flange", "units": "mm", "material": "steel", "params": {"outer_diameter": 120, "inner_diameter": 50, "thickness": 12, "bolt_circle_diameter": 90, "bolt_count": 4, "bolt_hole_diameter": 10}}
        self.assertIsInstance(create_template_object(flange_data), FlangeTemplate)

        # Test unknown template type
        unknown_data = {"template": "unknown", "units": "mm", "material": "steel", "params": {}}
        with self.assertRaisesRegex(ValueError, "Unknown template type"):
            create_template_object(unknown_data)


if __name__ == '__main__':
    unittest.main()
