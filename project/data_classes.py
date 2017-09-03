class quiz(object):
    def __init__(self, name, questions, number_of_rounds = 5):
        self.name = name
        self.questions = questions
        self.rounds = number_of_rounds

class round(object):
    """
    @param {string name} name of the round
    @param {int duration } duration of the round
    """
    def __init__(self, name, duration = 5):
        self.name = name
        self.id = quiz_id
        self.questions = None

    def set_questions(self, questions):
        this.questions = questions

    def get_questions(self):
        return self.questions

class question(object):
    """
    @param {string title} title: what the question asks(is)
    @param {string answer} answer: what the right answer to the questions is
    @param{Array<string>} options: options for the user to choose from(don't include the right answer)
    """
    def __init__(self, title, answer, options):
        self.title = title
        self.answer = answer
        self.options = options
    def get_title(self):
        return self.title
    def get_answer(self):
        return self.answer
    def get_options(self):
        return self.options

