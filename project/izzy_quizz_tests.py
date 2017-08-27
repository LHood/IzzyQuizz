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
import json


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

    def test_questions_endpoint(self):
        print("Testing Quesitons Endpoint")
        rv = self.app.get('/questions')
        with open('data/questions.json', 'r') as my_questions:
            expected_questions = json.loads(my_questions.read())
        self.assertEqual(
            rv.data,
            str(expected_questions),
            "Incorrect return value from the questions endpoint")

    def test_results_endpoint(self):
        print("Testing results endpoint")
        rv = self.app.get('/results')
        with open('templates/results.html') as results_file:
            expected_file = results_file.read()
        self.assertEquals(
            rv.data,
            str(expected_file),
            "Incorerect results file returned")

    def test_results_data_endpoint(self):
        # Initially test just with the Method
        rv = self.app.get('/results_data')
        with open('data/results.json', 'r') as my_results:
            expected_results = json.loads(my_results.read())
        self.assertEqual(
            rv.data,
            str(expected_results),
            'Incorrect return value from the results endpoint with GET method')
        # Now test the post method
        rv = self.app.post('/results_data')
        with open('data/results.json', 'r') as my_results:
            expected_results = json.loads(my_results.read())
        self.assertEqual(
            rv.data,
            str(expected_results),
            'Incorrect return value from the results endpoint with POST method')


if __name__ == '__main__':
    unittest.main()
