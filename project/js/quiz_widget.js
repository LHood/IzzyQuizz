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

class quizProcessor {
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
	generate_current_questions () {
		const quiz_status = this.current_status.quiz_status;
		if (quiz_status == 0){
			return []
		
		}
		const current_round = this.current_status.current_round;
		results = []

		for(question of this.all_questions) {
			if(question.rounds.indexOf(current_round) >=0 ) {
				results.push(question)
			
			}
		
		}
		return results;

	}
	grade_quiz() {
		const all_forms = document.getElementsByClassName('user_select_answer')
	}


	
}
userWidgetObject = new userWidget()
userWidgetObject.createContent()
