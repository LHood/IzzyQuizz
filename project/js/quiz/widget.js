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
			var userImage = goog.dom.createDom('img', {'src': userData.picture, 'className': 'user-image'});
			var firstName = userData.given_name;
			var fullName = userData.name;
			var nameHolder = goog.dom.createDom('div', {className: 'name-holder'}, fullName);
			var logoutButton = goog.dom.createDom('a',
				{'className': 'logout-button waves-effect waves-light btn', href: '/logout'}, 'logout');
			var userHolder = goog.dom.createDom('div', {className: 'user-holder z-depth-1'}, [userImage, nameHolder, logoutButton]);
			var mainHolder = goog.dom.createDom('div', null, [userHolder]);
			var userDataNode = document.getElementById('user_data');
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
				this.current_status = response; resolve(response)}.bind(this));
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
		console.log('going to build on target ', target)
		return new Promise(function(resolve){
			this.quiz_data.load_all().then(function(){console.log('resolved all data'); resolve('done');});
		}.bind(this)).then(function(response){
			this.display_quiz(target)}.bind(this));
	}
	// Target is the target element where the quiz should be displayed in. (It is a Node element)
	display_quiz(target){
		console.log('going to display the quiz on ', target)
		var all_questions = this.quiz_data.all_questions;
		var current_questions = this.quiz_data.current_questions;
		var current_status = this.quiz_data.current_status;
		if (current_questions.length == 0) {
			var warning = goog.dom.createDom('p', {}, 'The Trivia game is currently not active. Please come back another time');
			warning.style.color = 'red';
			var instr = document.getElementById('instructions');
			instr.innerHTML = '';
			instr.appendChild(warning);
			return "";
		}

		var gadgets = this.generate_gadgets(current_questions);
		var submit_button = this.generate_submit_button();
		var quiz_holder = goog.dom.createDom('div', {id:'quiz_holder'}, gadgets.concat([submit_button]));
		var target_ = document.getElementById('quizHolder')
		target_.innerHTML = '';
		target_.appendChild(quiz_holder);
		document.getElementById('announcement').innerHTML = '';

	}
	generate_gadgets(questions) {
		var results = []
		for(var questionIndex in questions ) {
		
			results.push(this.generate_gadget(questions[questionIndex]));
		}
		return results;
	}

	generate_gadget(question) {
		var title = question.title;
		var titleElement = goog.dom.createDom('h5', {}, title);
		var options = question.options;
		var answer = question.answer;
		var optionsElement = this.generate_options_element(question);
		var gadget = goog.dom.createDom('div', 
			{id: 'question_gadget_'+question.created_at.toString(), className: 'question_gadget z-depth-1'}, 
			[titleElement, optionsElement]);
		return gadget
	}
	//Courtesy of stackoverflow
	// On link https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
	shuffle_array(a) {
		for (var i = a.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * i+1);
			a[i],a[j] = a[j],a[i];
		}
		return a
	}
	generate_options_element(question) {
		var all_options = question.options.concat([question.answer])
		this.shuffle_array(all_options);
		var option_elements = []
		for(var option of all_options) {
			var hash_value = question.created_at.toString()  + "_" + Math.random().toString();
			var selector = goog.dom.createDom('input', {name: 'answer_for' + question.created_at.toString(), 
				id: hash_value, className: 'answer_option', type: 'radio', value: option, 
				target_question: question.created_at,}, option);
			var label = goog.dom.createDom('label', {for: hash_value}, option);
			label.addEventListener('click', function(){
				var element = document.getElementById(hash_value);
				element.checked = true;
			})
			var element = goog.dom.createDom('div', {}, [selector, label]);
			option_elements.push(element)
		}
		var result =  goog.dom.createDom('div', {id: 'options_holder_'+question.created_at.toString(), 
			className: 'options_holder'}, option_elements);
		return result
	}
	generate_submit_button() {
		var button = goog.dom.createDom('a', { id: 'submit_button', className: 'btn waves-effect waves-light button'}, 'Submit');
		button.addEventListener('click', function(){
			var grader = new quizGrader(this.quiz_data);
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
		var total_grade = this.current_questions.length;
		var user_grade = 0;
		var results = {};
		for (var question of this.current_questions) {
			var dummyElem = goog.dom.createDom('p', {value: Math.random()});
			var elem  = document.querySelector('input[name=answer_for'+question.created_at.toString()+']:checked') || dummyElem;
			var current_answer = elem.value
			console.log('currrent answer: ',current_answer);
			var real_answer = question.answer;
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
		var results_data = this.results.results || this.grade().results;
		for(var question_id in results_data){

			var element = document.getElementById('question_gadget_' + question_id.toString());
			if(results_data[question_id] == 'correct'){

				element.style.background = 'rgba(0, 255, 0, 0.2)';
			} else {

				element.style.background = 'rgba(255, 69, 0, 0.2)';
			}
		}
	}

	displayGrades() {
		var my_results = this.results || this.grade();
		var breakpoint = goog.dom.createDom('br');
		var feedback = 'You scored '+my_results.user_grade.toString() + ' out of '+my_results.total_grade.toString();
		var to_toast = '';

		if (my_results.user_grade != my_results.total_grade) {
			to_toast += ' You can keep guessing different answers to see which ones are correct, ' +
			'but only your first submission will be recorded and considered for the prize. ';
		}

		else {
			to_toast += ' It seems like you got all the answers correct. Cheers! ';
		}
		var toasty = goog.dom.createDom('em', {className: 'toasty'}, to_toast);
		var element = goog.dom.createDom('h5', {className: 'results-display'}, [feedback]); 
		var instructions = document.getElementById('instructions');
		instructions.innerHTML = ''
		instructions.appendChild(element);
		instructions.appendChild(toasty);
		// Sould show the values returned by this.grade() to the user
		// Should mark the right and wrong questions in the users terminal
	}

	sendGrades() {
		// Should send the grades to the server
		// the server expects data round, user_id, points, total
		var grades = this.results.user_grade || this.grade().user_grade;
		var total = this.results.total_grade || this.grade().total_grade;
		console.log('user data: ', this.user_data);
		var userId = this.user_data["id"];
		var current_round = this.quiz_data.current_status.current_round;

		var requestData = {'round': current_round, 'user_id': userId, 'points': grades, 'total': total}
		console.log('going to send ', requestData);
		XhrService.postJSON('/submit', requestData).then(function(response){Materialize.toast(response, 3000)});
	}
}


userWidgetObject = new userWidget()
userWidgetObject.createContent()

var quizHolder = document.getElementById('quizHolder')
var quizDisplayObject = new quizDisplay();
quizDisplayObject.build(quizHolder);
