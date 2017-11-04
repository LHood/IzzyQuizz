console.log('quiz widget module loaded');
goog.provide('QuizWidget');
goog.require('XhrService');
goog.require('goog.dom');

function getUserData() {
	return new Promise(function(resolve, reject) {
		XhrService.getJSON('/user').then(function(user){window.user_data = user; resolve(JSON.parse(user))}.bind(this));
	});
}

class userWidget {
	createContent() {
		getUserData().then(function(userData){
			const userImage = goog.dom.createDom('img', {'src': userData.picture, 'className': 'user-image'});
			const firstName = userData.given_name;
			const fullName = userData.name;
			const nameHolder = goog.dom.createDom('div', {className: 'name-holder'}, fullName);
			const logoutButton = goog.dom.createDom('a',
				{'className': 'logout-button waves-effect waves-light btn', href: '/logout'}, 'logout');
			const userHolder = goog.dom.createDom('div', {className: 'user-holder z-depth-1'}, [userImage, nameHolder, logoutButton]);
			const mainHolder = goog.dom.createDom('div', null, [userHolder]);
			const userDataNode = document.getElementById('user_data');
			userDataNode.appendChild(mainHolder);
		}.bind(this));
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
		return new Promise(function(resolve){
			XhrService.getJSON('/quiz/status').then(function(response){
				this.current_status = response; console.log('-- got status response ', response); resolve(response)}.bind(this));
		}.bind(this));
	}
	load_all_questions () {
	console.log('loading all questions');	
		return new Promise(function(resolve){
			XhrService.getJSON('/questions/all')
			.then(function(response){this.all_questions = response; console.log('all_done'); resolve('done');}.bind(this));
		}.bind(this));
	}
	load_current_questions () {
	console.log('loading current questions');
		return new Promise(function(resolve){
			XhrService.getJSON('/questions/current')
			.then(function(response){this.current_questions = response; console.log('current_done'); resolve('done');}.bind(this));
		}.bind(this));
	}
	load_all() {
		return new Promise(function(resolve){
			resolve(Promise.all([this.load_status(), this.load_all_questions(), this.load_current_questions()]));
		}.bind(this));
	}
}

class quizDisplay {
	constructor () {
		this.quiz_data = new quizData();
	}

	build(target) {
		return new Promise(function(resolve){
			this.quiz_data.load_all().then(function(){console.log('resolved all data'); resolve('done');});
		}.bind(this)).then(function(response){
			this.display_quiz(target)}.bind(this));
	}
	// Target is the target element where the quiz should be displayed in. (It is a Node element)
	display_quiz(target){
		const all_questions = this.quiz_data.all_questions;
		const current_questions = this.quiz_data.current_questions;
		const current_status = this.quiz_data.current_status;
		if (current_questions.length == 0) {
			const warning = goog.dom.createDom('p', {}, 'The Trivia game is currently not active. Please come back another time');
			warning.style.color = 'red';
			const instr = document.getElementById('instructions');
			instr.innerHTML = '';
			instr.appendChild(warning);
			return "";
		}
		const gadgets = this.generate_gadgets(current_questions);
		const submit_button = this.generate_submit_button();
		
		const quiz_holder = goog.dom.createDom('div', {id:'quiz_holder'}, gadgets.concat([submit_button]));
		target.appendChild(quiz_holder);

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
		const gadget = goog.dom.createDom('div', 
			{id: 'question_gadget_'+question.created_at.toString(), className: 'question_gadget z-depth-1'}, 
			[titleElement, optionsElement]);
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
			const hash_value = question.created_at.toString()  + "_" + Math.random().toString();
			const selector = goog.dom.createDom('input', {name: 'answer_for' + question.created_at.toString(), 
				id: hash_value, className: 'answer_option', type: 'radio', value: option, 
				target_question: question.created_at,}, option);
			const label = goog.dom.createDom('label', {for: hash_value}, option);
			label.addEventListener('click', () => {
				console.log("user clicked me");
				const element = document.getElementById(hash_value);
				console.log('clicked ', element);
				element.checked = true;
				console.log('element checked : ', element.checked);
			})
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
		button.addEventListener('click', function(){
			const grader = new quizGrader(this.quiz_data);
			grader.grade();
			grader.markResults();
			grader.displayGrades();
			grader.sendGrades();
			window.scrollTo(0, 0);
		}.bind(this));
		return button
	}
};

class quizGrader {
	constructor(quiz_data){
		this.current_questions = quiz_data.current_questions;
		this.results = undefined;
		this.user_data = window.user_data;
		this.quiz_data = quiz_data;
	}
	grade() {
		const total_grade = this.current_questions.length;
		let user_grade = 0;
		let results = {};
		for (const question of this.current_questions) {
			const dummyElem = goog.dom.createDom('p', {value: Math.random()});
			const elem  = document.querySelector('input[name=answer_for'+question.created_at.toString()+']:checked') || dummyElem;
			const current_answer = elem.value
			console.log('currrent answer: ',current_answer);
			const real_answer = question.answer;
			if (current_answer == real_answer) {
				results[question.created_at] = 'correct'
				user_grade += 1
			} else {
				results[question.created_at] = 'incorrect'
			}

		}
		console.log({'user_grade': user_grade, 'total_grade': total_grade, 'results': results});
		this.results = {'user_grade': user_grade, 'total_grade': total_grade, 'results': results}
		return this.results;
	}

	markResults() {
		const results_data = this.results.results || this.grade().results;
		for(const question_id in results_data){

			const element = document.getElementById('question_gadget_' + question_id.toString());
			if(results_data[question_id] == 'correct'){

				element.style.background = 'rgba(0, 255, 0, 0.2)';
			} else {

				element.style.background = 'rgba(255, 69, 0, 0.2)';
			}
		}
	}

	displayGrades() {
		const my_results = this.results || this.grade();
		const breakpoint = goog.dom.createDom('br');
		let feedback = 'You scored '+my_results.user_grade.toString() + ' out of '+my_results.total_grade.toString();
		let to_toast = '';

		if (my_results.user_grade != my_results.total_grade) {
			to_toast += ' You can keep guessing different answers to see which ones are correct, ' +
			'but only your first submission will be recorded and considered for the prize. ';
		}

		else {
			to_toast += ' It seems like you got all the answers correct. Cheers! ';
		}
		const toasty = goog.dom.createDom('em', {className: 'toasty'}, to_toast);
		const element = goog.dom.createDom('h5', {className: 'results-display'}, [feedback]); 
		const instructions = document.getElementById('instructions');
		instructions.innerHTML = ''
		instructions.appendChild(element);
		instructions.appendChild(toasty);
		// Sould show the values returned by this.grade() to the user
		// Should mark the right and wrong questions in the users terminal
	}

	sendGrades() {
		// Should send the grades to the server
		// the server expects data round, user_id, points, total
		const grades = this.results.user_grade || this.grade().user_grade;
		const total = this.results.total_grade || this.grade().total_grade;
		console.log('user data: ', this.user_data);
		const userId = this.user_data["id"];
		const current_round = this.quiz_data.current_status.current_round;

		const requestData = {'round': current_round, 'user_id': userId, 'points': grades, 'total': total}
		console.log('going to send ', requestData);
		XhrService.postJSON('/submit', requestData).then(function(response){Materialize.toast(response, 3000)});
	}
}


userWidgetObject = new userWidget()
userWidgetObject.createContent()

const quizHolder = document.getElementById('quizHolder')
const quizDisplayObject = new quizDisplay();
quizDisplayObject.build(quizHolder);
