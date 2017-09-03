import os
import add_question

def add_question(quiz_id, round_id, question):
    question_dict = {};
    question_dict["title"] = question["title"]
    question_dict["id"] = question["id"]
    question_dict["answer"] = question["answer"]
    question_dict["extra_options"] = question["extra_options"]
    question_dict["quiz_name"] = question["quiz_name"]
    question_dict["round_name"] = question["round_name"]
    question_json = json.dumps(question_dict,sort_keys=True)
    filename = "data/question_"+question_dict["id"]+".json"

    with open(filename) as question_stream:
        json.loads(question_stream, question_json)
    question_stream.close()

def add_questions(questions):
    for question in questions:
        add_question(question)
def delete_question(question_id):
    file_name = "data/question_"+question_id+".json"
    os.unlink(file_name)

