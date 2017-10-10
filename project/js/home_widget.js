
goog.require('goog.dom');
goog.require('goog.events');

const title = goog.dom.createDom('h2', {'className': 'main_title'},'MIT African Students Association');
const mainLogo = goog.dom.createDom('img', {'className': 'asa_logo', 'src': '/static/asa_logo.jpg'});
const topHolder = goog.dom.createDom('div', {'className': 'top_holder'}, [/** mainLogo , **/ title]);

const textToUser = goog.dom.createDom('h6', {'className': 'text_to_user'},
	['Dear User, thank you for using MIT ASA quiz portal.' +
	'Please login to be able to take the quiz']);
const loginLogo = goog.dom.createDom('img', {'className': 'login_logo',
	'src': '/static/login_google.png'});
const linkToLogin = goog.dom.createDom('a', {'className': 'link_to_login', 'href': '/oauth2callback'},
	[loginLogo]);

const bodyHolder = goog.dom.createDom('div', {'className': 'body_holder z-depth-1'},
	[textToUser, linkToLogin]);

const bottomText = goog.dom.createDom('p1', {'className': 'bottom_text'},
	['Copyright: MIT ASA 2017. All rights reserved']);
const bottomHolder = goog.dom.createDom('div', {'className': 'bottom_holder'}, [bottomText]);

const mainHolder = goog.dom.createDom('div', {'className': 'main_holder'},
	[topHolder, bodyHolder]);
document.body.append(mainHolder);
//goog.events.listen(window, goog.events.EventType.LOAD, {document.body.append(mainHolder)});

