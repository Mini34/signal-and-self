"""Regression checks for malformed reflection authoring records."""
import copy
import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import validate_site


class ReflectionValidationTest(unittest.TestCase):
    def test_current_records_are_valid(self):
        self.assertEqual(validate_site.validate_reflection(), [])

    def check_bad_id(self, value):
        data = copy.deepcopy(validate_site.build_site.REFLECTION)
        if value is None:
            data['topics'][0].pop('id')
        else:
            data['topics'][0]['id'] = value
        output = io.StringIO()
        with patch.object(validate_site.build_site, 'REFLECTION', data), redirect_stdout(output):
            self.assertEqual(validate_site.main(), 1)
        self.assertIn('four unique topics', output.getvalue())
        self.assertNotIn('Traceback', output.getvalue())

    def test_missing_id_reports_failure_without_generating_invalid_content(self):
        self.check_bad_id(None)

    def test_unknown_id_reports_failure(self):
        self.check_bad_id('unsupported')


if __name__ == '__main__':
    unittest.main()
