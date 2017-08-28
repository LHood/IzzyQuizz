"""
@Fileoverview:
    This contains the main server code for the project
"""

import os
import sys
import json

from flask import Flask, Response, request, session, g, redirect, url_for, abort, render_template, flash

app = Flask(__name__)

questions_path = 'data/questions.json'
results_path = 'data/results.json'
with open(questions_path, "r") as questions_file:
    questions_data = json.loads(questions_file.read())
with open(results_path, "r") as results_file:
    results_data = json.loads(results_file.read())


@app.route('/')
def respond():
    return "<html><b>It works!</b></html>"


"""
Questions Endpoint
"""
@app.route('/questions')
def send_questions():
    return str(questions_data)


"""
Results Endpoint
"""
@app.route('/results')
def send_results():
    with open('templates/results.html') as results_file:
        return_value = str(results_file.read())
    return return_value


"""
Results data endpoint.
This receives requests to retrieve or update results
data as users respond to questions that they are asked
"""
@app.route('/results_data', methods=['GET', 'POST'])
def handle_results_dataf():
    if request.method == 'POST':
        # Handle the post stuff

        # Update the database with the data that we have
        #results_file = open(results_path, "w")
        # results_file.write(str(results_data))
        pass
    if request.method == 'GET':
        # handle the get stuff
        pass
    return str(results_data)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
