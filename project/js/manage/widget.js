goog.require('XhrService');
goog.require('goog.dom');
goog.require('goog.events');
goog.provide('ManageWidget');

const no_target = document.getElementById('newQuestionHolder');

class questionDisplay {
	constructor() {
		this.current_db = {};
		this.array_db = null;
	}

	build() {
		return new Promise(() => {
			XhrService.getJSON('/questions/all').then(response => {this.array_db = response;}).then(() => {
				this.updateQuestionsMap();
			}).then(() => {this.showQuestions()});
		})
	}
	updateQuestionsMap() {
		for(var question of this.array_db) {
			this.current_db[question.created_at] = question;
		}
	};
	showQuestions() {
		const questionsTable = goog.dom.createDom('table', null);
		const THEAD = goog.dom.createDom('thead', null);
		const tHeadOptions = this.generateTHeadOptions(['id', 'title', 'answer', 'extra_options', 'edit']);
		for(var tHeadOption of tHeadOptions) {
			THEAD.append(tHeadOption);
		}
		const tbody = goog.dom.createDom('tbody');
		for(var question of this.array_db){
			var TR = this.generateTRElement(question)
			tbody.append(TR)
		}
		const questionsHolder = document.getElementById('questionsHolder');
		for(var element of [THEAD, tbody]){
			questionsTable.append(element);
		}
		questionsHolder.append(questionsTable);
		console.log(questionsTable);
	}

	generateTHeadOptions(elements){
		const results = []
		for(var element of elements) {
			var TH = goog.dom.createDom('th', null, element);
			results.push(TH)
		}
		return results
	}
	generateTRElement(question) {
		const questionId = goog.dom.createDom('h6', null, question.created_at.toString())
		const titleElement = goog.dom.createDom('h6', null, question.title);
		const optionsElement = this.generateOptionsHolder(question.options);
		const rightAnswer = goog.dom.createDom('h6', null, question.answer);
		const edit = goog.dom.createDom('div', null, 'edit question')
		const TRElement = goog.dom.createDom('TR');
		const myElements = [questionId, titleElement, rightAnswer, optionsElement, edit];
		for (var element of myElements) {
			var TD = goog.dom.createDom('td', null, element);
			TRElement.append(TD);
		}
		return TRElement
	}
	generateOptionsHolder(options) {
		const optionElems = []
		for(var option of options) {
			optionElems.push(goog.dom.createDom('li', null, option))
		}
		const result = goog.dom.createDom('ol', null, optionElems);
		return result;
	}
}
class newQuestion {
	constructor(current_db = null) {
		// The target is the element on the DOM
		// where the new question widget should be appended
		this.current_db = current_db;
	}
	build(target=no_target) {
		const overall_title = goog.dom.createDom('h4', {id: 'guider'}, 'Create a new Question Here');
		const title_input = goog.dom.createDom('input', {id: 'proposed_title', placeholder: 'Enter question title'});
		const answer = goog.dom.createDom('input', {id: 'proposed_answer', placeholder: 'Correct answer'});
		const options = goog.dom.createDom('div', {id: 'options_holder'}, this.generateOptionsForm());
		const button = goog.dom.createDom('div', {id: 'new_button'}, this.generateButton());
		if (this.current_db != null) {
			title_input.value = this.current_b.title;
			answer.value = this.current_db.answer;
		}
		const holder = goog.dom.createDom('div', {className: 'new_question_holder'});
		for(var element of [overall_title, title_input, answer, options, button]){
			goog.dom.appendChild(holder, element);
		}
		target.innerHTML = '';
		target.append(holder)
	}

	generateOptionsForm() {
		const options = [];
		for (var i = 0; i < 4; i++) {
			const option = goog.dom.createDom('input', {className: 'extra_options', 
				placeholder: 'input extra options. Do not include the right answer'});
			if (this.current_db != null) {
				option.value = this.current_db.options[i];
			}
			options.push(option);
		}
		return options;
	}

	generateButton() {
		const button = goog.dom.createDom('button', {className: 'question_maker_button', value: 'Submit Data'}, 'Submit');
		button.addEventListener('click', () => {this.preprocessNewQuestion(this)});
		return button;
	}
	
	submitNewQuestion(request_data) {
		XhrService.postJSON('/question/new', request_data)
			.then(response => {Materialize.toast('Question created with success')})
			.catch(e => {Materialize.toast('Failed to create question, and returned error ')});
		return 'done';
	}

	preprocessNewQuestion(context) {
		const title = document.getElementById('proposed_title');
		const answer = document.getElementById('proposed_answer');
		const extra_options = [];
		const option_elements = document.getElementsByClassName('extra_options');
		for (var option of option_elements) {
			if (typeof(option.value) === 'string') {
				extra_options.push(option.value);
			}
		}
		const request_object = {'title': title.value, 'answer': answer.value, 'extra_options': extra_options};
		if (this.current_db == null) {
			this.submitNewQuestion(request_object);
		} else {
			this.current_db.title = title;
			this.current_db.answer = answer;
			this.current_db.options = extra_options;
			editor = new questionEditor(this.current_db);
			editor.commit();
			window.update()
		}
	}
};

class questionEditor {
	constructor(question_db) {
		this.questionId = question_db.question_id;
		this.questionTitle = question_db.title;
		this.questionAnswer = question_db.answer;
		this.extra_options = question_db.options;
		this.createdAt = question_db.createdAt;
	}
	deleteQuestion() {
		XhrService.postJSON('/question/delete/' + this.questionId);
	}
	changeTitle(title) {
		this.questionTitle = title;
		this.commit();
	}
	changeAnswer(answer) {
		this.questionAnswer = answer;
		this.commit();
	}
	changeOptions(options) {
		this.extra_options = options;
		this.commit();
	}
	commit() {
		request_data = {'title': this.questionTitle, 'answer': this.questionAnswer, 'options': this.extra_options};
		XhrService.postJSON('/question/update/' + this.questionId, request_data).then(response => {Materialize.toast('Edit SuccessFull')}).catch(e => {Materialize.toast('Failed to Edit question, and returned error ' + e.message, 5000, 'red')});
	}
};


class newRound {
	constructor(current_db = {}) {
		this.current_db = current_db;
	}
	build() {
		const title_part = goog.dom.createDom('input', {placeHolder: 'input round time/name'});
		const order_part = goog.dom.createDom('select', {className: 'order_select_element'}, this.generateOrderElements());
		const questions_part = goog.createDom('div', {className: 'round_questions_holder'}, this.generateQuestionElements());
		const new_questions_part = goog.createDom('div', {classname: 'new_question_holder'}, this.generateNewQuestionAdderElement());
	}

	generateQuestionElements() {
		result = [];
		for (questionId of this.current_db.questions) {
			questionEntity = this.generateQuestionEntity(questionId);
			result.push(questionEntity);
		}
		return result;
	}
	generateQuestionAdderElement() {
		const input = goog.dom.createDom('input', {placeHolder: 'input the question title'});
		goog.events.listen(input, goog.events.EventType.CHANGE, this.verifyQuestionInput(input));
	}
	verifyQuestionInput(target) {
		array = [];
		value = target.value;
		for (question of window.question_db) {
			if (question.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
				array.push(question.question_id);
			}
		}
		this.handleNewQuestionAddition(array);
	}
	handleNewQuestionAddition() {}
};

class roundEditor {
	constructor(current_db) {
	}
};

window.initialize = () => {
	const display = new questionDisplay();
	display.build();
	const questionWidget = new newQuestion()
	const holder = document.getElementById('newQuestionHolder');
	questionWidget.build(holder)
}
window.update = () => {
	window.location = window.location
}
window.addEventListener('load', window.initialize);
ManageWidget.DO = {
	newQuestion: newQuestion,
	newRound: newRound,
	questionEditor: questionEditor,
	roundEditor: roundEditor
};
