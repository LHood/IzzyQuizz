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
		const tHeadOptions = this.generateTHeadOptions(['id', 'title', 'answer', 'extra_options', 'ROUNDS','MODIFY']);
		for(var tHeadOption of tHeadOptions) {
			THEAD.append(tHeadOption);
		}
		const tbody = goog.dom.createDom('tbody');
		for(var question of this.array_db){
			var TR = this.generateTRElement(question)
			tbody.append(TR)
		}
		const questionsHolder = document.getElementById('questionsHolder');
		questionsHolder.innerHTML = '';
		for(var element of [THEAD, tbody]){
			questionsTable.append(element);
		}
		questionsHolder.append(questionsTable);
		console.log(questionsTable);
	}

	generateTHeadOptions(elements){
		const results = []
		for(var element of elements) {
			var TH = goog.dom.createDom('th', {align: 'center'}, element.toUpperCase());
			results.push(TH)
		}
		return results
	}
	generateTRElement(question) {
		const questionId = goog.dom.createDom('h6', null, question.created_at.toString())
		const titleElement = goog.dom.createDom('h6', null, question.title);
		const optionsElement = this.generateOptionsHolder(question.options);
		const rightAnswer = goog.dom.createDom('h6', null, question.answer);
		const rounds = goog.dom.createDom('h6', null, question.rounds.join())
		const edit = goog.dom.createDom('div', null, this.generateEditElements(question));
		const TRElement = goog.dom.createDom('TR');
		const myElements = [questionId, titleElement, rightAnswer, optionsElement, rounds, edit];
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
	generateEditElements(question) {
		const deleteElement = goog.dom.createDom('a', {className: 'button edit_tools waves-effect waves-light btn'}, 'DELETE');
		deleteElement.addEventListener('click', () => {
			console.log('About to delete question ', question);
			const questionWidget = new questionEditor(question);
			questionWidget.__delete__()});
		const editElement = goog.dom.createDom('a', {className: 'button waves-effect waves-light btn'}, 'EDIT');
		editElement.addEventListener('click', () => {
			const questionWidget = new newQuestion(question);
			const target = document.getElementById('newQuestionHolder');
			questionWidget.build(target);
			location.href = '#newQuestionHolder';
		});
		return [deleteElement, editElement]
	}
}
class newQuestion {
	constructor(current_db = null) {
		// The target is the element on the DOM
		// where the new question widget should be appended
		this.current_db = current_db;
	}
	build(target=no_target) {
		const title_input = goog.dom.createDom('input', {id: 'proposed_title', title: 'Enter question title', 
			placeholder: 'Enter question title', required: 1});
		const answer = goog.dom.createDom('input', {id: 'proposed_answer', title: 'Enter correct answer', 
			placeholder: 'Correct answer', required: 1});
		const options = goog.dom.createDom('div', {id: 'options_holder', title: 'Enter options'}, 
			this.generateOptionsForm());
		const rounds = goog.dom.createDom('input', {id:'round_options', title: 'Select rounds for this question ', 
			placeHolder: 'Input rounds to include in this questions. separate rounds by ,', required: 1})
		const button = goog.dom.createDom('div', {id: 'new_button'}, this.generateButton());
		if (this.current_db != null) {
			title_input.value = this.current_db.title;
			answer.value = this.current_db.answer;
			rounds.value = this.current_db.rounds.join()
		}
		const holder = goog.dom.createDom('div', {className: 'new_question_holder'});
		for(var element of [title_input, answer, options, rounds, button]){
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
		const button = goog.dom.createDom('button', {className: 'question_maker_button waves-effect waves-light btn', value: 'Submit Data'}, 'Submit');
		button.addEventListener('click', () => {this.preprocessNewQuestion(this)});
		return button;
	}
	
	submitNewQuestion(request_data) {
		const now = this.current_db != null ? this.current_db.created_at : getTime()
		XhrService.postJSON('/question/new/'+now, request_data)
			.then(response => {Materialize.toast('Question update made with success', 2000)})
			.catch(e => {Materialize.toast('Failed to create question, and returned error '+e.message, 2000)}).then(() => {window.initialize()});
		return 'done';
	}

	preprocessNewQuestion(context) {
		const title = document.getElementById('proposed_title');
		const answer = document.getElementById('proposed_answer');
		const rounds = document.getElementById('round_options');
		const extra_options = [];
		const option_elements = document.getElementsByClassName('extra_options');
		for (var option of option_elements) {
			if (typeof(option.value) === 'string') {
				extra_options.push(option.value);
			}
		}
		const request_object = {'title': title.value, 'answer': answer.value, 'extra_options': extra_options, 'rounds': rounds.value.split(',')};
		this.submitNewQuestion(request_object);
	}
};

class questionEditor {
	constructor(question_db) {
		this.questionTitle = question_db.title;
		this.questionAnswer = question_db.answer;
		this.extra_options = question_db.options;
		this.createdAt = question_db.created_at;
	}
	__delete__() {
		Promise.resolve(XhrService.postJSON('/question/delete/' + this.createdAt)).then(() => {Materialize.toast('Delete successful', 2000); window.initialize()});
	}
};



class QuizManager {
	constructor() {
		console.log('Starting the quiz');
		this.current_status = null;
		this.questions_array_db = null;
		XhrService.getJSON('/questions/all').then((response) => {console.log('got response: ', response); this.questions_array_db = response})
	}
	build(target) {
		XhrService.getJSON('/quiz/status').then((response) => {this.current_status = response}).then(() => {this.construct(target)});
		
	}
	construct(target) {
		console.log('going to construct');
		const statusElements  = []
		for (const option in this.current_status) {
			statusElements.push(this.generateStatusElement(option, this.current_status[option]))
		}
		const statusesHolder = goog.dom.createDom('div', null, statusElements)
		target.innerHTML = '';
		target.append(statusesHolder);

		const roundSelector = this.generateRoundSelector();
		console.log('round selector: ', roundSelector);
		const roundUpdateButton = this.generateRoundUpdateButton();
		const quizUpdateButton = this.generateQuizToggleButton();
		const roundSelector_ = goog.dom.createDom('div', null, [goog.dom.createDom('h6', null, 'Select round'), roundSelector]);	
		target.append(roundSelector_);
		target.append(roundUpdateButton)
		target.append(quizUpdateButton)
	
	}
	generateStatusElement(key, value) {
		console.log('generating status elements for ', key , ' == ', value);
		const element = goog.dom.createDom('h4', null, key + ' == '+ value.toString());
		return element
	}
	generateAllRounds() {
		console.log('rounds with db: ', this.questions_array_db);
		const rounds_db = {}
		if(this.questions_array_db == null) {
			window.location = window.location;
		}
		for(const question of this.questions_array_db) {
			for(const round of question.rounds) {
				if (!(round in rounds_db)) {
					rounds_db[round] = 1
				} else {
					rounds_db[round] += 1
				}
			}
		}
		return rounds_db;
	}
	generateRoundSelector() {
		const roundSelector = goog.dom.createDom('select', {id: 'round_selector'});
		const rounds_db = this.generateAllRounds();
		console.log('Our rounds db: ', rounds_db);
		for(const round in rounds_db) {
			console.log('round: ', round);
			var element = goog.dom.createDom('option', {value: round}, 'round ' + round.toString() + ' -- '+rounds_db[round].toString()+' questions');
			console.log('element :', element);
			roundSelector.append(element)
		}
		return roundSelector
	}
	generateRoundUpdateButton() {
		const updateQuizRoundButton = goog.dom.createDom('a', {className: 'button waves-effect waves-light btn'}, 'R-UPDATE');
		updateQuizRoundButton.addEventListener('click', () => {this.updateQuizRound();});
		console.log('update button ', updateQuizRoundButton);
		return updateQuizRoundButton
	}
	updateQuizRound() {
		const current_state = this.current_status.current_round
		const new_state = document.getElementById('round_selector').value
		if(new_state != current_state && new_state != undefined) {
			XhrService.postJSON('/round/activate/'+(new_state).toString()).then(() => {Materialize.toast('Update successful', 2000);
				setTimeout(() => {window.initialize()}, 2000)});
		}
	}
	generateQuizToggleButton() {
		const quizToggleButton = goog.dom.createDom('a', {className: 'button waves-effect waves-light btn'}, 'Q-TOGGLE');
		quizToggleButton.addEventListener('click', () => {this.toggleQuizState()});
		console.log('Toggle Button: ', quizToggleButton);
		return quizToggleButton;
	}
	toggleQuizState() {
		const currentState = parseInt(this.current_status.quiz_status)
		XhrService.postJSON('/quiz/activate/'+(1 - currentState).toString()).then(()=>{Materialize.toast('Quiz State updated'); window.initialize()});
		
	}


}

window.initialize = () => {
	console.log('executing initialize');
	quizManHolder = document.getElementById('quizManager');
	quizMan = new QuizManager()
	quizMan.build(quizManHolder)
	return new Promise((resolve) => {
		console.log('exec new question');
	const questionWidget = new newQuestion()
	const holder = document.getElementById('newQuestionHolder');
	holder.innerHTML = '';
	questionWidget.build(holder);
		resolve('pass');
	}).then( () => {
	setTimeout(() => {
		console.log('exec display');
	const display = new questionDisplay();
	display.build();
	} , 2000)
	
	})
}

window.addEventListener('load', window.initialize);
ManageWidget.DO = {
	newQuestion: newQuestion,
	questionEditor: questionEditor,
};
