goog.module("IzzyQuizz.Widgets.Top");
const oauth2 = goog.require("IzzyQuizz.Services.Oauth2");
const dom = goog.require("goog.dom");

function createTopContentWithLoggedInUser(){
	if(!oauth2.isUserLoggedIn()){
		return createTopContentWithNoLoggedInUser();
	}
	const userData = oauth2.getUserData();
	const userEmail = userData.email;
	const userId = userData.id;
	const userName = userData.name;

	const welcomeMessage = dom.createDom("h3", {
		className: 'welcomeMessage',
		innerText: 'Welcome '+userName
	});
	const welcomeMessageHolder = document.getElementById('welcome-message-holder')
	welcomeMessageHolder.appendChild(welcomeMessage);
	/** We should then add the logout button and stuff
	 * We should also remember to add materialize classes as well
	 */
	return true;

}

function createTopContentWithNoLoggedInUser(){
	if(oauth2.isUserLoggedIn()){
		return createContentWithLoggedInUser();
	}
	const WelcomeMessage = dom.createDom("h3", {
		className: 'welcomeMessage',
		innerText: 'Welcome to MIT African Students Association Quiz Portal' +
		'. Please login with your gmail account to take the quiz'
	});
	/*** 
	 * We should then add the login button and stuff
	 * We should also rember to add materialize classes as well
	 */
	return true;
}

exports = {
	createTopContentWithLoggedInUser: createTopContentWithLoggedInUser,
	createTopContentWithNoLoggedInUser: createTopContentWithNoLoggedInUser
}
