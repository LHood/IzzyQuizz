"""
@Fileoverview:
This is the main test module for izz_quizz.py
Should test all endpoints/functions to ensure
that they return the required values
"""


import os
import server
import unittest
import tempfile
import json


class Endpoints(unittest.TestCase):
    def setUp(self):
        server.app.testing = True
        self.app = server.app.test_client()

    def test_root_endpoint(self):
        rv = self.app.get('/')
        self.assertEqual(
            rv.status,
            '302 FOUND',
            " unexpected status code from the root")

    def test_oauth2callback(self):
        rv = self.app.get('/oauth2callback')
        print('oauth_callback: \n', rv.data)

    def test_questions_endpoint(self):
        rv = self.app.get('/questions')
        with open('data/questions.json', 'r') as my_questions:
            expected_questions = json.loads(my_questions.read())
        self.assertEqual(
            rv.data,
            str(expected_questions),
            "Incorrect return value from the questions endpoint")

    def test_results_template_endpoint(self):
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
    unittest.main(verbosity=2)
