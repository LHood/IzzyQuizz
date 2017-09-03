import os
import path

def list_questions():
    questions = glob.glob("data/question_*")
    return questions

def list_results():
    results = glob.glob("data/result_*")
    return results

