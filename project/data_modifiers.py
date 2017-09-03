def add_question(quiz_id, round_id, question):
    with open("quiz"+str(quiz_id)+".json") as quizfile:
        quizData = json.loads(quizfile.read())
    quizData["rounds"][round_id]["questions"].append(question);
    with open(quizfilename) as quizfile:
        quiz_file = quiz_data
    quizfilename.close()
