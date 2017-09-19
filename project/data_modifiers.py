import os
import json
import time
import tools

def add_question(title, answer, extra_options):
    question_dict = {};
    question_dict["title"] = title
    question_dict["id"] = tools.current_milli_time()
    question_dict["answer"] = answer
    question_dict["extra_options"] = extra_options
    question_json = json.dumps(question_dict,sort_keys=True)
    filename = "data/question_"+question_dict["id"]+".json"

    with open(filename, 'w') as f:
        json.loads(f, question_json)
    f.close()
    return question_json

def add_questions(questions):
    for question in questions:
        add_question(question[0], question[1], question[2])

def delete_question(question_id):
    file_name = "data/question_"+question_id+".json"
    os.unlink(file_name)

def add_result(result):
    result = json.dumps(result)
    file_name = "data/result_user_"+result.user_id+"_question__"+result.question_id
    with open(file_name, "w") as f:
        json.dumps(f, result)
    f.close()

def add_user(user_id, first_name, last_name, email):
    user = {}
    user["id"] = user_id
    user["first_name"] = first_name
    user["last_name"]  = last_name
    user["email"] = email
    with open('data/user_'+user_id) as f:
        json.loads(f, json.dumps(user, sort_keys=True))
    f.close()
    return json.dumps(user)


