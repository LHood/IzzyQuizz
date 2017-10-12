"""
@Fileoverview:
    This contains the main server code for the project
"""

import logging
import os
import sys
import json
import httplib2

from flask import Flask, Response, request, session, g, redirect, url_for, \
        abort, render_template, flash, send_from_directory, jsonify

from apiclient import discovery
from oauth2client import client
import requests
app = Flask(__name__)

from google.cloud import datastore
import time
datastore_client = datastore.Client()

dir_path = os.path.dirname(os.path.realpath(__file__))

questions_path = 'data/questions.json'
results_path = 'data/results.json'

with open(questions_path, "r") as questions_file:
    questions_data = json.loads(questions_file.read())
with open(results_path, "r") as results_file:
    results_data = json.loads(results_file.read())

@app.route('/closure/<path:path>')
def serve_closure(path):
    return send_from_directory('static/closure-library/closure', path)
@app.route('/jasmine/<path:path>')
def serve_jasmine(path):
    return send_from_directory('jasmine', path)
@app.route('/js/<path:path>')

def serve_js_content(path):
    return send_from_directory('js', path)

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

@app.route('/manage')
def send_manage_page():
    if 'credentials' in session:
        return render_template('manage.html')
    return redirect(url_for('index'))

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
        save_user()
        return redirect(url_for('index'))

def save_user():
    created_at = int(time.time()//1000)
    kind = 'user'
    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    access_token = credentials.access_token
    info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+access_token
    user_info = requests.get(info_link).content.decode()
    
    task_key = datastore_client.key(kind, json.loads(user_info)['id'])
    task = datastore.Entity(key=task_key)

    task['info'] = user_info
    datastore_client.put(task)

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
Oauth2 Logout and revoke functionality
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
    return redirect(url_for('index'))

@app.route('/logout')
def logout_user():
    if 'credentials' in session:
        del(session['credentials'])
    return redirect(url_for('index'))

"""
Results data endpoint.
This receives requests to retrieve or update results
data as users respond to questions that they are asked
"""
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

@app.route('/question/new', methods=['POST'])
def save_question():
    if request.method == 'POST':
        data = json.loads(request.data.decode())
        title = data['title']
        answer = data['answer']
        options = list(data['extra_options'])
        created_at = int(time.time())

        kind = 'question'
        task_key = datastore_client.key(kind, created_at)
        task = datastore.Entity(key=task_key)
        task['title'] = title
        task['answer'] = answer
        task['options'] = options
        task['question_id'] = created_at
        task['created_at'] = created_at
        datastore_client.put(task)
        return str({'success'})

@app.route('/questions/all')
def send_all_questions():
    query = datastore_client.query(kind='question')
    results = list(query.fetch())
    response = []
    for result in results:
        obj = {}
        obj['title'],obj['answer'],obj['options'],obj['created_at'] = \
                result['title'],result['answer'],result['options'],result['created_at']
        response.append(obj)
    return jsonify(response)
@app.route('/rounds/new', methods=['POST'])
def create_round():
    if request.method == 'POST':
        title = request.get('title')
        questions = request.get('questions')
        try:
            order = request.get('order')
        except:
            order = 5
        created_at = int(time.time()//1000)
        kind = 'round'
        task_key = datastore_client.key(kind, created_at)
        task = datastore.Entity(key=task_key)
        task['title'] = title
        task['questions'] = list(questions)
        task['order'] = order
        task['created_at'] = created_at
        task['active'] = False
        datastore_client.put(task)

@app.route('/rounds/all')
def send_all_rounds():
    query = datastore_client.query(kind='round')
    results = list(query.fetch())
    response = []
    for result in results:
        new_dict = {}
        for k in result:
            new_dict[k] = result[k]
        response.append(new_dict)
    return json.dumps(response)

@app.route('/rounds/current')
def send_current_rounds():
    query = datastore_client.query(kind='round')
    query.add_filter('active', '=', True)

    results = list(query.fetch())
    response = []
    for result in result:
        new_dict = {}
        for k in result:
            new_dict[k] = result[k]
        response.append(new_dict)
    return json.dumps(response)

@app.route('/users/all')
def send_all_users():
    query = datastore_client.query(kind='user')
    results = list(query.fetch())
    response = []
    for result in results:
        if 'info' in result:
            response.append(result['info'])
            print(json.loads(result['info']))
    return json.dumps(response)


app.secret_key = 'super-secret-key'
app.config['SESSION_TYPE'] = 'filesystem'

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0',port=5000, threaded=True)
