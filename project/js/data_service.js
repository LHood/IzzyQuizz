goog.provide('DataService');

function getQuestions() {
	const questions = XhrService.getJSON('/questions');
	return questions;
}

function getQuestionById(questionId, questions) {
	for (question of questions) {
		if (question.id == questionId) {
			return question;
		}
	}
	throw (new Error('Unable to find question.'));
}

function gradeQuestion(question, response) {
	if (response == question.answer) {
		return 1;
	} else {
		return 0;
	}
}

function gradeAnswers(answers, questions) {
	grades = 0;
	for (answer of answers) {
		questionId = answer.questionId;
		question = getQuestionById(questionId, questions);
		grade = gradeQuestion(question, answer);
		grades += grade;
	}
	return grades;
}

function CompareAnswers(answers, questions) {
	mappedQuestions = mapQuestions(questions);
	const element_array = [];
	for (answer of answers) {
		element_array.push(answer.questionId);
		element_array.push(mappedQuestions[answer.questionId].value);
		element_array.push(answer.value);
		if (answer.value = mappedQuestions[answer.questionId].answer) {
			element_array.push(1);
		} else {
			element_array.push(0);
		}
	}
	return element_array;
}

function createQuestion(title, answer, extra_options) {
	requestData = {};
	requestData.title = title;
	requestData.answer = answer;
	requestData.extra_options = extra_options;
	requestData.created_at = new Date.getTime();
	result = XhrService.postJSON('/questions/new', requestData);
	NotificationService.notify(result.message);
}

function modifyQuestion(questionId, attribute, value) {
	return true;
}

function deleteQuestion(questionId) {
	return true;
}

function createRound(questions) {

	return true;
}

function getRounds() {
	return true;
}

function activateRound(roundId) {
	return true;
}

function deactivateRound(roundId) {
	return true;
}

function deleteRound(roundId) {
	return true;
}

function getResults() {
	return true;
}
function sendGrades() {
	return true;
}

DataService.getQuestions = getQuestions;
DataService.getQuestionById = getQuestionById;
DataService.gradeQuestion = gradeQuestion;
DataService.gradeAnswers = gradeAnswers;
