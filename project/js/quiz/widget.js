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
			const userDataNode = document.getElementById('user_data');
			userDataNode.append(mainHolder);
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
		console.log('loading status');
		return new Promise((resolve) => {
			
			XhrService.getJSON('/quiz/status').then( (response) => {
				this.current_status = response; console.log('-- got status response ', response); resolve(response)});
		});
	}
	load_all_questions () {
	console.log('loading all questions');	
		return new Promise((resolve) => {
			XhrService.getJSON('/questions/all')
			.then((response) => {this.all_questions = response; console.log('all_done'); resolve('done');});
		});
	}
	load_current_questions () {
	console.log('loading current questions');
		return new Promise((resolve) => {
			XhrService.getJSON('/questions/current')
			.then((response) => {this.current_questions = response; console.log('current_done'); resolve('done');});
		});
	}
	load_all() {
		return new Promise((resolve) => {
			resolve(Promise.all([this.load_status(), this.load_all_questions(), this.load_current_questions()]));
		});
	}
}

class quizDisplay {
	constructor () {
		this.quiz_data = new quizData();
	}

	build(target) {
		return new Promise((resolve) => {
			this.quiz_data.load_all().then(() => {console.log('resolved all data'); resolve('done');});
		}).then((response) => {
			this.display_quiz(target)});
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
		for(const question of questions ) {
		
			results.push(this.generate_gadget(question));
		}
		return results;
	}

	generate_gadget(question) {
		const title = question.title
		const titleElement = goog.dom.createDom('h5', {}, title);
		const options = question.options
		const answer = question.answer
		const shuffled_options = this.shuffle_array(options.concat([answer]))
		const optionsElement = this.generate_options_element(question);
		const gadget = goog.dom.createDom('div', {className: 'question_gadget z-depth-1'}, [titleElement, optionsElement]);
		return gadget
	}
	//Courtesy of stackoverflow
	// On link https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
	shuffle_array(a) {
		for (let i = a.length - 1; i > 0; i--){
			const j = Math.floor(Math.random() * i+1);
			[a[i],a[j]] = [a[j],a[i]];
		}
	}
	generate_options_element(question) {
		const all_options = question.options.concat([question.answer])
		this.shuffle_array(all_options);
		const option_elements = []
		for(const option of all_options) {
			const hash_value = question.created_at.toString()  + "_" + option.length.toString();
			const selector = goog.dom.createDom('input', {name: 'answer_for' + question.created_at.toString(), 
				id: hash_value, className: 'answer_option', type: 'radio', value: option, 
				target_question: question.created_at,}, option);
			const label = goog.dom.createDom('label', {for: hash_value}, option);
			const element = goog.dom.createDom('div', {}, [selector, label]);
			option_elements.push(element)
		}
		const result =  goog.dom.createDom('div', {id: 'options_holder_'+question.created_at.toString(), 
			className: 'options_holder'}, option_elements);
		console.log('returning options element', result);
		return result
	}
	generate_submit_button() {
		const button = goog.dom.createDom('a', { id: 'submit_button', className: 'btn waves-effect waves-light button'}, 'Submit');
		button.addEventListener('click', () => {
			const event = new Event('gradeQuiz');
			window.dispatchEvent('gradeQuiz');
		});
		return button
	}
}

class quizGrader {
	constructor(current_questions){
		this.current_questions = current_questions;
	}
	grade() {
		const total_grade = this.current_questions.length;
		let user_grade = 0
		for (const question of this.current_questions) {
			current_answer = '';
			real_answer = question.answer;
			if (current_answer == real_answer) {
				user_grade += 1
			}

		}
	}
}


userWidgetObject = new userWidget()
userWidgetObject.createContent()

const quizHolder = document.getElementById('quizHolder')
const quizDisplayObject = new quizDisplay();
quizDisplayObject.build(quizHolder);