"""
@Fileoverview:
    This contains the main server code for the project
"""

import logging
import os
import sys
import json
import httplib2
import time

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
        info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token
        user_info = requests.get(info_link).content.decode()
        user_info = json.loads(user_info)
        return render_template('quiz.html', user_info=user_info)


@app.route('/user')
def send_creds():
    return jsonify(get_user_info())

def get_user_info():
    try:
        assert 'credentials' in session
    except BaseException:
        return "credentials expired. Please go back to the home page to login"

    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    access_token = credentials.access_token
    info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token
    user_info = requests.get(info_link).content.decode()
    return user_info


@app.route('/manage')
def send_manage_page():
    if 'credentials' in session:
        return render_template('manage.html')
    return redirect(url_for('index'))


@app.route('/<filename>' + '.html')
def return_template(filename):
    if 'credentials' not in session:
        return render_template('home.html')
    return render_template(filename + '.html')


@app.route('/oauth2callback')
def oauth2callback():
    flow = client.flow_from_clientsecrets(
        'client_secrets.json',
        scope='https://www.googleapis.com/auth/userinfo.profile',
        redirect_uri=url_for(
            'oauth2callback',
            _external=True))
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
    created_at = int(time.time() // 1000)
    kind = 'user'
    credentials = client.OAuth2Credentials.from_json(session['credentials'])
    access_token = credentials.access_token
    info_link = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token
    user_info = requests.get(info_link).content.decode()

    task_key = datastore_client.key(kind, json.loads(user_info)['id'])
    task = datastore.Entity(key=task_key)

    task['info'] = user_info
    datastore_client.put(task)


"""
Results Endpoint, allowing the users to see what they got in the quiz
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
    except BaseException:
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
    if request.method == 'POST':
        # Handle the post stuff

        # Update the database with the data that we have
        #results_file = open(results_path, "w")
        # results_file.write(str(results_data))
        pass
    if request.method == 'GET':
        # handle the get stuff
        pass
    return []

@app.route('/question/new/<created_at>', methods=['POST'])
def save_question(created_at):
    created_at = int(created_at)
    if request.method == 'POST':
        data = json.loads(request.data.decode())
        title = data['title']
        answer = data['answer']
        options = list(data['extra_options'])
        rounds = list(data['rounds'])
        kind = 'question'
        task_key = datastore_client.key(kind, created_at)
        task = datastore.Entity(key=task_key)
        task['title'] = title
        task['answer'] = answer
        task['options'] = options
        task['question_id'] = created_at
        task['created_at'] = created_at
        task['rounds'] = rounds
        datastore_client.put(task)
        return jsonify(str({'success'}))


@app.route('/question/delete/<created_at>', methods=["POST"])
def delete_question(created_at):
    created_at = int(created_at)
    data = json.loads(request.data.decode())
    kind = 'question'
    task_key = datastore_client.key(kind, created_at)
    current = datastore_client.get(task_key)
    datastore_client.delete(task_key)
    current = datastore_client.get(task_key)
    return jsonify({'response': 'success'});


@app.route('/questions/all')
def send_all_questions():
    query = datastore_client.query(kind='question')
    results = list(query.fetch())
    response = []
    for result in results:
        obj = {}
        obj['title'], obj['answer'], obj['options'], obj['created_at'], obj['rounds'] = \
            result['title'], result['answer'], result['options'], result['created_at'], result['rounds']
        response.append(obj)
    return jsonify(response)

@app.route('/questions/current')
def send_current_questions():
    task_key = datastore_client.key('activator', 'quiz')
    quiz = datastore_client.get(task_key)
    if quiz is None:
        return jsonify([])
    else:
        status = quiz['status']
        if int(status) != 1:
            return jsonify([])
    
    #if yes, check the current round
    task_key = datastore_client.key('activator', 'round')
    round_info = datastore_client.get(task_key)
    if round_info is None:
        return jsonify([])
    current_round = round_info['current_round']
    
    #Now, find questions with the current round
    query = datastore_client.query(kind='question')
    results = list(query.fetch())
    response = []
    for result in results:
        rounds = result['rounds']
        if str(current_round) in rounds:
            obj = {}
            obj['title'],obj['answer'],obj['options'],obj['created_at'] = \
                    result['title'],result['answer'],result['options'],result['created_at']
            response.append(obj)
    return jsonify(response)

@app.route('/quiz/status')
def send_quiz_status():
    # check if quiz iz active.
    task_key = datastore_client.key('activator', 'quiz')
    quiz = datastore_client.get(task_key)
    if quiz is None:
        return jsonify({'quiz_status': 0})
    else:
        status = quiz['status']
        if int(status) != 1:
            return jsonify({'quiz_status': 0})

    # if yes, check the current round
    task_key = datastore_client.key('activator', 'round')
    round_info = datastore_client.get(task_key)
    if round_info is None:
        return jsonify({'quiz_status': 0})
    current = round_info['current_round']
    return jsonify({'quiz_status': 1, 'current_round': current});


@app.route('/round/activate/<round_name>', methods=['POST'])
def activate_round(round_name):
    kind = 'activator'
    name = 'round'
    task_key = datastore_client.key(kind, name)
    task = datastore.Entity(task_key)
    task['current_round'] = round_name
    datastore_client.put(task)
    return jsonify(['success'])


@app.route('/quiz/activate/<boolean>', methods=['POST'])
def activate_quiz(boolean):
    kind = 'activator'
    name = 'quiz'
    task_key = datastore_client.key(kind, name)
    task = datastore.Entity(task_key)
    task['status'] = boolean
    datastore_client.put(task)
    return jsonify(['success'])

"""
Grades functionality, that stores users grades to the backend, and manages the returning
Of the results to be displayed on the main board
"""
@app.route('/submit', methods=['POST'])
def save_user_results():
    user_info = json.loads(get_user_info());
    data = json.loads(request.data.decode())
    kind = 'result'
    current_round = data['round']
    user_points = data['points']
    total_points = data['total']
    user_id = user_info['id']
    task_key = datastore_client.key('result', str(user_id)+"_"+str(current_round))
    current_result = datastore_client.get(task_key)
    if current_result is not None:
        points = current_result['points']
        return jsonify(['Keeping the score of '+str(points)+' that you had before '])
    task = datastore.Entity(task_key)
    task['round'] = current_round
    task['points']  = user_points
    task['total_points'] = total_points
    task['user_id'] = user_id
    datastore_client.put(task)
    return jsonify(['Your score has been submitted'])

@app.route('/results')
def render_results_file():
    return render_template('results.html')

@app.route('/results/data')
def send_user_results():
    #Load all users database
    users = get_all_users();
    users_data = {}

    for user in users:
        user_id = int(json.loads(user)['id'])
        users_data[user_id] = user


    user_results = retrieve_user_results();
    response = {}

    for result in user_results:
        user_id = int(result['user_id'])
        if not user_id in response:
            # First load the points
            response[user_id] = {}
            points = sum([int(result_['points']) for result_ in user_results if int(result_['user_id']) == user_id])
            response[user_id]['points'] = points

            #Now load the user Picture
            picture_link = json.loads(users_data[user_id])['picture']
            response[user_id]['picture'] = picture_link

            #Now load the user name

            user_name = json.loads(users_data[user_id])['name']
            response[user_id]['name'] = user_name

    response = [ response[index] for index in response];
    response = sorted(response, key= lambda x: x['points'], reverse=True);
    return jsonify(response);

def retrieve_user_results():
    query = datastore_client.query(kind='result')
    results = list(query.fetch())
    response = []
    for result in results:
        obj = {}
        obj['round'],obj['points'],obj['total_points'],obj['user_id'] = \
                result['round'],result['points'],result['total_points'],result['user_id']
        response.append(obj)
    return response

@app.route('/results/delete/', methods=['POST'])
def delete_user_result():
    data = json.loads(request.data.decode())
    user_id = data['user_id'],
    current_round = data['round']
    task_key = datastore_client.key('result', str(user_id)+"_"+str(current_round))
    datastore_client.delete(task_key)
    return jsonify([])


@app.route('/users/all')
def send_all_users():
    return jsonify(get_all_users());

def get_all_users():
    query = datastore_client.query(kind='user')
    results = list(query.fetch())
    response = []
    for result in results:
        if 'info' in result:
            response.append(result['info'])
    return response


app.secret_key = 'super-secret-key'
app.config['SESSION_TYPE'] = 'filesystem'

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0', port=5000, threaded=True)
