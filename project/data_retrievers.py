import os
import path
import json
def get_questions():
    filenames = glob.glob("data/question_*")
    questions = []
    for filename in filenames:
        with open("data/"+filename) as f:
            question = json.load(f)
        questions.append(question)
    return json.dumps(questions)

def list_results():
    results = glob.glob("data/result_*")
    return results

