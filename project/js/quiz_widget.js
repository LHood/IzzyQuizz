console.log('quiz widget module loaded')
goog.provide('QuizWidget');
goog.require('XhrService');
goog.require('goog.dom');

function getUserData(){
	return new Promise(function(resolve, reject){
		XhrService.getJSON('/user').then(user => {resolve(user)});
	})
}

class userWidget {
	createContent(){
		getUserData().then(userData => {
			const userImage = goog.dom.createDom('img', {'src': userData.picture, 'className': 'user-image'});
			const firstName = userData.given_name;
			const fullName = userData.name;
			const nameHolder = goog.dom.createDom('div', {className: 'name-holder'}, fullName);
			const logoutButton = goog.dom.createDom('a', 
				{'className': 'logout-button waves-effect waves-light btn', href:"/logout"}, 'logout');
			const userHolder = goog.dom.createDom('div', {className: 'user-holder z-depth-1'}, [userImage, nameHolder, logoutButton]);
			const mainHolder = goog.dom.createDom('div', null, [userHolder]);
			document.body.append(mainHolder);
		});
	}
}
userWidgetObject = new userWidget()
userWidgetObject.createContent()