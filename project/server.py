"""
@Fileoverview:
    This contains the main server code for the project
"""

import logging
import os
import sys
import json
import httplib2

from flask import Flask, Response, request, session, g, redirect, url_for, abort, render_template, flash

from apiclient import discovery
from oauth2client import client
import requests
app = Flask(__name__)

dir_path = os.path.dirname(os.path.realpath(__file__))

questions_path = 'data/questions.json'
results_path = 'data/results.json'
with open(questions_path, "r") as questions_file:
    questions_data = json.loads(questions_file.read())
with open(results_path, "r") as results_file:
    results_data = json.loads(results_file.read())


@app.route('/')
def index():
    if 'credentials' not in session:
        return render_template('home.html')
    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    if credentials.access_token_expired:
        return render_template('home.html')
    else:
        access_token = credentials.access_token
        info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+access_token
        user_info = requests.get(info_link).content.decode()
        user_info = json.loads(user_info)
        return render_template('quiz.html',user_info=user_info)

@app.route('/user')
def send_creds():
    try:
        assert 'credentials' in session
    except:
        return "credentials expired. Please go back to the home page to login"
    
    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    access_token = credentials.access_token
    info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+access_token
    user_info = requests.get(info_link).content.decode()
    return user_info

@app.route('/<filename>'+'.html')
def return_template(filename):
    if 'credentials' not in session:
        return render_template('home.html')
    return render_template(filename+'.html')

@app.route('/oauth2callback')
def oauth2callback():
    flow = client.flow_from_clientsecrets('client_secrets.json',
    scope = 'https://www.googleapis.com/auth/userinfo.profile',
    redirect_uri=url_for('oauth2callback', _external=True))
    flow.params['include_granted_scopes'] = 'true'

    if 'code' not in request.args:
        auth_uri = flow.step1_get_authorize_url()
        return redirect(auth_uri)
    else:
        auth_code = request.args.get('code')
        credentials = flow.step2_exchange(auth_code)
        session['credentials'] = credentials.to_json()
        return redirect(url_for('index'))

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
@app.route('/revoke')
def revoke_permissions():
    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    try:
        credentials.revoke(httplib2.Http())
    except:
        pass
    if 'credentials' in session:
        del(session['credentials'])
    return 'logout successful'

@app.route('/results_data', methods=['GET', 'POST'])
def handle_results_dataf():
    with open('super_users.json', 'r') as f:
        super_users = json.load(f)
    user = requests.get('http://127.0.0.1:5000/user').content.decode()
    print('user: \n', user)
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

app.secret_key = 'super-secret-key'
app.config['SESSION_TYPE'] = 'filesystem'

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0',port=5000, threaded=True)
