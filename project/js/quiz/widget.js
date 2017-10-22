console.log('quiz widget module loaded');
goog.provide('QuizWidget');
goog.require('XhrService');
goog.require('goog.dom');

function getUserData() {
	return new Promise(function(resolve, reject) {
		XhrService.getJSON('/user').then(user => {resolve(JSON.parse(user))});
	});
}

class userWidget {
	createContent() {
		getUserData().then(userData => {
			const userImage = goog.dom.createDom('img', {'src': userData.picture, 'className': 'user-image'});
			const firstName = userData.given_name;
			const fullName = userData.name;
			const nameHolder = goog.dom.createDom('div', {className: 'name-holder'}, fullName);
			const logoutButton = goog.dom.createDom('a',
				{'className': 'logout-button waves-effect waves-light btn', href: '/logout'}, 'logout');
			const userHolder = goog.dom.createDom('div', {className: 'user-holder z-depth-1'}, [userImage, nameHolder, logoutButton]);
			const mainHolder = goog.dom.createDom('div', null, [userHolder]);
			document.body.append(mainHolder);
		});
	}
}

class quizData {
	constructor(){
		this.all_questions = undefined;
		this.current_questions = undefined;
		this.current_status = undefined;
	}

	load_status() {

		return new Promise((resolve) => {
			XhrService.getJSON('/quiz/status').then( (response) => {
				this.current_status = response; Promise.resolve(response)})
				.then((response) => {
					resolve(response)});
		});	
	}
	load_all_questions () {
	
		return new Promise((resolve) => {
			XhrService.getJSON('/questions/all').then( (response) => {this.all_questions = response}).then(() => {Promise.resolve('done')});
		});
	}
	load_current_questions () {
		return new Promise((resolve) => {
			XhrService.getJSON('/questions/current').then((response) => {this.current_questions = response}).then(() => {Promise.resolve('done')});
		})
	}
	load_all() {
		return Promise.all([this.load_status(), this.load_all_questions(), this.load_current_questions()]);
	}	
}

class quizDisplay() {
	this.quiz_data = new quizData();
	build(target) {
		return new Promise ((resolve) {this.quiz_data.load_all()}).then((response){this.display_quiz(target)});
	}
	// Target is the target element where the quiz should be displayed in. (It is a Node element)
	display_quiz(target){
		const all_questions = this.quiz_data.all_questions;
		const current_questions = this.quiz_data.current_questions;
		const current_status = this.quiz_data.current_status;

		const gadgets = this.generate_gadgets(current_questions);
		const submit_button = this.generate_submit_button();
		
		const quiz_holder = goog.dom.createDom('div', {id:'quiz_holder'}, gadgets.concat([submit_button]));
		target.append(quiz_holder);

	}
	generate_gadgets(questions) {
		const results = []
		for(question of questions ) {
		
			results.push(this.generate_gadget(question));
		}
		return results;
	}
	generate_gadget(question) {

		const title = question.title
		const options = question.options
		const answer = questions.answer
		const shuffled_options = this.shuffle_array(options.concat([answer]))
		const optionsElement = this.generate_options_element(question);
		const gadget = goog.dom.createDom('div', {className: 'question_gadget'}, [titleElement, optionsElement]);
		return gadget
	}
	//Courtesy of stackoverflow
	// On link https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
	shuffle(a) {
		for (let i = a.length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * i+1);
			[a[i],a[j]] = [a[j],a[i]];
		}
	}
	generate_options_element(question) {
		const all_options = question.options.concat([question.answer])
		this.shuffle(all_options);
		option_elements = []
		for(option of all_options) {
			const element = goog.dom.createDom('input', {className: 'answer_option', type: 'radio', value: option, target_question: question.created_at}, option)
			option_elements.push(element)
		}
		const result =  goog.dom.createDom('div', {className: 'options_holder'}, option_elements);
		return result
	}
	generate_submit_button() {
		const button = goog.dom.createDom('a', {className: 'button waves-effect waves-light button'}, 'Submit');
		button.addEventListener('click', () => {window.grade_quiz()});
		return button
	}
}

