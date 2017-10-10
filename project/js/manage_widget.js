goog.require('XhrService');
goog.require('goog.dom');

class newQuestion {
	constructor(current_db = null) {
		// The target is the element on the DOM
		// where the new question widget should be appended
		this.current_db = current_db;
	}
	build(target) {
		const title_input = goog.dom.createDom('input', {id: 'proposed_title', placeholder: 'Question Title'});
		const answer = goog.dom.createDom('input', {id: 'proposed_answer', placeholder: 'Correct answer'});
		const options = this.generateOptionsForm();
		const button = this.generateButton();
		if (this.current_db != null) {
			title_input.value = this.current_b.title;
			answer.value = this.current_db.answer;
		}
		const holder = goog.dom.createDom('div', {className: 'new_question_holder'},
			[title_input, answer, options, button]);
		target.append(holder);
	}

	generateOptionsForm() {
		options = [];
		for (i = 0; i < 4; i++) {
			option = goog.dom.createDom('input', {className: 'extra_options', placeholder: 'input extra options. Do not include the right answer'});
			if (this.current_db != null) {
				option.value = this.current_db.options[i];
			}
			options.push(option);
		}
		return options;
	}
	generateButton() {
		const button = goog.dom.createDom('input', {className: 'question_maker_button', placeHolder: 'Submit'});
		goog.events.listen(button, goog.events.EventType.CLICK, this.preprocessNewQuestion);
		return button;
	}
	preprocessNewQuestion() {
		const title = document.getElementById('proposed_title');
		const answer = document.getElementById('proposed_answer');
		const extra_options = [];
		const option_elements = document.getElementsByClassName('extra_options');
		for (option of option_elements) {
			(if typeof(option.value) === 'string') {
				extra_options.append(option.value);
			}
		}
		const request_object = {'title': title, 'answer': answer, 'extra_options': extra_options};
		if (this.current_db == null) {
			this.submitNewQuestion(request_object);
		} else {
			this.current_db.title = title;
			this.current_db.answer = answer;
			this.current_db.options = extra_options;
			editor = new questionEditor(this.current_db);
			editor.commit();
		}
	}
	submitNewQuestion(request_data) {
		xhrService.postJSON('/question/new', request_data).then(response => {Materialize.toast('Question created with success')}).catch(e => {Materialize.toast('Failed to create question, and returned error ' + e.message, 'red'});
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
		xhrService.postJSON('/question/delete/' + this.questionId);
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
		xhrService.postJSON('/question/update/' + this.questionId, request_data).then(response => {Materialize.toast('Edit SuccessFull')}).catch(e => {Materialize.toast('Failed to Edit question, and returned error ' + e.message, 'red')});
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
		goog.events.listen(input, goog.events.EventType.CHANGE, {this.verifyQuestionInput(input)});
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
	constructor(current_db)
};
