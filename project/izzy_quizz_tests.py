"""
@Fileoverview: 
This is the main test module for izz_quizz.py
Should test all endpoints/functions to ensure
that they return the required values
"""


import os
import izzy_quizz
import unittest
import tempfile


class IzzyQuizzTestCase(unittest.TestCase):
    def setUp(self):
        izzy_quizz.app.testing = True
        self.app = izzy_quizz.app.test_client()
        print("Tests set up")

    def tearDown(self):
        print("Tests finished")

    def test_root_endpoint(self):
        print("Testing the root endpoint")
        rv = self.app.get('/')
        self.assertEqual(
            rv.data,
            "<html><b>It works!</b></html>",
            "Incorrect return value from the root endpoint")
        assert rv.data != "<b>It works!</b>"


if __name__ == '__main__':
    unittest.main()
