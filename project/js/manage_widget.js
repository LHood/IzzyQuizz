goog.require('XhrService');
goog.require('goog.dom');

class questionMaker {
	constructor(target) {
		// The target is the element on the DOM
		// where the new question widget should be appended
		this.target = target;
	}
	build() {
		const title_input = goog.dom.createDom('input', {id: 'proposed_title', placeholder: 'Question Title'});
		const answer = goog.dom.createDom('input', {id: 'proposed_answer', placeholder: 'Correct answer'});
		const options = this.generateOptionsForm();
		const button = this.generateButton();
	}

	generateOptionsForm() {
		options = [];
		for (i = 0; i < 5; i++) {
			option = goog.dom.createDom('input', {className: 'extra_options', placeholder: 'input extra option'});
			options.push(option);
		}
		return options;
	}
	generateButton() {
		const button = goog.dom.createDom('input', {className: 'question_maker_button', placeHolder: 'create'});
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
		this.submitNewQuestion(request_object);
	}
	submitNewQuestion(request_object) {
		xhrService.postJSON(requestObject).then(response => {Materialize.toast('Qestion created with success')}).catch(e => {Materialize.toast('Failed to create question, and returned error ' + e.message, 'red'});
	}
};
